import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Hook for fetching and managing emails with pagination
 */
export function useEmails({
  folder = 'inbox',
  category = null,
  searchQuery = '',
  page = 1,
  limit = 100,
  useThreadView = false,
  enabled = true,
}) {
  const [emails, setEmails] = useState([]);
  const [threads, setThreads] = useState([]);
  const [totalEmails, setTotalEmails] = useState(0);
  const [totalThreads, setTotalThreads] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadEmails = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        limit,
        offset: (page - 1) * limit,
        folder,
        ...(category && { category }),
        ...(searchQuery && { search: searchQuery }),
      };

      if (useThreadView) {
        const res = await api.get('/api/v1/emails/threads/list', { params });
        setThreads(res.data.threads);
        setTotalThreads(res.data.total || res.data.threads.length);
        setEmails([]);
        setTotalEmails(0);
      } else {
        const res = await api.get('/api/v1/emails', { params });
        setEmails(res.data.emails);
        setTotalEmails(res.data.total || res.data.emails.length);
        setThreads([]);
        setTotalThreads(0);
      }
    } catch (err) {
      console.error('Failed to load emails:', err);
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, [folder, category, searchQuery, page, limit, useThreadView, enabled]);

  // Reload when dependencies change
  useEffect(() => {
    loadEmails();
  }, [loadEmails]);

  // Update a single email in the list
  const updateEmail = useCallback((emailId, updates) => {
    setEmails(prev => prev.map(e =>
      e.id === emailId ? { ...e, ...updates } : e
    ));
  }, []);

  // Remove an email from the list
  const removeEmail = useCallback((emailId) => {
    setEmails(prev => prev.filter(e => e.id !== emailId));
  }, []);

  return {
    emails,
    threads,
    totalEmails,
    totalThreads,
    loading,
    error,
    refresh: loadEmails,
    updateEmail,
    removeEmail,
    setEmails,
  };
}

export default useEmails;
