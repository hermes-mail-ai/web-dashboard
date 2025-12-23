import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { isAuthenticated } from '../services/auth';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function Inbox() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
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

      if (accountsRes.data.length > 0) {
        await loadEmails();
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadEmails = async () => {
    try {
      const res = await api.get('/api/v1/emails', { params: { limit: 50 } });
      setEmails(res.data.emails);
    } catch (err) {
      console.error('Failed to load emails:', err);
    }
  };

  const syncEmails = async () => {
    setSyncing(true);
    try {
      await api.post('/api/v1/emails/sync', null, { params: { max_results: 50 } });
      await loadEmails();
    } catch (err) {
      console.error('Failed to sync emails:', err);
      setError(err.response?.data?.detail || err.message);
    } finally {
      setSyncing(false);
    }
  };

  const connectAccount = (providerName) => {
    const token = localStorage.getItem('token');
    window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/accounts/connect/${providerName}?token=${encodeURIComponent(token)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
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
      <Header />
      <Sidebar user={user} />

      <main className="ml-16 pt-14 min-h-screen">
        <div className="p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-4 mb-6">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {accounts.length === 0 ? (
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
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">Inbox</h1>
                  <p className="text-slate-400 text-sm mt-1">
                    {emails.length} emails
                  </p>
                </div>
                <button
                  onClick={syncEmails}
                  disabled={syncing}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {syncing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                      </svg>
                      Sync
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                {emails.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-slate-500 mb-4">No emails yet</p>
                    <button
                      onClick={syncEmails}
                      disabled={syncing}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Sync emails from Gmail
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {emails.map((email) => (
                      <div
                        key={email.id}
                        className={`flex items-start gap-4 p-4 hover:bg-slate-800/50 cursor-pointer transition-colors ${
                          !email.is_read ? 'bg-slate-800/30' : ''
                        }`}
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-slate-300">
                            {(email.from_name || email.from_email || '?')[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm truncate ${!email.is_read ? 'font-semibold text-white' : 'text-slate-300'}`}>
                              {email.from_name || email.from_email || 'Unknown'}
                            </p>
                            <span className="text-xs text-slate-500 flex-shrink-0">
                              {formatDate(email.date)}
                            </span>
                          </div>
                          <p className={`text-sm truncate ${!email.is_read ? 'font-medium text-slate-200' : 'text-slate-400'}`}>
                            {email.subject || '(no subject)'}
                          </p>
                          <p className="text-sm text-slate-500 truncate mt-0.5">
                            {email.snippet}
                          </p>
                        </div>
                        {email.has_attachments && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-500 flex-shrink-0">
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Inbox;
