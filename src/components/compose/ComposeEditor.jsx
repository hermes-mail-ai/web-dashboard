import { forwardRef } from 'react';

/**
 * Compose email editor content area
 */
const ComposeEditor = forwardRef(function ComposeEditor({
  onKeyUp,
  onMouseUp,
  execFormat,
}, ref) {
  return (
    <div className="flex-1 overflow-y-auto">
      <style>{`
        .compose-editor ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .compose-editor ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .compose-editor li {
          color: #e2e8f0;
          margin: 0.25rem 0;
        }
        .compose-editor li::marker {
          color: #9ca3af;
        }
        .compose-editor blockquote {
          border-left: 3px solid #475569;
          padding-left: 1rem;
          margin: 0.5rem 0;
          color: #9ca3af;
          font-style: italic;
        }
        .compose-editor pre {
          background: #1e293b;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          font-family: monospace;
          margin: 0.5rem 0;
        }
        .compose-editor h1 { font-size: 1.5rem; font-weight: 600; margin: 0.5rem 0; }
        .compose-editor h2 { font-size: 1.25rem; font-weight: 600; margin: 0.5rem 0; }
        .compose-editor h3 { font-size: 1.1rem; font-weight: 600; margin: 0.5rem 0; }
        .compose-editor a { color: #60a5fa; text-decoration: underline; }
      `}</style>
      <div
        ref={ref}
        contentEditable
        className="compose-editor min-h-full p-6 text-gray-200 outline-none"
        style={{
          minHeight: '300px',
          lineHeight: '1.6'
        }}
        onKeyUp={onKeyUp}
        onMouseUp={onMouseUp}
        onKeyDown={(e) => {
          // Handle tab key for indentation
          if (e.key === 'Tab') {
            e.preventDefault();
            execFormat('insertText', '\t');
          }
        }}
      />
    </div>
  );
});

export default ComposeEditor;
