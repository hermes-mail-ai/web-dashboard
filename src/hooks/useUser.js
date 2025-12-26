import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Hook for fetching and managing current user data
 * @returns {Object} - { user, loading, error, refetch }
 */
export function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/v1/users/me');
      setUser(response.data);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setError(err.response?.data?.error || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const updateUser = useCallback(async (updates) => {
    try {
      const response = await api.patch('/api/v1/users/me', updates);
      setUser(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to update user:', err);
      throw err;
    }
  }, []);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
    updateUser,
  };
}
