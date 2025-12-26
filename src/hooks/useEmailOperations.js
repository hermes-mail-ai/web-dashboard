import { useCallback } from 'react';
import api from '../services/api';

/**
 * Hook for email operations (star, archive, delete, etc.)
 */
export function useEmailOperations({
  updateEmail,
  removeEmail,
  selectedEmail,
  setSelectedEmail,
  setEmailBody,
  onToast,
}) {
  // Toggle star on an email
  const handleToggleStar = useCallback(async (email) => {
    try {
      if (email.is_starred) {
        await api.delete(`/api/v1/emails/${email.id}/star`);
      } else {
        await api.post(`/api/v1/emails/${email.id}/star`);
      }

      updateEmail(email.id, { is_starred: !email.is_starred });

      if (selectedEmail?.id === email.id) {
        setSelectedEmail(prev => ({ ...prev, is_starred: !prev.is_starred }));
      }

      onToast?.({
        show: true,
        message: email.is_starred ? 'Star removed' : 'Email starred',
        type: 'success'
      });
    } catch (err) {
      console.error('Failed to toggle star:', err);
      onToast?.({ show: true, message: 'Failed to update star', type: 'error' });
    }
  }, [updateEmail, selectedEmail, setSelectedEmail, onToast]);

  // Archive an email
  const handleArchive = useCallback(async (email) => {
    try {
      await api.post(`/api/v1/emails/${email.id}/archive`);

      removeEmail(email.id);

      if (selectedEmail?.id === email.id) {
        setSelectedEmail(null);
        setEmailBody?.(null);
      }

      onToast?.({ show: true, message: 'Email archived', type: 'success' });
    } catch (err) {
      console.error('Failed to archive email:', err);
      onToast?.({ show: true, message: 'Failed to archive email', type: 'error' });
    }
  }, [removeEmail, selectedEmail, setSelectedEmail, setEmailBody, onToast]);

  // Delete/trash an email
  const handleDelete = useCallback(async (email) => {
    try {
      await api.post(`/api/v1/emails/${email.id}/trash`);

      removeEmail(email.id);

      if (selectedEmail?.id === email.id) {
        setSelectedEmail(null);
        setEmailBody?.(null);
      }

      onToast?.({ show: true, message: 'Email moved to trash', type: 'success' });
    } catch (err) {
      console.error('Failed to delete email:', err);
      onToast?.({ show: true, message: 'Failed to delete email', type: 'error' });
    }
  }, [removeEmail, selectedEmail, setSelectedEmail, setEmailBody, onToast]);

  // Mark email as read
  const handleMarkRead = useCallback(async (email) => {
    if (email.is_read) return;

    try {
      await api.patch(`/api/v1/emails/${email.id}/read`);
      updateEmail(email.id, { is_read: true });
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, [updateEmail]);

  // Sync emails from server
  const syncEmails = useCallback(async (maxResults = 100) => {
    try {
      await api.post('/api/v1/emails/sync', null, { params: { max_results: maxResults } });
      return true;
    } catch (err) {
      console.error('Failed to sync emails:', err);
      return false;
    }
  }, []);

  return {
    handleToggleStar,
    handleArchive,
    handleDelete,
    handleMarkRead,
    syncEmails,
  };
}

export default useEmailOperations;
