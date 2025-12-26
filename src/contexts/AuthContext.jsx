import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { isAuthenticated, logout as authLogout } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = useCallback(async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch user and accounts in parallel
      const [userResponse, accountsResponse] = await Promise.all([
        api.get('/api/v1/users/me'),
        api.get('/api/v1/accounts'),
      ]);

      setUser(userResponse.data);
      setAccounts(accountsResponse.data);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError(err.response?.data?.error || 'Failed to load user data');

      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        authLogout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

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

  const refreshAccounts = useCallback(async () => {
    try {
      const response = await api.get('/api/v1/accounts');
      setAccounts(response.data);
    } catch (err) {
      console.error('Failed to refresh accounts:', err);
      throw err;
    }
  }, []);

  const deleteAccount = useCallback(async (accountId) => {
    try {
      await api.delete(`/api/v1/accounts/${accountId}`);
      setAccounts(prev => prev.filter(a => a.id !== accountId));
    } catch (err) {
      console.error('Failed to delete account:', err);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
    setAccounts([]);
    navigate('/login');
  }, [navigate]);

  const value = {
    user,
    accounts,
    loading,
    error,
    isAuthenticated: isAuthenticated(),
    updateUser,
    refreshAccounts,
    deleteAccount,
    refetch: fetchUserData,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
