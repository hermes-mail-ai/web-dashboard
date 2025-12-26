import { useRef } from 'react';

/**
 * Rich text formatting toolbar for compose editor
 */
function ComposeToolbar({
  editorFormats,
  execFormat,
  onAttachClick,
  onAIComposeClick,
  hasRecipients,
}) {
  return (
    <div className="flex-shrink-0 flex items-center gap-1 px-6 py-2 border-b border-slate-700/50 flex-wrap">
      {/* Text Formatting */}
      <ToolbarButton
        onClick={() => execFormat('bold')}
        active={editorFormats.bold}
        title="Bold"
      >
        <span className="font-bold text-sm">B</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => execFormat('italic')}
        active={editorFormats.italic}
        title="Italic"
      >
        <span className="italic text-sm">I</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => execFormat('underline')}
        active={editorFormats.underline}
        title="Underline"
      >
        <span className="underline text-sm">U</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => execFormat('strikeThrough')}
        active={editorFormats.strikeThrough}
        title="Strikethrough"
      >
        <span className="line-through text-sm">S</span>
      </ToolbarButton>

      <Divider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => execFormat('insertUnorderedList')}
        active={editorFormats.insertUnorderedList}
        title="Bullet List"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="9" y1="6" x2="20" y2="6" />
          <line x1="9" y1="12" x2="20" y2="12" />
          <line x1="9" y1="18" x2="20" y2="18" />
          <circle cx="4" cy="6" r="1" fill="currentColor" />
          <circle cx="4" cy="12" r="1" fill="currentColor" />
          <circle cx="4" cy="18" r="1" fill="currentColor" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => execFormat('insertOrderedList')}
        active={editorFormats.insertOrderedList}
        title="Numbered List"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="10" y1="6" x2="20" y2="6" />
          <line x1="10" y1="12" x2="20" y2="12" />
          <line x1="10" y1="18" x2="20" y2="18" />
          <text x="3" y="8" fontSize="8" fill="currentColor">1</text>
          <text x="3" y="14" fontSize="8" fill="currentColor">2</text>
          <text x="3" y="20" fontSize="8" fill="currentColor">3</text>
        </svg>
      </ToolbarButton>

      <Divider />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => execFormat('justifyLeft')}
        active={editorFormats.justifyLeft}
        title="Align Left"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="15" y2="12" />
          <line x1="3" y1="18" x2="18" y2="18" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => execFormat('justifyCenter')}
        active={editorFormats.justifyCenter}
        title="Align Center"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="6" y1="12" x2="18" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => execFormat('justifyRight')}
        active={editorFormats.justifyRight}
        title="Align Right"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="9" y1="12" x2="21" y2="12" />
          <line x1="6" y1="18" x2="21" y2="18" />
        </svg>
      </ToolbarButton>

      <Divider />

      {/* Headings */}
      <button
        onClick={() => execFormat('formatBlock', 'h1')}
        className="px-2 py-1 hover:bg-slate-700 rounded transition-colors text-gray-400 hover:text-white text-xs font-bold"
        title="Heading 1"
      >
        H1
      </button>
      <button
        onClick={() => execFormat('formatBlock', 'h2')}
        className="px-2 py-1 hover:bg-slate-700 rounded transition-colors text-gray-400 hover:text-white text-xs font-bold"
        title="Heading 2"
      >
        H2
      </button>
      <button
        onClick={() => execFormat('formatBlock', 'h3')}
        className="px-2 py-1 hover:bg-slate-700 rounded transition-colors text-gray-400 hover:text-white text-xs font-bold"
        title="Heading 3"
      >
        H3
      </button>

      <Divider />

      {/* Quote & Code */}
      <ToolbarButton
        onClick={() => execFormat('formatBlock', 'blockquote')}
        title="Quote"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => execFormat('formatBlock', 'pre')}
        title="Code Block"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </ToolbarButton>

      <Divider />

      {/* Link */}
      <ToolbarButton
        onClick={() => {
          const url = prompt('Enter URL:');
          if (url) execFormat('createLink', url);
        }}
        title="Insert Link"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </ToolbarButton>

      <Divider />

      {/* Undo/Redo */}
      <ToolbarButton onClick={() => execFormat('undo')} title="Undo">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 7v6h6" />
          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
        </svg>
      </ToolbarButton>
      <ToolbarButton onClick={() => execFormat('redo')} title="Redo">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 7v6h-6" />
          <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
        </svg>
      </ToolbarButton>

      <Divider />

      {/* Attachment */}
      <ToolbarButton onClick={onAttachClick} title="Attach files">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
      </ToolbarButton>

      <Divider />

      {/* AI Compose */}
      <button
        onClick={onAIComposeClick}
        disabled={!hasRecipients}
        className={`p-2 rounded transition-colors ${
          hasRecipients
            ? 'hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-blue-600/20 text-purple-400 hover:text-purple-300'
            : 'text-gray-600 cursor-not-allowed'
        }`}
        title={hasRecipients ? 'AI Compose' : 'Enter recipient first'}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19 13M17.8 6.2L19 5M3 21l9-9M12.2 6.2L11 5" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Toolbar button component
 */
function ToolbarButton({ onClick, active, title, children }) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded transition-colors ${
        active
          ? 'bg-slate-600 text-white'
          : 'hover:bg-slate-700 text-gray-400 hover:text-white'
      }`}
      title={title}
    >
      {children}
    </button>
  );
}

/**
 * Vertical divider
 */
function Divider() {
  return <div className="w-px h-5 bg-slate-600 mx-1" />;
}

export default ComposeToolbar;
