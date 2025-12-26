import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

function BulletEditor({ onChange, placeholder }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<ul><li></li></ul>',
    editorProps: {
      attributes: {
        class:
          'prose prose-invert prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Auto-focus and ensure we're in a bullet list on mount
  useEffect(() => {
    if (editor) {
      setTimeout(() => {
        editor.commands.focus('end');
      }, 100);
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
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0;
        }
        .ProseMirror li {
          margin-bottom: 0.25rem;
        }
        .ProseMirror li::marker {
          color: #60a5fa;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: '${placeholder || "Type your key points here..."}';
          color: #6b7280;
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror li > p {
          margin: 0;
        }
      `}</style>
    </div>
  );
}

export default BulletEditor;
