import VoteTally from './VoteTally.jsx';
import { formatTimestamp } from '../utils/time.js';

export default function Comment({ comment, onVote }) {
  return (
    <li className="flex gap-3 py-3 border-b border-line/30 last:border-b-0">
      <VoteTally
        upvotes={comment.upvoteCount}
        downvotes={comment.downvoteCount}
        onVote={(dir) => onVote(comment.commentId, dir)}
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#ece7de]/90 leading-relaxed break-words">{comment.content}</p>
        <span className="mt-1 block text-xs text-muted">
          anonymous · {formatTimestamp(comment.createdAt)}
        </span>
      </div>
    </li>
  );
}
