import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

function BulletEditor({ onChange, placeholder }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
        },
      }),
    ],
    content: '<ul><li><p></p></li></ul>',
    editorProps: {
      attributes: {
        class:
          'prose prose-invert prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2',
      },
      handleKeyDown: (view, event) => {
        // Prevent deleting the last bullet point
        if (event.key === 'Backspace') {
          const { state } = view;
          const { selection, doc } = state;
          const bulletList = doc.firstChild;

          // If there's only one list item and cursor is at the start
          if (bulletList && bulletList.childCount === 1) {
            const firstItem = bulletList.firstChild;
            if (firstItem && selection.from <= 3) {
              // Prevent deletion of the first/only bullet
              return true;
            }
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      // Ensure there's always at least one bullet point
      const html = editor.getHTML();
      if (!html.includes('<li>')) {
        editor.commands.setContent('<ul><li><p></p></li></ul>');
      }
      onChange(html);
    },
  });

  // Auto-focus inside the first bullet point
  useEffect(() => {
    if (editor) {
      setTimeout(() => {
        // Focus at position 2 which is inside the first <li><p>
        editor.commands.focus();
        editor.commands.setTextSelection(2);
      }, 50);
    }
  }, [editor]);

  return (
    <div className="bg-slate-700 border border-slate-600 rounded-lg overflow-hidden">
      <div className="px-3 py-1.5 border-b border-slate-600 flex items-center gap-2 text-xs text-gray-400">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <circle cx="4" cy="6" r="1.5" fill="currentColor" />
          <circle cx="4" cy="12" r="1.5" fill="currentColor" />
          <circle cx="4" cy="18" r="1.5" fill="currentColor" />
        </svg>
        <span>Press Enter to add new points</span>
      </div>
      <EditorContent editor={editor} />
      <style>{`
        .ProseMirror {
          color: #c4b5fd;
          caret-color: #a78bfa;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.25rem;
          margin: 0;
        }
        .ProseMirror li {
          margin-bottom: 0.5rem;
          color: #c4b5fd;
          padding-left: 0.25rem;
        }
        .ProseMirror li::marker {
          color: #a78bfa;
        }
        .ProseMirror li p {
          margin: 0 !important;
          padding: 0 !important;
          color: #c4b5fd;
          display: inline;
        }
        .ProseMirror li p.is-empty:first-child::before {
          content: '${placeholder || "Type your key points here..."}';
          color: #7c3aed;
          opacity: 0.5;
          pointer-events: none;
        }
        .ProseMirror li > p:first-child {
          display: inline;
        }
      `}</style>
    </div>
  );
}

export default BulletEditor;
