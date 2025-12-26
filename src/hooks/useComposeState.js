import { useState, useRef, useCallback } from 'react';

/**
 * Hook for managing compose email form state
 */
export function useComposeState() {
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState([]);
  const [composeCc, setComposeCc] = useState([]);
  const [composeBcc, setComposeBcc] = useState([]);
  const [composeSubject, setComposeSubject] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [showCcBccMenu, setShowCcBccMenu] = useState(false);
  const [composeAttachments, setComposeAttachments] = useState([]);
  const [isForwarding, setIsForwarding] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  // Reset all compose state
  const resetCompose = useCallback(() => {
    setShowCompose(false);
    setIsForwarding(false);
    setComposeTo([]);
    setComposeCc([]);
    setComposeBcc([]);
    setComposeSubject('');
    setShowCc(false);
    setShowBcc(false);
    setShowCcBccMenu(false);
    setComposeAttachments([]);
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  }, []);

  // Open compose for new message
  const openCompose = useCallback(() => {
    setShowCompose(true);
    setIsForwarding(false);
    setComposeTo([]);
    setComposeCc([]);
    setComposeBcc([]);
    setComposeSubject('');
    setShowCc(false);
    setShowBcc(false);
    setShowCcBccMenu(false);
    setComposeAttachments([]);
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  }, []);

  // Handle file selection for attachments
  const handleFileSelect = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newAttachments = await Promise.all(
      files.map(async (file) => {
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
          };
          reader.readAsDataURL(file);
        });

        return {
          filename: file.name,
          content_type: file.type || 'application/octet-stream',
          data: base64,
          size: file.size,
        };
      })
    );

    setComposeAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Remove attachment by index
  const removeAttachment = useCallback((index) => {
    setComposeAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Helper to convert contact array to email string
  const contactsToEmailString = useCallback((contacts) => {
    return contacts.map((c) => c.email).join(', ');
  }, []);

  // Helper to convert email string to contact array
  const emailStringToContacts = useCallback((emailStr) => {
    if (!emailStr) return [];
    return emailStr.split(',').map((e) => e.trim()).filter(Boolean).map((email) => ({
      email,
      display_name: null,
    }));
  }, []);

  return {
    // State
    showCompose,
    setShowCompose,
    composeTo,
    setComposeTo,
    composeCc,
    setComposeCc,
    composeBcc,
    setComposeBcc,
    composeSubject,
    setComposeSubject,
    showCc,
    setShowCc,
    showBcc,
    setShowBcc,
    showCcBccMenu,
    setShowCcBccMenu,
    composeAttachments,
    setComposeAttachments,
    isForwarding,
    setIsForwarding,
    sendingEmail,
    setSendingEmail,
    // Refs
    editorRef,
    fileInputRef,
    // Actions
    resetCompose,
    openCompose,
    handleFileSelect,
    removeAttachment,
    // Helpers
    contactsToEmailString,
    emailStringToContacts,
  };
}

export default useComposeState;
