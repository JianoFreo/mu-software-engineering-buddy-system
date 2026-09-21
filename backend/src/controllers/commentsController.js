import { pool } from '../db/pool.js';
import { formatComment } from './postsController.js';

// GET /api/posts/:postId/comments
export async function getCommentsForPost(req, res) {
  try {
    const { postId } = req.params;
    const result = await pool.query(
      `SELECT id, post_id, content, created_at, upvote_count, downvote_count
       FROM comments WHERE post_id = $1 ORDER BY created_at DESC`,
      [postId]
    );
    res.json(result.rows.map(formatComment));
  } catch (err) {
    console.error('getCommentsForPost error:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
}

// POST /api/posts/:postId/comments
export async function createComment(req, res) {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }
    if (content.length > 500) {
      return res.status(400).json({ error: 'Content must be 500 characters or fewer' });
    }

    const postCheck = await pool.query('SELECT id FROM posts WHERE id = $1', [postId]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const result = await pool.query(
      `INSERT INTO comments (post_id, content) VALUES ($1, $2)
       RETURNING id, post_id, content, created_at, upvote_count, downvote_count`,
      [postId, content.trim()]
    );
    res.status(201).json(formatComment(result.rows[0]));
  } catch (err) {
    console.error('createComment error:', err);
    res.status(500).json({ error: 'Failed to create comment' });
  }
}

// POST /api/comments/:id/vote  { direction: 'up' | 'down' }
export async function voteComment(req, res) {
  try {
    const { id } = req.params;
    const { direction } = req.body;
    if (direction !== 'up' && direction !== 'down') {
      return res.status(400).json({ error: "direction must be 'up' or 'down'" });
    }
    const column = direction === 'up' ? 'upvote_count' : 'downvote_count';
    const result = await pool.query(
      `UPDATE comments SET ${column} = ${column} + 1 WHERE id = $1
       RETURNING id, post_id, content, created_at, upvote_count, downvote_count`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.json(formatComment(result.rows[0]));
  } catch (err) {
    console.error('voteComment error:', err);
    res.status(500).json({ error: 'Failed to vote on comment' });
  }
}
