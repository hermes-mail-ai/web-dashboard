import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { isAuthenticated } from '../services/auth';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ProfileSection from '../components/settings/ProfileSection';
import SubscriptionSection from '../components/settings/SubscriptionSection';
import EmailAccountsSection from '../components/settings/EmailAccountsSection';

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
              <ProfileSection
                user={user}
                timezone={timezone}
                onTimezoneChange={setTimezone}
              />

              <SubscriptionSection
                subscription={subscription}
                usage={usage}
                checkoutSuccess={checkoutSuccess}
                portalLoading={portalLoading}
                onOpenPortal={openPortal}
                onUpgrade={() => navigate('/pricing')}
              />
            </div>

            {/* Right Column - spans 2 */}
            <div className="lg:col-span-2 space-y-6">
              <EmailAccountsSection
                accounts={accounts}
                providers={providers}
                onConnect={connectAccount}
                onDisconnect={disconnectAccount}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;
