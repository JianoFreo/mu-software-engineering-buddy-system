export default function VoteTally({ upvotes, downvotes, onVote, size = 'md' }) {
  const dims = size === 'sm' ? 'w-9 h-8 text-xs' : 'w-11 h-10 text-sm';

  return (
    <div className="flex flex-col items-stretch shrink-0" style={{ width: size === 'sm' ? '2.25rem' : '2.75rem' }}>
      <button
        type="button"
        aria-label="Upvote"
        onClick={() => onVote('up')}
        className={`${dims} flex items-center justify-center border border-line/60 text-muted hover:text-accent hover:border-accent transition-colors duration-150`}
      >
        ▲
      </button>
      <div className={`${dims} flex flex-col items-center justify-center leading-none border-x border-line/60 gap-0.5 py-1`}>
        <span className="font-display font-semibold text-accent tabular-nums">{upvotes}</span>
        <span className="font-display text-[10px] text-muted tabular-nums">−{downvotes}</span>
      </div>
      <button
        type="button"
        aria-label="Downvote"
        onClick={() => onVote('down')}
        className={`${dims} flex items-center justify-center border border-line/60 text-muted hover:text-[#7d8bff] hover:border-[#7d8bff] transition-colors duration-150`}
      >
        ▼
      </button>
    </div>
  );
}
