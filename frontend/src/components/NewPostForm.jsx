import { useState } from 'react';

const MAX_CONTENT = 200;

export default function NewPostForm({ onCreate }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Both a title and a message are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onCreate({ title: title.trim(), content: content.trim() });
      setTitle('');
      setContent('');
      setOpen(false);
    } catch (err) {
      setError(err.message || 'Could not publish post.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left border border-dashed border-line/50 px-4 py-3 text-sm text-muted hover:text-accent hover:border-accent transition-colors"
      >
        Start a new thread, anonymously →
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-line/50 p-4 flex flex-col gap-3"
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={255}
        placeholder="Thread title"
        className="bg-transparent border-b border-line/50 pb-2 text-base font-display font-semibold text-[#ece7de] placeholder:text-muted placeholder:font-normal focus:border-accent outline-none transition-colors"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={MAX_CONTENT}
        rows={3}
        placeholder="What's on your mind? (max 200 characters)"
        className="bg-transparent border border-line/50 px-3 py-2 text-sm text-[#ece7de] placeholder:text-muted resize-none focus:border-accent outline-none transition-colors"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted tabular-nums">
          {content.length}/{MAX_CONTENT}
        </span>
        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-[#ff8a6b]">{error}</span>}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setError('');
            }}
            className="text-xs text-muted hover:text-[#ece7de] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="text-xs font-medium px-3 py-1.5 bg-accent text-ink hover:bg-accentDark transition-colors disabled:opacity-40"
          >
            {submitting ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>
    </form>
  );
}
