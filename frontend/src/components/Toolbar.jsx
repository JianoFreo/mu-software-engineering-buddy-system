const SORTS = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'top', label: 'Most upvoted' },
];

export default function Toolbar({ search, onSearchChange, sort, onSortChange }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 border-b border-line/40">
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search threads…"
        className="flex-1 bg-transparent border border-line/50 px-3 py-2 text-sm text-[#ece7de] placeholder:text-muted focus:border-accent outline-none transition-colors"
      />
      <div className="flex items-center gap-1 text-xs">
        {SORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => onSortChange(s.key)}
            className={`px-2.5 py-1.5 border transition-colors ${
              sort === s.key
                ? 'border-accent text-accent'
                : 'border-line/50 text-muted hover:text-[#ece7de]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
