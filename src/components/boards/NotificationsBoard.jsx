import { formatEmailDate, getInitials } from '../../utils/formatters';

/**
 * Notifications board component - displays notification emails
 */
function NotificationsBoard({
  notifications = [],
  onSelectEmail,
  onDismiss,
}) {
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="flex-1 overflow-y-auto p-6" data-tour="notifications-board">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-4">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-1">Notifications</h2>
          <p className="text-gray-500 text-sm">
            {unreadCount === 0
              ? 'All caught up!'
              : `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-gray-400">No new notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <NotificationCard
                key={notif.id}
                notification={notif}
                onClick={() => onSelectEmail?.(notif)}
                onDismiss={onDismiss}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Individual notification card component
 */
function NotificationCard({ notification, onClick, onDismiss }) {
  const handleDismiss = (e) => {
    e.stopPropagation();
    onDismiss?.(e, notification);
  };

  return (
    <div
      onClick={onClick}
      className="group relative p-4 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-800/40 border border-slate-700/50 hover:border-blue-500/30 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5"
    >
      {/* Unread indicator dot */}
      {!notification.is_read && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
      )}

      <div className="flex items-start gap-4 pl-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-white">
            {getInitials(notification.from_name || notification.from_email)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Sender & Date */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-medium text-white truncate">
              {notification.from_name || notification.from_email}
            </p>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {formatEmailDate(notification.date)}
            </span>
          </div>

          {/* Subject */}
          <p className="text-sm text-gray-300 truncate mb-1">
            {notification.subject}
          </p>

          {/* Summary */}
          {notification.analysis?.summary && (
            <p className="text-xs text-gray-400 line-clamp-2">
              {Array.isArray(notification.analysis.summary)
                ? notification.analysis.summary.join(' • ')
                : notification.analysis.summary}
            </p>
          )}
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="p-2 text-gray-500 hover:text-white hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
            title="Dismiss"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default NotificationsBoard;
export { NotificationCard };
