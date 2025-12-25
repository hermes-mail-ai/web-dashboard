import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { isAuthenticated } from '../services/auth';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timezone, setTimezone] = useState('');

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
      setTimezone(userRes.data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const connectAccount = (providerName) => {
    const token = localStorage.getItem('token');
    window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/accounts/connect/${providerName}?token=${encodeURIComponent(token)}`;
  };

  const disconnectAccount = async (accountId) => {
    if (!confirm('Are you sure you want to disconnect this account?')) return;
    try {
      await api.delete(`/api/v1/accounts/${accountId}`);
      setAccounts(accounts.filter((a) => a.id !== accountId));
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
  };

  const getInitials = () => {
    if (!user?.name) return '?';
    const parts = user.name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header user={user} />
      <Sidebar user={user} />

      <main className="pt-14 min-h-screen ml-16">
        <div className="max-w-6xl mx-auto p-6 w-full">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/mail/inbox')}
              className="text-gray-400 hover:text-gray-200 text-sm flex items-center gap-1 mb-4 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back to Inbox
            </button>
            <h1 className="text-2xl font-normal text-gray-100">Settings</h1>
          </div>

          {/* Two Column Layout - 1:2 ratio */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - spans 1 */}
            <div className="lg:col-span-1 space-y-6">
              {/* User Information Section */}
              <section className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700">
                  <h2 className="text-lg font-medium text-gray-100">Profile</h2>
                  <p className="text-sm text-gray-400 mt-1">Your account information</p>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-xl">
                      {getInitials()}
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-100">{user?.name || 'User'}</p>
                      <p className="text-sm text-gray-400">{user?.email}</p>
                    </div>
                  </div>

                  {/* Timezone Setting */}
                  <div className="pt-4 border-t border-slate-700">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="America/Toronto">Toronto (ET)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Europe/Paris">Paris (CET)</option>
                      <option value="Europe/Berlin">Berlin (CET)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                      <option value="Asia/Shanghai">Shanghai (CST)</option>
                      <option value="Asia/Dubai">Dubai (GST)</option>
                      <option value="Australia/Sydney">Sydney (AEST)</option>
                      <option value="Pacific/Auckland">Auckland (NZST)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                      Current time: {new Date().toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </section>

              {/* Payment Section (Combined) */}
              <section className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700">
                  <h2 className="text-lg font-medium text-gray-100">Payment</h2>
                  <p className="text-sm text-gray-400 mt-1">Billing and payment details</p>
                </div>
                <div className="p-6 space-y-6">
                  {/* Card on File */}
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Card on File</h3>
                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-7 bg-gradient-to-br from-[#006FCF] to-[#0055A5] rounded flex items-center justify-center shadow-sm">
                          <span className="text-white text-[10px] font-bold tracking-wider">AMEX</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-200">**** 1234</p>
                          <p className="text-xs text-gray-500">Expires 12/26</p>
                        </div>
                      </div>
                      <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        Change
                      </button>
                    </div>
                  </div>

                  {/* Payment History */}
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">History</h3>
                    <div className="text-center py-6 bg-slate-700/30 rounded-lg border border-slate-700/50">
                      <svg className="w-8 h-8 text-gray-600 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                      <p className="text-gray-500 text-xs">No payment history yet</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column - spans 2 */}
            <div className="lg:col-span-2 space-y-6">
              {/* Email Accounts Section */}
              <section className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700">
                  <h2 className="text-lg font-medium text-gray-100">Email Accounts</h2>
                  <p className="text-sm text-gray-400 mt-1">Manage your connected email accounts</p>
                </div>

                <div className="p-6">
                  {/* Connected Accounts */}
                  {accounts.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-400 mb-3">Connected Accounts</h3>
                      <div className="space-y-3">
                        {accounts.map((account) => (
                          <div
                            key={account.id}
                            className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                                {account.provider === 'google' ? (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                  </svg>
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="w-5 h-5 text-gray-300"
                                  >
                                    <rect x="3" y="5" width="18" height="14" rx="2" />
                                    <polyline points="3 7 12 13 21 7" />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-100">{account.email}</p>
                                <p className="text-sm text-gray-400 capitalize">{account.provider}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => disconnectAccount(account.id)}
                              className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                              Disconnect
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Account - Beta limit: 1 account per user */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Add Account</h3>
                    {accounts.length >= 1 ? (
                      <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 text-center">
                        <p className="text-gray-400 text-sm">
                          Beta users can connect 1 email account.
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Multiple accounts will be available in future updates.
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {providers.map((provider) => (
                          <button
                            key={provider.name}
                            onClick={() => connectAccount(provider.name)}
                            className="flex items-center gap-4 p-4 bg-slate-700 hover:bg-slate-600 rounded-lg border border-slate-600 hover:border-slate-500 transition-all text-left"
                          >
                            <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                              {provider.name === 'google' ? (
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="w-5 h-5 text-gray-300"
                                >
                                  <rect x="3" y="5" width="18" height="14" rx="2" />
                                  <polyline points="3 7 12 13 21 7" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-100">Connect {provider.display_name}</p>
                              <p className="text-sm text-gray-400">Add your {provider.display_name} account</p>
                            </div>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-5 h-5 text-gray-400 ml-auto"
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;
