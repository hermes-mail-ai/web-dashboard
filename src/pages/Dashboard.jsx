import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { logout, isAuthenticated } from '../services/auth';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [userRes, accountsRes, providersRes] = await Promise.all([
        api.get('/api/v1/users/me'),
        api.get('/api/v1/accounts'),
        api.get('/api/v1/accounts/providers'),
      ]);
      setUser(userRes.data);
      setAccounts(accountsRes.data);
      setProviders(providersRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const connectAccount = (providerName) => {
    const token = localStorage.getItem('token');
    window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/accounts/connect/${providerName}`;
  };

  const disconnectAccount = async (accountId) => {
    if (!confirm('Disconnect this account?')) return;
    try {
      await api.delete(`/api/v1/accounts/${accountId}`);
      setAccounts(accounts.filter((a) => a.id !== accountId));
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Hermes Dashboard</h1>
          <div className="flex items-center gap-4">
            {user && <span className="text-gray-600">{user.email}</span>}
            <button
              onClick={logout}
              className="text-gray-600 hover:text-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <section className="bg-red-100 border border-red-400 text-red-700 rounded-lg p-4 mb-6">
            <h2 className="font-semibold">Error</h2>
            <p>{error}</p>
            <p className="text-sm mt-2">Token: {localStorage.getItem('token')?.slice(0, 50)}...</p>
          </section>
        )}

        {user && (
          <section className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Profile</h2>
            <div className="space-y-2">
              <p><span className="text-gray-500">Name:</span> {user.name || 'N/A'}</p>
              <p><span className="text-gray-500">Email:</span> {user.email || 'N/A'}</p>
              <p><span className="text-gray-500">ID:</span> {user.id}</p>
            </div>
          </section>
        )}

        <section className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Connect Email Account</h2>
          <div className="flex gap-4">
            {providers.map((provider) => (
              <button
                key={provider.name}
                onClick={() => connectAccount(provider.name)}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Connect {provider.display_name}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Connected Accounts</h2>
          {accounts.length === 0 ? (
            <p className="text-gray-500">No accounts connected yet.</p>
          ) : (
            <ul className="space-y-3">
              {accounts.map((account) => (
                <li
                  key={account.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <div>
                    <p className="font-medium">{account.email}</p>
                    <p className="text-sm text-gray-500">{account.provider}</p>
                  </div>
                  <button
                    onClick={() => disconnectAccount(account.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Disconnect
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
