import EmailListItem from './EmailListItem';
import EmptyState from '../EmptyState';

/**
 * Email list container component
 */
function EmailList({
  emails,
  selectedEmail,
  onSelectEmail,
  loading = false,
  emptyState = null,
}) {
  if (loading) {
    return (
      <div className="divide-y divide-slate-700/50 animate-pulse">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-start gap-3 px-4 py-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="h-4 bg-slate-700 rounded w-32" />
                <div className="h-3 bg-slate-700 rounded w-12" />
              </div>
              <div className="h-4 bg-slate-700 rounded w-48 mb-2" />
              <div className="h-3 bg-slate-700 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!emails || emails.length === 0) {
    if (emptyState) {
      return <EmptyState {...emptyState} />;
    }
    return (
      <EmptyState
        icon={
          <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        }
        title="No emails"
        description="Your inbox is empty."
      />
    );
  }

  return (
    <div className="divide-y divide-slate-700/50">
      {emails.map((email) => (
        <EmailListItem
          key={email.id}
          email={email}
          isSelected={selectedEmail?.id === email.id}
          onClick={onSelectEmail}
        />
      ))}
    </div>
  );
}

export default EmailList;
