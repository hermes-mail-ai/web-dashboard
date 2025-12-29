import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

/**
 * Hook for fetching and managing unindexed emails (emails not processed by AI)
 * These emails are sorted by date and displayed after the indexed (AI-sorted) emails
 *
 * Backend API: GET /api/v1/emails/unindexed
 * Response fields: id, gmail_id, thread_id, account_id, from_email, from_name,
 *                  to_email, subject, snippet, date, is_read, is_starred,
 *                  is_archived, is_trashed, has_attachments
 */
export function useUnindexedEmails({
  folder = 'inbox',
  searchQuery = '',
  accountId = null,
  enabled = true,
  batchSize = 50, // Backend max is 100
}) {
  const [unindexedEmails, setUnindexedEmails] = useState([]);
  const [totalUnindexed, setTotalUnindexed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const currentOffsetRef = useRef(0);

  const loadUnindexedEmails = useCallback(async (reset = true) => {
    if (!enabled) return;

    if (reset) {
      setLoading(true);
      currentOffsetRef.current = 0;
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const params = {
        limit: Math.min(batchSize, 100), // Backend max is 100
        offset: currentOffsetRef.current,
        folder,
        ...(searchQuery && { search: searchQuery }),
        ...(accountId && { account_id: accountId }),
      };

      const res = await api.get('/api/v1/emails/unindexed', { params });

      if (reset) {
        setUnindexedEmails(res.data.emails || []);
      } else {
        setUnindexedEmails(prev => [...prev, ...(res.data.emails || [])]);
      }

      setTotalUnindexed(res.data.total || 0);
      setHasMore(res.data.has_more || false);
      currentOffsetRef.current += (res.data.emails || []).length;
    } catch (err) {
      console.error('Failed to load unindexed emails:', err);
      setError(err.response?.data?.detail || err.message);
      // Don't break the UI if unindexed endpoint isn't available yet
      if (reset) {
        setUnindexedEmails([]);
        setTotalUnindexed(0);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [folder, searchQuery, accountId, enabled, batchSize]);

  // Load more emails (pagination)
  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
      loadUnindexedEmails(false);
    }
  }, [loading, loadingMore, hasMore, loadUnindexedEmails]);

  // Initial load and reload when dependencies change
  useEffect(() => {
    loadUnindexedEmails(true);
  }, [loadUnindexedEmails]);

  // Update a single email in the list
  const updateEmail = useCallback((emailId, updates) => {
    setUnindexedEmails(prev => prev.map(e =>
      e.id === emailId ? { ...e, ...updates } : e
    ));
  }, []);

  // Remove an email from the list
  const removeEmail = useCallback((emailId) => {
    setUnindexedEmails(prev => prev.filter(e => e.id !== emailId));
    setTotalUnindexed(prev => Math.max(0, prev - 1));
  }, []);

  return {
    unindexedEmails,
    totalUnindexed,
    loading,
    loadingMore,
    error,
    hasMore,
    refresh: () => loadUnindexedEmails(true),
    loadMore,
    updateEmail,
    removeEmail,
    setUnindexedEmails,
  };
}

export default useUnindexedEmails;
