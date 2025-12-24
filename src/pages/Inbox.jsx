import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { isAuthenticated } from '../services/auth';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function Inbox() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('PRIMARY');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [showCheckboxDropdown, setShowCheckboxDropdown] = useState(false);

  // Determine folder from path
  const getFolderFromPath = () => {
    const path = location.pathname;
    if (path.includes('/starred')) return { folder: null, starred: 'true' };
    if (path.includes('/snoozed')) return { folder: null, snoozed: 'true' };
    if (path.includes('/sent')) return { folder: 'SENT' };
    if (path.includes('/drafts')) return { folder: 'DRAFTS' };
    if (path.includes('/purchases')) return { folder: 'INBOX', category: 'PROMOTIONS' };
    if (path.includes('/important')) return { folder: 'INBOX' };
    if (path.includes('/spam')) return { folder: 'SPAM' };
    if (path.includes('/trash')) return { folder: 'TRASH' };
    if (path.includes('/all')) return { folder: 'INBOX' };
    return { folder: 'INBOX' };
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadData();
  }, [navigate, location.pathname]);

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
      const filters = getFolderFromPath();
      const params = {
        limit: 50,
        ...filters,
        ...(searchQuery && { search: searchQuery }),
        ...(location.pathname === '/mail/inbox' && activeTab && { category: activeTab }),
      };
      const res = await api.get('/api/v1/emails', { params });
      setEmails(res.data.emails);
    } catch (err) {
      console.error('Failed to load emails:', err);
    }
  };

  useEffect(() => {
    if (accounts.length > 0) {
      loadEmails();
    }
  }, [location.pathname, searchQuery, activeTab]);

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
    const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const tabs = [
    { id: 'PRIMARY', label: 'Primary' },
    { id: 'PROMOTIONS', label: 'Promotions' },
    { id: 'SOCIAL', label: 'Social' },
    { id: 'UPDATES', label: 'Updates' },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleSelectOption = (option) => {
    const newSelected = new Set();
    switch (option) {
      case 'All':
        emails.forEach(email => newSelected.add(email.id));
        break;
      case 'None':
        break;
      case 'Read':
        emails.filter(email => email.is_read).forEach(email => newSelected.add(email.id));
        break;
      case 'Unread':
        emails.filter(email => !email.is_read).forEach(email => newSelected.add(email.id));
        break;
      case 'Starred':
        emails.filter(email => email.is_starred).forEach(email => newSelected.add(email.id));
        break;
      case 'Unstarred':
        emails.filter(email => !email.is_starred).forEach(email => newSelected.add(email.id));
        break;
    }
    setSelectedEmails(newSelected);
  };

  const toggleEmailSelection = (emailId) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(emailId)) {
      newSelected.delete(emailId);
    } else {
      newSelected.add(emailId);
    }
    setSelectedEmails(newSelected);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
        <Sidebar user={user} />
        <main className="ml-64 pt-14 min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        onSearch={setSearchQuery} 
        searchQuery={searchQuery}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isSidebarCollapsed={isSidebarCollapsed}
      />
      <Sidebar user={user} collapsed={isSidebarCollapsed} />
      <main className={`pt-14 min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <polyline points="3 7 12 13 21 7" />
                </svg>
              </div>
              <h2 className="text-xl font-normal text-gray-900 mb-2">Connect your email</h2>
              <p className="text-gray-600 mb-8">Connect an email account to get started</p>
              <div className="flex flex-col gap-3">
                {providers.map((provider) => (
                  <button
                    key={provider.name}
                    onClick={() => connectAccount(provider.name)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Connect {provider.display_name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <button
                    onClick={() => {
                      if (selectedEmails.size === 0) {
                        // Select all
                        const newSelected = new Set();
                        emails.forEach(email => newSelected.add(email.id));
                        setSelectedEmails(newSelected);
                      } else {
                        // Deselect all
                        setSelectedEmails(new Set());
                      }
                    }}
                    className="p-1 hover:bg-gray-100 rounded transition-colors flex items-center"
                    title="Select all"
                  >
                    {selectedEmails.size === 0 ? (
                      <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => setShowCheckboxDropdown(!showCheckboxDropdown)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="More selection options"
                  >
                    <svg 
                      className={`w-4 h-4 text-gray-600 transition-transform ${showCheckboxDropdown ? 'rotate-180' : ''}`}
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  {showCheckboxDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowCheckboxDropdown(false)}
                      />
                      <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                        <div className="py-1">
                          {['All', 'None', 'Read', 'Unread', 'Starred', 'Unstarred'].map((option) => (
                            <button
                              key={option}
                              onClick={() => {
                                handleSelectOption(option);
                                setShowCheckboxDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={syncEmails}
                  disabled={syncing}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  {syncing ? (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="text-sm text-gray-600">
                {emails.length} {emails.length === 1 ? 'email' : 'emails'}
              </div>
            </div>

            {/* Tabs - only show for inbox */}
            {location.pathname === '/mail/inbox' && (
              <div className="flex items-center border-b border-gray-200 px-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`px-4 py-3 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-red-600 text-red-600 font-medium'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Email List */}
            <div className="flex-1 overflow-y-auto">
              {emails.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 mb-4">No emails</p>
                  <button
                    onClick={syncEmails}
                    disabled={syncing}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Sync emails
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {emails.map((email) => (
                      <div
                        key={email.id}
                        onClick={() => navigate(`/mail/emails/${email.id}`)}
                        className={`flex items-start gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !email.is_read 
                            ? 'bg-[rgba(0,0,0,0)]' 
                            : 'bg-[rgb(242,246,252)]'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <input 
                            type="checkbox" 
                            checked={selectedEmails.has(email.id)}
                            onChange={() => toggleEmailSelection(email.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          {email.is_starred ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Toggle star
                              }}
                              className="text-yellow-500 hover:text-yellow-600"
                            >
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                              </svg>
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Toggle star
                              }}
                              className="text-gray-400 hover:text-yellow-500"
                            >
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                              </svg>
                            </button>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className={`text-sm truncate ${!email.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                              {email.from_name || email.from_email || 'Unknown'}
                            </p>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatDate(email.date)}
                            </span>
                          </div>
                          <p className={`text-sm truncate mb-1 ${!email.is_read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                            {email.subject || '(no subject)'}
                          </p>
                          {email.summary && (
                            <p className="text-xs text-gray-500 line-clamp-2 mb-1">
                              {email.summary}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 truncate">
                            {email.snippet}
                          </p>
                        </div>
                        {email.has_attachments && (
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                          </svg>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Inbox;
