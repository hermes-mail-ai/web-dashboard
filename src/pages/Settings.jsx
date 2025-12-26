import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { isAuthenticated } from '../services/auth';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function Settings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timezone, setTimezone] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);

  // Check for checkout success message
  const checkoutSuccess = searchParams.get('checkout') === 'success';

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [userRes, accountsRes, providersRes, subRes, usageRes] = await Promise.all([
        api.get('/api/v1/users/me'),
        api.get('/api/v1/accounts'),
        api.get('/api/v1/accounts/providers'),
        api.get('/api/v1/subscriptions/subscription').catch(() => ({ data: null })),
        api.get('/api/v1/subscriptions/usage').catch(() => ({ data: null })),
      ]);
      setUser(userRes.data);
      setAccounts(accountsRes.data);
      setProviders(providersRes.data);
      setSubscription(subRes.data);
      setUsage(usageRes.data);
      setTimezone(userRes.data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await api.post('/api/v1/subscriptions/portal');
      window.location.href = res.data.portal_url;
    } catch (err) {
      console.error('Failed to open portal:', err);
      alert(err.response?.data?.detail || 'Failed to open billing portal');
      setPortalLoading(false);
    }
  };

  const formatPlanName = (plan) => {
    if (!plan) return 'Free';
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  const formatStatus = (status) => {
    if (!status) return '';
    const labels = {
      trialing: 'Trial',
      active: 'Active',
      canceled: 'Canceled',
      past_due: 'Past Due',
      expired: 'Expired',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      trialing: 'text-blue-400 bg-blue-400/10',
      active: 'text-emerald-400 bg-emerald-400/10',
      canceled: 'text-gray-400 bg-gray-400/10',
      past_due: 'text-red-400 bg-red-400/10',
      expired: 'text-red-400 bg-red-400/10',
    };
    return colors[status] || 'text-gray-400 bg-gray-400/10';
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

              {/* Subscription Section */}
              <section className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700">
                  <h2 className="text-lg font-medium text-gray-100">Subscription</h2>
                  <p className="text-sm text-gray-400 mt-1">Your plan and usage</p>
                </div>
                <div className="p-6 space-y-6">
                  {/* Success Message */}
                  {checkoutSuccess && (
                    <div className="p-3 bg-emerald-900/30 border border-emerald-700/50 rounded-lg text-emerald-400 text-sm">
                      Subscription activated successfully! Welcome to Hermes.
                    </div>
                  )}

                  {/* Current Plan */}
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Current Plan</h3>
                    <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-100">
                            {formatPlanName(subscription?.plan)}
                          </p>
                          {subscription?.status && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(subscription.status)}`}>
                              {formatStatus(subscription.status)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {subscription?.stripe_customer_id ? (
                          <button
                            onClick={openPortal}
                            disabled={portalLoading}
                            className="px-3 py-1.5 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {portalLoading ? 'Loading...' : 'Manage'}
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate('/pricing')}
                            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                          >
                            Upgrade
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Trial End Date */}
                    {subscription?.status === 'trialing' && subscription?.trial_end && (
                      <p className="text-xs text-gray-400 mt-2">
                        Trial ends: {new Date(subscription.trial_end).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Usage */}
                  {usage && (
                    <div>
                      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Today's Usage</h3>
                      <div className="space-y-4">
                        {/* Emails */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Emails processed</span>
                            <span className="text-gray-300">{usage.emails_processed} / {usage.emails_limit}</span>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: `${Math.min(100, (usage.emails_processed / usage.emails_limit) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* AI Generations */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">AI generations</span>
                            <span className="text-gray-300">{usage.ai_generations} / {usage.ai_generations_limit}</span>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full transition-all"
                              style={{ width: `${Math.min(100, (usage.ai_generations / usage.ai_generations_limit) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Context Storage */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Context storage</span>
                            <span className="text-gray-300">{usage.context_storage_mb.toFixed(1)} MB / {usage.context_storage_limit_mb} MB</span>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${Math.min(100, (usage.context_storage_mb / usage.context_storage_limit_mb) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
