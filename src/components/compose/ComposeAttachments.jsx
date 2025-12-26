/**
 * Compose email attachments list
 */
function ComposeAttachments({ attachments, onRemove }) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex-shrink-0 px-6 py-3 border-t border-slate-700/50">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
        <span className="text-sm text-gray-400">
          {attachments.length} attachment{attachments.length > 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {attachments.map((att, index) => (
          <AttachmentItem
            key={index}
            attachment={att}
            onRemove={() => onRemove(index)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual attachment item
 */
function AttachmentItem({ attachment, onRemove }) {
  const sizeKB = (attachment.size / 1024).toFixed(0);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 group">
      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <polyline points="13 2 13 9 20 9" />
      </svg>
      <span className="text-sm text-gray-300 max-w-[150px] truncate">
        {attachment.filename}
      </span>
      <span className="text-xs text-gray-500">{sizeKB} KB</span>
      <button
        onClick={onRemove}
        className="p-0.5 hover:bg-slate-700 rounded text-gray-500 hover:text-red-400 transition-colors"
        title="Remove"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export default ComposeAttachments;
export { AttachmentItem };
