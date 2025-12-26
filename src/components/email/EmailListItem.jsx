import { formatEmailDate } from '../../utils/formatters';

/**
 * Individual email list item component
 */
function EmailListItem({
  email,
  isSelected = false,
  onClick,
  showPriority = true,
}) {
  const isUnread = !email.is_read;

  return (
    <div
      onClick={() => onClick?.(email)}
      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-slate-800'
          : isUnread
          ? 'bg-slate-900 hover:bg-slate-800/50'
          : 'hover:bg-slate-800/30'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-sm truncate ${isUnread ? 'font-semibold text-gray-100' : 'text-gray-300'}`}>
            {email.from_name || email.from_email || 'Unknown'}
          </p>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {formatEmailDate(email.date)}
          </span>
        </div>
        <p className={`text-sm truncate ${isUnread ? 'font-medium text-gray-200' : 'text-gray-400'}`}>
          {email.subject || '(no subject)'}
        </p>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-xs text-gray-500 truncate flex-1">
            {email.snippet}
          </p>
          {showPriority && email.analysis?.priority && (
            <PriorityBadge priority={email.analysis.priority} />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Priority badge component
 */
function PriorityBadge({ priority }) {
  const colorClasses = {
    high: 'bg-red-500/20 text-red-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    low: 'bg-slate-700 text-gray-400',
  };

  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${colorClasses[priority] || colorClasses.low}`}>
      {priority}
    </span>
  );
}

export default EmailListItem;
export { PriorityBadge };
