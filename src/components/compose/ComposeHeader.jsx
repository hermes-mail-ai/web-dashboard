/**
 * Compose email header with title and action buttons
 */
function ComposeHeader({
  isForwarding,
  sendingEmail,
  savingDraft,
  onSend,
  onSaveDraft,
  onClose,
}) {
  return (
    <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-700">
      <h2 className="text-lg font-medium text-white">
        {isForwarding ? 'Forward' : 'New Message'}
      </h2>
      <div className="flex items-center gap-2">
        <button
          onClick={onSend}
          disabled={sendingEmail}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sendingEmail ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
              Send
            </>
          )}
        </button>
        <button
          onClick={onSaveDraft}
          disabled={savingDraft}
          className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg text-sm transition-colors disabled:opacity-50"
          title="Save Draft"
        >
          {savingDraft ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          )}
          {savingDraft ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          title="Close"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ComposeHeader;
