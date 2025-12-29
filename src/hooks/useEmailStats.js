import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Hook for fetching email indexing stats
 *
 * Backend API: GET /api/v1/emails/stats
 * Response: { total: number, indexed: number, unindexed: number }
 */
export function useEmailStats({ enabled = true } = {}) {
  const [stats, setStats] = useState({
    total: 0,
    indexed: 0,
    unindexed: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.get('/api/v1/emails/stats');
      setStats({
        total: res.data.total || 0,
        indexed: res.data.indexed || 0,
        unindexed: res.data.unindexed || 0,
      });
    } catch (err) {
      console.error('Failed to load email stats:', err);
      setError(err.response?.data?.detail || err.message);
      // Don't break the UI if stats endpoint isn't available yet
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refresh: loadStats,
  };
}

export default useEmailStats;
