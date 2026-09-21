import { pool } from '../db/pool.js';

const VALID_SORTS = {
  newest: 'p.created_at DESC',
  oldest: 'p.created_at ASC',
  top: 'p.upvote_count DESC, p.created_at DESC',
};

// GET /api/posts?page=1&limit=10&sort=newest&search=react
export async function getPosts(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const offset = (page - 1) * limit;
    const sortKey = VALID_SORTS[req.query.sort] ? req.query.sort : 'newest';
    const orderBy = VALID_SORTS[sortKey];
    const search = (req.query.search || '').trim();

    const params = [];
    let whereClause = '';
    if (search) {
      params.push(`%${search}%`);
      whereClause = `WHERE p.title ILIKE $${params.length} OR p.content ILIKE $${params.length}`;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM posts p ${whereClause}`,
      params
    );
    const total = countResult.rows[0].total;

    params.push(limit);
    params.push(offset);
    const postsResult = await pool.query(
      `SELECT p.id, p.title, p.content, p.created_at, p.upvote_count, p.downvote_count,
              COALESCE(c.comment_count, 0)::int AS comment_count
       FROM posts p
       LEFT JOIN (
         SELECT post_id, COUNT(*) AS comment_count FROM comments GROUP BY post_id
       ) c ON c.post_id = p.id
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      posts: postsResult.rows.map(formatPost),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (err) {
    console.error('getPosts error:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
}

// GET /api/posts/:id  (includes comments)
export async function getPostById(req, res) {
  try {
    const { id } = req.params;
    const postResult = await pool.query(
      `SELECT p.id, p.title, p.content, p.created_at, p.upvote_count, p.downvote_count,
              COALESCE(c.comment_count, 0)::int AS comment_count
       FROM posts p
       LEFT JOIN (
         SELECT post_id, COUNT(*) AS comment_count FROM comments GROUP BY post_id
       ) c ON c.post_id = p.id
       WHERE p.id = $1`,
      [id]
    );
    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const commentsResult = await pool.query(
      `SELECT id, post_id, content, created_at, upvote_count, downvote_count
       FROM comments WHERE post_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    const post = formatPost(postResult.rows[0]);
    post.comments = commentsResult.rows.map(formatComment);
    res.json(post);
  } catch (err) {
    console.error('getPostById error:', err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
}

// POST /api/posts
export async function createPost(req, res) {
  try {
    const { title, content } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }
    if (content.length > 200) {
      return res.status(400).json({ error: 'Content must be 200 characters or fewer' });
    }
    if (title.length > 255) {
      return res.status(400).json({ error: 'Title must be 255 characters or fewer' });
    }

    const result = await pool.query(
      `INSERT INTO posts (title, content) VALUES ($1, $2)
       RETURNING id, title, content, created_at, upvote_count, downvote_count`,
      [title.trim(), content.trim()]
    );

    const post = formatPost(result.rows[0]);
    post.commentCount = 0;
    res.status(201).json(post);
  } catch (err) {
    console.error('createPost error:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
}

// PATCH /api/posts/:id  (edit title only)
export async function updatePostTitle(req, res) {
  try {
    const { id } = req.params;
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (title.length > 255) {
      return res.status(400).json({ error: 'Title must be 255 characters or fewer' });
    }

    const result = await pool.query(
      `UPDATE posts SET title = $1 WHERE id = $2
       RETURNING id, title, content, created_at, upvote_count, downvote_count`,
      [title.trim(), id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(formatPost(result.rows[0]));
  } catch (err) {
    console.error('updatePostTitle error:', err);
    res.status(500).json({ error: 'Failed to update post' });
  }
}

// DELETE /api/posts/:id
export async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('deletePost error:', err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
}

// POST /api/posts/:id/vote  { direction: 'up' | 'down' }
export async function votePost(req, res) {
  try {
    const { id } = req.params;
    const { direction } = req.body;
    if (direction !== 'up' && direction !== 'down') {
      return res.status(400).json({ error: "direction must be 'up' or 'down'" });
    }
    const column = direction === 'up' ? 'upvote_count' : 'downvote_count';
    const result = await pool.query(
      `UPDATE posts SET ${column} = ${column} + 1 WHERE id = $1
       RETURNING id, title, content, created_at, upvote_count, downvote_count`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(formatPost(result.rows[0]));
  } catch (err) {
    console.error('votePost error:', err);
    res.status(500).json({ error: 'Failed to vote on post' });
  }
}

function formatPost(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
    upvoteCount: row.upvote_count,
    downvoteCount: row.downvote_count,
    commentCount: row.comment_count !== undefined ? row.comment_count : undefined,
  };
}

export function formatComment(row) {
  return {
    commentId: row.id,
    postId: row.post_id,
    content: row.content,
    createdAt: row.created_at,
    upvoteCount: row.upvote_count,
    downvoteCount: row.downvote_count,
  };
}
