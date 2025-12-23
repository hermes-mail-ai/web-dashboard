import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { isAuthenticated } from '../services/auth';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('inbox');

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
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar user={user} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content - offset by sidebar width */}
      <main className="ml-16 min-h-screen flex flex-col">
        <Header />
        {activeTab === 'inbox' && (
          <div className="flex-1 p-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-4 mb-6">
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}

            {accounts.length === 0 ? (
              /* No accounts connected - Show connect prompt */
              <div className="flex flex-col items-center justify-center min-h-[80vh]">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="w-8 h-8 text-slate-500"
                    >
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <polyline points="3 7 12 13 21 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Connect your email
                  </h2>
                  <p className="text-slate-400 mb-8">
                    Connect an email account to get started with Hermes
                  </p>
                  <div className="flex flex-col gap-3">
                    {providers.map((provider) => (
                      <button
                        key={provider.name}
                        onClick={() => connectAccount(provider.name)}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        Connect {provider.display_name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Inbox content will go here */
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-white">Inbox</h1>
                  <p className="text-slate-400 text-sm mt-1">
                    {accounts.length} account{accounts.length !== 1 ? 's' : ''} connected
                  </p>
                </div>

                {/* Connected accounts summary */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 mb-6">
                  <h3 className="text-sm font-medium text-slate-400 mb-3">Connected Accounts</h3>
                  <div className="space-y-2">
                    {accounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="w-4 h-4 text-slate-400"
                            >
                              <rect x="3" y="5" width="18" height="14" rx="2" />
                              <polyline points="3 7 12 13 21 7" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{account.email}</p>
                            <p className="text-xs text-slate-500">{account.provider}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => disconnectAccount(account.id)}
                          className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                        >
                          Disconnect
                        </button>
                      </div>
                    ))}
                  </div>
                  {providers.length > 0 && (
                    <button
                      onClick={() => connectAccount(providers[0].name)}
                      className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      + Add another account
                    </button>
                  )}
                </div>

                {/* Placeholder for emails */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center">
                  <p className="text-slate-500">Email list coming soon...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
