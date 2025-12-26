import { useState, useRef, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Hook for managing email drafts with auto-save
 */
export function useDraftManagement({
  accountId,
  composeTo,
  composeCc,
  composeBcc,
  composeSubject,
  composeAttachments,
  editorRef,
  showCompose,
  contactsToEmailString,
  onToast,
}) {
  const [drafts, setDrafts] = useState([]);
  const [currentDraftId, setCurrentDraftId] = useState(null);
  const [savingDraft, setSavingDraft] = useState(false);

  const draftAutoSaveTimerRef = useRef(null);
  const lastSavedContentRef = useRef('');

  // Load drafts for the current account
  const loadDrafts = useCallback(async () => {
    if (!accountId) return;
    try {
      const res = await api.get(`/api/v1/drafts/${accountId}`);
      setDrafts(res.data.drafts || []);
    } catch (err) {
      console.error('Failed to load drafts:', err);
    }
  }, [accountId]);

  // Save draft (create or update)
  const saveDraft = useCallback(async (showNotification = true) => {
    if (!accountId) return null;

    const htmlContent = editorRef.current?.innerHTML || '';
    const toEmails = contactsToEmailString(composeTo);
    const ccEmails = contactsToEmailString(composeCc);
    const bccEmails = contactsToEmailString(composeBcc);

    // Build content signature for comparison
    const contentSignature = JSON.stringify({
      to: toEmails,
      cc: ccEmails,
      bcc: bccEmails,
      subject: composeSubject,
      body: htmlContent,
    });

    // Skip if content hasn't changed
    if (contentSignature === lastSavedContentRef.current) {
      return currentDraftId;
    }

    // Skip if compose is empty
    if (!toEmails && !ccEmails && !bccEmails &&
        !composeSubject.trim() && !htmlContent.trim()) {
      return null;
    }

    setSavingDraft(true);
    try {
      const payload = {
        to_email: toEmails || null,
        cc_email: ccEmails || null,
        bcc_email: bccEmails || null,
        subject: composeSubject.trim() || null,
        body_html: htmlContent || null,
        attachments: composeAttachments.length > 0
          ? JSON.stringify(composeAttachments.map(a => ({ filename: a.filename, content_type: a.content_type })))
          : null,
      };

      let draftId = currentDraftId;

      if (currentDraftId) {
        await api.put(`/api/v1/drafts/${accountId}/${currentDraftId}`, payload);
      } else {
        const res = await api.post(`/api/v1/drafts/${accountId}`, payload);
        draftId = res.data.id;
        setCurrentDraftId(draftId);
      }

      lastSavedContentRef.current = contentSignature;

      if (showNotification && onToast) {
        onToast({ show: true, message: 'Draft saved', type: 'success' });
      }

      await loadDrafts();
      return draftId;
    } catch (err) {
      console.error('Failed to save draft:', err);
      if (showNotification && onToast) {
        onToast({ show: true, message: 'Failed to save draft', type: 'error' });
      }
      return null;
    } finally {
      setSavingDraft(false);
    }
  }, [
    accountId,
    composeTo,
    composeCc,
    composeBcc,
    composeSubject,
    composeAttachments,
    editorRef,
    currentDraftId,
    contactsToEmailString,
    onToast,
    loadDrafts,
  ]);

  // Delete a draft
  const deleteDraft = useCallback(async (draftId) => {
    if (!draftId || !accountId) return;
    try {
      await api.delete(`/api/v1/drafts/${accountId}/${draftId}`);
      await loadDrafts();
    } catch (err) {
      console.error('Failed to delete draft:', err);
    }
  }, [accountId, loadDrafts]);

  // Reset draft state
  const resetDraft = useCallback(() => {
    setCurrentDraftId(null);
    lastSavedContentRef.current = '';
    if (draftAutoSaveTimerRef.current) {
      clearInterval(draftAutoSaveTimerRef.current);
      draftAutoSaveTimerRef.current = null;
    }
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (!showCompose) return;

    draftAutoSaveTimerRef.current = setInterval(() => {
      saveDraft(false);
    }, 30000);

    return () => {
      if (draftAutoSaveTimerRef.current) {
        clearInterval(draftAutoSaveTimerRef.current);
        draftAutoSaveTimerRef.current = null;
      }
    };
  }, [showCompose, saveDraft]);

  // Load drafts when account changes
  useEffect(() => {
    if (accountId) {
      loadDrafts();
    }
  }, [accountId, loadDrafts]);

  return {
    drafts,
    currentDraftId,
    setCurrentDraftId,
    savingDraft,
    lastSavedContentRef,
    loadDrafts,
    saveDraft,
    deleteDraft,
    resetDraft,
  };
}

export default useDraftManagement;
