import { useRef, useState, useEffect } from 'react';
import ComposeHeader from './ComposeHeader';
import ComposeRecipients from './ComposeRecipients';
import ComposeSubject from './ComposeSubject';
import ComposeToolbar from './ComposeToolbar';
import ComposeEditor from './ComposeEditor';
import ComposeAttachments from './ComposeAttachments';

/**
 * Compose email modal - brings together all compose sub-components
 */
function ComposeModal({
  isForwarding,
  sendingEmail,
  savingDraft,
  error,
  showErrorModal,
  // Recipients
  composeTo,
  setComposeTo,
  composeCc,
  setComposeCc,
  composeBcc,
  setComposeBcc,
  showCc,
  setShowCc,
  showBcc,
  setShowBcc,
  showCcBccMenu,
  setShowCcBccMenu,
  // Subject
  composeSubject,
  setComposeSubject,
  // Attachments
  composeAttachments,
  removeAttachment,
  // Account
  accountId,
  // Actions
  onSend,
  onSaveDraft,
  onClose,
  onAttachClick,
  onAIComposeClick,
  // Editor ref (passed from parent for access to content)
  editorRef,
}) {
  const [editorFormats, setEditorFormats] = useState({});

  // Rich text editor formatting functions
  const updateEditorFormats = () => {
    setEditorFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
    });
  };

  const execFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateEditorFormats();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* API Error Message (not validation errors) */}
      {error && !showErrorModal && (
        <div className="flex-shrink-0 bg-red-900/30 border-l-4 border-red-500 p-4 m-4 rounded">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <ComposeHeader
        isForwarding={isForwarding}
        sendingEmail={sendingEmail}
        savingDraft={savingDraft}
        onSend={onSend}
        onSaveDraft={onSaveDraft}
        onClose={onClose}
      />

      <ComposeRecipients
        composeTo={composeTo}
        setComposeTo={setComposeTo}
        composeCc={composeCc}
        setComposeCc={setComposeCc}
        composeBcc={composeBcc}
        setComposeBcc={setComposeBcc}
        showCc={showCc}
        setShowCc={setShowCc}
        showBcc={showBcc}
        setShowBcc={setShowBcc}
        showCcBccMenu={showCcBccMenu}
        setShowCcBccMenu={setShowCcBccMenu}
        accountId={accountId}
      />

      <ComposeSubject
        value={composeSubject}
        onChange={setComposeSubject}
      />

      <ComposeToolbar
        editorFormats={editorFormats}
        execFormat={execFormat}
        onAttachClick={onAttachClick}
        onAIComposeClick={onAIComposeClick}
        hasRecipients={composeTo.length > 0}
      />

      <ComposeEditor
        ref={editorRef}
        onKeyUp={updateEditorFormats}
        onMouseUp={updateEditorFormats}
        execFormat={execFormat}
      />

      <ComposeAttachments
        attachments={composeAttachments}
        onRemove={removeAttachment}
      />
    </div>
  );
}

export default ComposeModal;
