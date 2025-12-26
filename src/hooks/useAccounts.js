import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Hook for fetching and managing email accounts
 * @returns {Object} - { accounts, loading, error, refetch }
 */
export function useAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/v1/accounts');
      setAccounts(response.data);
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
      setError(err.response?.data?.error || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const deleteAccount = useCallback(async (accountId) => {
    try {
      await api.delete(`/api/v1/accounts/${accountId}`);
      setAccounts(prev => prev.filter(a => a.id !== accountId));
    } catch (err) {
      console.error('Failed to delete account:', err);
      throw err;
    }
  }, []);

  return {
    accounts,
    loading,
    error,
    refetch: fetchAccounts,
    deleteAccount,
  };
}
