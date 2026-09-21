import { useState } from 'react';
import VoteTally from './VoteTally.jsx';
import Comment from './Comment.jsx';
import CommentForm from './CommentForm.jsx';
import { formatTimestamp } from '../utils/time.js';
import * as api from '../api/forum.js';

export default function PostCard({ post, onChange, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState(post.comments || null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [editing, setEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(post.title);
  const [busy, setBusy] = useState(false);

  async function toggleComments() {
    const next = !expanded;
    setExpanded(next);
    if (next && comments === null) {
      setLoadingComments(true);
      try {
        const data = await api.fetchComments(post.id);
        setComments(data);
      } catch {
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    }
  }

  async function handleVotePost(direction) {
    try {
      const updated = await api.votePost(post.id, direction);
      onChange({ ...post, upvoteCount: updated.upvoteCount, downvoteCount: updated.downvoteCount });
    } catch {
      // silent fail is acceptable for a vote tick; could add toast
    }
  }

  async function handleVoteComment(commentId, direction) {
    try {
      const updated = await api.voteComment(commentId, direction);
      setComments((prev) =>
        prev.map((c) =>
          c.commentId === commentId
            ? { ...c, upvoteCount: updated.upvoteCount, downvoteCount: updated.downvoteCount }
            : c
        )
      );
    } catch {
      // ignore
    }
  }

  async function handleAddComment(content) {
    const created = await api.createComment(post.id, content);
    setComments((prev) => [created, ...(prev || [])]);
    onChange({ ...post, commentCount: (post.commentCount || 0) + 1 });
    setExpanded(true);
  }

  async function saveTitle() {
    const trimmed = titleDraft.trim();
    if (!trimmed || trimmed === post.title) {
      setEditing(false);
      setTitleDraft(post.title);
      return;
    }
    setBusy(true);
    try {
      const updated = await api.updatePostTitle(post.id, trimmed);
      onChange({ ...post, title: updated.title });
      setEditing(false);
    } catch (err) {
      setTitleDraft(post.title);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    setBusy(true);
    try {
      await api.deletePost(post.id);
      onRemove(post.id);
    } catch {
      setBusy(false);
    }
  }

  const commentCount = comments !== null ? comments.length : post.commentCount;

  return (
    <article className="border-b border-line/40 py-6 flex gap-4">
      <VoteTally
        upvotes={post.upvoteCount}
        downvotes={post.downvoteCount}
        onVote={handleVotePost}
      />

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-2 mb-1">
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              maxLength={255}
              className="flex-1 bg-transparent border-b border-accent text-lg font-display font-semibold text-[#ece7de] outline-none py-0.5"
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveTitle();
                if (e.key === 'Escape') {
                  setEditing(false);
                  setTitleDraft(post.title);
                }
              }}
            />
            <button
              onClick={saveTitle}
              disabled={busy}
              className="text-xs px-2 py-1 border border-accent text-accent hover:bg-accent hover:text-ink transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setTitleDraft(post.title);
              }}
              className="text-xs px-2 py-1 text-muted hover:text-[#ece7de] transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <h2 className="text-lg font-display font-semibold text-[#ece7de] leading-snug mb-1 break-words">
            {post.title}
          </h2>
        )}

        <p className="text-sm text-[#ece7de]/80 leading-relaxed mb-2 break-words">{post.content}</p>

        <div className="flex items-center gap-4 text-xs text-muted">
          <span>anonymous · {formatTimestamp(post.createdAt)}</span>
          <button
            onClick={toggleComments}
            className="hover:text-accent transition-colors underline decoration-dotted underline-offset-4"
          >
            {commentCount} {commentCount === 1 ? 'comment' : 'comments'} {expanded ? '– hide' : '– show'}
          </button>
          {!editing && (
            <button onClick={() => setEditing(true)} className="hover:text-accent transition-colors">
              edit title
            </button>
          )}
          <button onClick={handleDelete} disabled={busy} className="hover:text-[#ff8a6b] transition-colors">
            delete
          </button>
        </div>

        {expanded && (
          <div className="mt-3 pl-1 border-l border-line/40 pl-4">
            <CommentForm onSubmit={handleAddComment} />
            {loadingComments && <p className="text-xs text-muted py-3">Loading replies…</p>}
            {!loadingComments && comments && comments.length === 0 && (
              <p className="text-xs text-muted py-3">No replies yet. Be the first.</p>
            )}
            {!loadingComments && comments && comments.length > 0 && (
              <ul className="mt-1">
                {comments.map((c) => (
                  <Comment key={c.commentId} comment={c} onVote={handleVoteComment} />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
