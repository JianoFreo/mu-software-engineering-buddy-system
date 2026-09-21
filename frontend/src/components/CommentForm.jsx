import { useState } from 'react';

const MAX_LEN = 500;

export default function CommentForm({ onSubmit }) {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Say something first.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(trimmed);
      setValue('');
    } catch (err) {
      setError(err.message || 'Could not post comment.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 pt-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={MAX_LEN}
        rows={2}
        placeholder="Reply anonymously..."
        className="w-full resize-none bg-transparent border border-line/50 px-3 py-2 text-sm text-[#ece7de] placeholder:text-muted focus:border-accent outline-none transition-colors"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted tabular-nums">
          {value.length}/{MAX_LEN}
        </span>
        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-[#ff8a6b]">{error}</span>}
          <button
            type="submit"
            disabled={submitting}
            className="text-xs font-medium tracking-wide px-3 py-1.5 border border-accent text-accent hover:bg-accent hover:text-ink transition-colors disabled:opacity-40"
          >
            {submitting ? 'Posting…' : 'Reply'}
          </button>
        </div>
      </div>
    </form>
  );
}
