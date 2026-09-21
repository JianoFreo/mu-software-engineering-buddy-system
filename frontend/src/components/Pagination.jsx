export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 py-8 text-sm">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="text-muted hover:text-accent disabled:opacity-30 disabled:hover:text-muted transition-colors"
      >
        ← Prev
      </button>
      <span className="text-muted tabular-nums">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="text-muted hover:text-accent disabled:opacity-30 disabled:hover:text-muted transition-colors"
      >
        Next →
      </button>
    </div>
  );
}
