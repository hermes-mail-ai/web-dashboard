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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [showCheckboxDropdown, setShowCheckboxDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emailBody, setEmailBody] = useState(null);
  const [loadingBody, setLoadingBody] = useState(false);
  const [activeCategory, setActiveCategory] = useState(() => {
    return localStorage.getItem('inbox_category') || 'primary';
  });
  const [showFullContent, setShowFullContent] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

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
      };
      const res = await api.get('/api/v1/emails', { params });
      console.log('Email list payload:', res.data);
      setEmails(res.data.emails);
    } catch (err) {
      console.error('Failed to load emails:', err);
    }
  };

  useEffect(() => {
    if (accounts.length > 0) {
      loadEmails();
    }
  }, [location.pathname, searchQuery]);

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

  const handleSelectEmail = async (email) => {
    setSelectedEmail(email);
    setEmailBody(null);
    setLoadingBody(true);
    setShowFullContent(false);

    try {
      const res = await api.get(`/api/v1/emails/${email.id}`);
      console.log('Email payload:', res.data);
      setEmailBody(res.data);

      // Mark as read if unread
      if (!email.is_read) {
        await api.patch(`/api/v1/emails/${email.id}/read`);
        setEmails(emails.map(e => e.id === email.id ? { ...e, is_read: true } : e));
      }
    } catch (err) {
      console.error('Failed to load email body:', err);
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoadingBody(false);
    }
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  // Dark mode styles for email content
  const darkModeStyles = `
    <style>
      html, body {
        background-color: #0f172a !important;
        color: #e2e8f0 !important;
        margin: 0 !important;
        padding: 24px 32px !important;
      }
      * {
        color: #e2e8f0 !important;
        border-color: #334155 !important;
      }
      div, td, th, tr, table, section, article, header, footer, main, aside, nav, p, span, li, ul, ol {
        background-color: transparent !important;
      }
      body > *, table, td {
        background-color: #0f172a !important;
      }
      a { color: #60a5fa !important; }
      h1, h2, h3, h4, h5, h6 { color: #f1f5f9 !important; }
      strong, b { color: #ffffff !important; }
      img {
        opacity: 0.9;
      }
    </style>
    <script>
      document.addEventListener('click', function(e) {
        var link = e.target.closest('a');
        if (link && link.href) {
          e.preventDefault();
          window.open(link.href, '_blank', 'noopener,noreferrer');
        }
      });
    </script>
  `;

  // Category tabs for filtering
  const categories = [
    { id: 'primary', label: 'Primary' },
    { id: 'promotions', label: 'Promotions' },
    { id: 'notifications', label: 'Notifications' },
  ];

  // Filter emails by category
  const getFilteredEmails = () => {
    return emails.filter(email => {
      const emailCategory = email.analysis?.category?.toLowerCase() || 'primary';

      if (activeCategory === 'primary') {
        // Primary includes emails without category or with 'primary' category
        return !emailCategory || emailCategory === 'primary' ||
               !['promotions', 'notifications', 'updates', 'social'].includes(emailCategory);
      }

      if (activeCategory === 'notifications') {
        // Notifications includes 'notifications', 'updates', 'social'
        return ['notifications', 'updates', 'social'].includes(emailCategory);
      }

      return emailCategory === activeCategory;
    });
  };

  const filteredEmails = getFilteredEmails();

  // Get promotions from last 7 days for the board
  const getRecentPromotions = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return emails.filter(email => {
      const emailCategory = email.analysis?.category?.toLowerCase();
      const emailDate = new Date(email.date);
      return emailCategory === 'promotions' && emailDate >= sevenDaysAgo;
    });
  };

  const recentPromotions = getRecentPromotions();

  // Get unread notifications
  const getUnreadNotifications = () => {
    return emails.filter(email => {
      const emailCategory = email.analysis?.category?.toLowerCase();
      return ['notifications', 'updates', 'social'].includes(emailCategory) && !email.is_read;
    });
  };

  const unreadNotifications = getUnreadNotifications();

  // Dismiss notification (mark as read without opening)
  const dismissNotification = async (e, email) => {
    e.stopPropagation();
    try {
      await api.patch(`/api/v1/emails/${email.id}/read`);
      setEmails(emails.map(e => e.id === email.id ? { ...e, is_read: true } : e));
    } catch (err) {
      console.error('Failed to dismiss notification:', err);
    }
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

  const markAllAsRead = async () => {
    try {
      const unreadEmails = emails.filter(email => !email.is_read);
      await Promise.all(unreadEmails.map(email => 
        api.patch(`/api/v1/emails/${email.id}/read`)
      ));
      setEmails(emails.map(email => ({ ...email, is_read: true })));
      setShowMoreMenu(false);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      setError(err.response?.data?.detail || err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header user={user} />
        <Sidebar user={user} />
        <main className="pt-14 min-h-screen flex items-center justify-center ml-16">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-300">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header user={user} />
      <Sidebar user={user} />
      <main className="pt-14 h-screen overflow-hidden flex flex-col ml-16">
        {error && (
          <div className="flex-shrink-0 bg-red-900/30 border-l-4 border-red-500 p-4 m-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {accounts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <polyline points="3 7 12 13 21 7" />
                </svg>
              </div>
              <h2 className="text-xl font-normal text-gray-200 mb-2">Connect your email</h2>
              <p className="text-gray-400 mb-8">Connect an email account to get started</p>
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
          <div className="flex-1 min-h-0 flex overflow-hidden">
            {/* Email List - Left Panel */}
            <div className="w-[420px] flex-shrink-0 border-r border-slate-700 flex flex-col">
              {/* List Header / Toolbar */}
              <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-b border-slate-700">
                {/* Left side - Search, More menu and count */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowSearch(!showSearch)}
                    className={`p-2 hover:bg-slate-800 rounded-full transition-colors ${showSearch ? 'bg-slate-800' : ''}`}
                    title="Search"
                  >
                    <svg className={`w-4 h-4 ${showSearch ? 'text-blue-400' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                  </button>
                  <button
                    className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                    title="More options"
                  >
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </button>
                  <span className="text-xs text-gray-500 ml-1">{filteredEmails.length}</span>
                </div>

                {/* Right side - Unread filter, Refresh, Compose */}
                <div className="flex items-center gap-1">
                  <button
                    className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                    title="Show unread only"
                  >
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </button>
                  <button
                    onClick={syncEmails}
                    disabled={syncing}
                    className="p-2 hover:bg-slate-800 rounded-full transition-colors disabled:opacity-50"
                    title="Refresh"
                  >
                    {syncing ? (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => {/* TODO: Open compose */}}
                    className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                    title="Compose"
                  >
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Search Bar - Expandable */}
              {showSearch && (
                <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-b border-slate-700 bg-slate-800/50">
                  <button
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery('');
                    }}
                    className="p-1.5 hover:bg-slate-700 rounded-full transition-colors"
                    title="Close search"
                  >
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search emails..."
                    autoFocus
                    className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-500 text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1.5 hover:bg-slate-700 rounded-full transition-colors"
                      title="Clear"
                    >
                      <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Category Tabs */}
              <div className="flex-shrink-0 flex gap-2 p-3 border-b border-slate-700">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id);
                      localStorage.setItem('inbox_category', category.id);
                      setSelectedEmail(null);
                      setEmailBody(null);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      activeCategory === category.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700 hover:text-gray-200 border border-slate-600/50'
                    }`}
                  >
                    {category.id === 'primary' && (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    )}
                    {category.id === 'promotions' && (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
                      </svg>
                    )}
                    {category.id === 'notifications' && (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                      </svg>
                    )}
                    {category.label}
                  </button>
                ))}
              </div>

              {/* Email List */}
              <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#475569 #1e293b' }}>
                {filteredEmails.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-400 mb-4">
                      {emails.length === 0 ? 'No emails' : `No ${activeCategory} emails`}
                    </p>
                    {emails.length === 0 && (
                      <button
                        onClick={syncEmails}
                        disabled={syncing}
                        className="text-blue-500 hover:text-blue-400 text-sm"
                      >
                        Sync emails
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-700/50">
                    {filteredEmails.map((email) => (
                      <div
                        key={email.id}
                        onClick={() => handleSelectEmail(email)}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                          selectedEmail?.id === email.id
                            ? 'bg-slate-800'
                            : !email.is_read
                            ? 'bg-slate-900 hover:bg-slate-800/50'
                            : 'hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center flex-shrink-0">
                          {email.is_starred ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); }}
                              className="text-yellow-500 hover:text-yellow-600"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                              </svg>
                            </button>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); }}
                              className="text-gray-500 hover:text-yellow-500"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                              </svg>
                            </button>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm truncate ${!email.is_read ? 'font-semibold text-gray-100' : 'text-gray-300'}`}>
                              {email.from_name || email.from_email || 'Unknown'}
                            </p>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatDate(email.date)}
                            </span>
                          </div>
                          <p className={`text-sm truncate ${!email.is_read ? 'font-medium text-gray-200' : 'text-gray-400'}`}>
                            {email.subject || '(no subject)'}
                          </p>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <p className="text-xs text-gray-500 truncate flex-1">
                              {email.snippet}
                            </p>
                            {email.analysis?.priority && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${
                                email.analysis.priority === 'high'
                                  ? 'bg-red-500/20 text-red-400'
                                  : email.analysis.priority === 'medium'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-slate-700 text-gray-400'
                              }`}>
                                {email.analysis.priority}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Email Viewer - Right Panel */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {selectedEmail ? (
                <>
                  {/* Email Header */}
                  <div className="flex-shrink-0 p-6 border-b border-slate-700">
                    {/* Back Button for Promotions/Notifications */}
                    {(activeCategory === 'promotions' || activeCategory === 'notifications') && (
                      <button
                        onClick={() => {
                          setSelectedEmail(null);
                          setEmailBody(null);
                        }}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4 transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Back to {activeCategory === 'promotions' ? 'Deals' : 'Notifications'}
                      </button>
                    )}
                    <h2 className="text-xl font-semibold text-white mb-4">
                      {selectedEmail.subject || '(no subject)'}
                    </h2>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-white">
                          {getInitials(selectedEmail.from_name || selectedEmail.from_email)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">
                          {selectedEmail.from_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {selectedEmail.from_email}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatFullDate(selectedEmail.date)}
                      </p>
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className="flex-1 overflow-y-auto min-h-0">
                    {loadingBody ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : emailBody ? (
                      <div className="h-full flex flex-col">
                        {/* Show Summary for Primary category (unless toggled to full content) */}
                        {activeCategory === 'primary' && !showFullContent && selectedEmail.analysis?.summary ? (
                          <div className="flex-1 p-6 overflow-y-auto">
                            {/* Toggle Button - Top Right */}
                            <div className="flex justify-end mb-6">
                              <button
                                onClick={() => setShowFullContent(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 hover:border-slate-600 transition-all"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                  <line x1="16" y1="13" x2="8" y2="13" />
                                  <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                                View Full Email
                              </button>
                            </div>

                            {/* Summary Header */}
                            <div className="mb-4">
                              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Summary</span>
                            </div>

                            {/* Summary Points - Separate Cards */}
                            <div className="space-y-3">
                              {(() => {
                                const summary = selectedEmail.analysis?.summary;
                                if (!summary) return null;
                                const summaryArray = Array.isArray(summary) ? summary : [summary];
                                return summaryArray.slice(0, 5).filter(Boolean).map((point, index) => (
                                  <div
                                    key={index}
                                    className="group relative p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 cursor-default"
                                  >
                                    {/* Hover gradient accent */}
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    <div className="relative flex items-start gap-3">
                                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-colors duration-300">
                                        <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                          <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                      </div>
                                      <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-100 transition-colors duration-300">{point}</p>
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>

                            {/* Action Required Badge */}
                            {selectedEmail.analysis?.action_required?.type &&
                              selectedEmail.analysis?.action_required?.type !== 'no_action' && (
                              <div className="mt-5">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                  <span className="text-xs font-medium text-amber-400">
                                    {selectedEmail.analysis?.action_required?.type?.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Important Content */}
                            {selectedEmail.analysis?.important_content && (
                              <div className="mt-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                                <p className="text-sm text-blue-300/80 italic">
                                  "{selectedEmail.analysis?.important_content}"
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Full Email Content */
                          <div className="h-full flex flex-col">
                            {/* Back to Summary Button (only for Primary with summary) */}
                            {activeCategory === 'primary' && showFullContent && selectedEmail.analysis?.summary && (
                              <div className="flex-shrink-0 flex justify-end p-4 pb-0">
                                <button
                                  onClick={() => setShowFullContent(false)}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 hover:border-slate-600 transition-all"
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                                    <circle cx="7.5" cy="14.5" r="1.5" />
                                    <circle cx="16.5" cy="14.5" r="1.5" />
                                  </svg>
                                  View Summary
                                </button>
                              </div>
                            )}
                            <div className="flex-1">
                              {emailBody.html_body ? (
                                <iframe
                                  srcDoc={darkModeStyles + emailBody.html_body}
                                  className="w-full h-full border-0 bg-slate-950"
                                  sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
                                  title="Email content"
                                />
                              ) : (
                                <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans p-8">
                                  {emailBody.text_body || selectedEmail.snippet}
                                </pre>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-6">
                        <p className="text-gray-400 text-sm">{selectedEmail.snippet}</p>
                      </div>
                    )}
                  </div>
                </>
              ) : activeCategory === 'promotions' ? (
                /* Promotions Board */
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 mb-4">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                          <line x1="7" y1="7" x2="7.01" y2="7" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-semibold text-white mb-1">This Week's Deals</h2>
                      <p className="text-gray-500 text-sm">Promotions from the last 7 days</p>
                    </div>

                    {/* Promotions Grid */}
                    {recentPromotions.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500">No promotions this week</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentPromotions.map((promo, index) => (
                          <div
                            key={promo.id}
                            onClick={() => handleSelectEmail(promo)}
                            className="group relative p-4 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-800/40 border border-slate-700/50 hover:border-purple-500/30 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5"
                          >
                            {/* Decorative gradient line */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-gradient-to-b from-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-start gap-4">
                              {/* Brand Avatar */}
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-white">
                                  {getInitials(promo.from_name || promo.from_email)}
                                </span>
                              </div>

                              <div className="flex-1 min-w-0">
                                {/* Brand Name & Date */}
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <p className="text-sm font-medium text-white truncate">
                                    {promo.from_name || promo.from_email}
                                  </p>
                                  <span className="text-xs text-gray-500 flex-shrink-0">
                                    {formatDate(promo.date)}
                                  </span>
                                </div>

                                {/* Subject */}
                                <p className="text-sm text-gray-300 truncate mb-2">
                                  {promo.subject}
                                </p>

                                {/* Summary */}
                                {promo.analysis?.summary && (
                                  <p className="text-xs text-gray-400 line-clamp-2">
                                    {Array.isArray(promo.analysis.summary)
                                      ? promo.analysis.summary.join(' • ')
                                      : promo.analysis.summary}
                                  </p>
                                )}
                              </div>

                              {/* Arrow */}
                              <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : activeCategory === 'notifications' ? (
                /* Notifications Board */
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-4">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-semibold text-white mb-1">Notifications</h2>
                      <p className="text-gray-500 text-sm">
                        {unreadNotifications.length === 0
                          ? 'All caught up!'
                          : `${unreadNotifications.length} unread notification${unreadNotifications.length !== 1 ? 's' : ''}`}
                      </p>
                    </div>

                    {/* Notifications List */}
                    {unreadNotifications.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <p className="text-gray-400">No new notifications</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {unreadNotifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => handleSelectEmail(notif)}
                            className="group relative p-4 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-800/40 border border-slate-700/50 hover:border-blue-500/30 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5"
                          >
                            {/* Unread indicator dot */}
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />

                            <div className="flex items-start gap-4 pl-4">
                              {/* Avatar */}
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-white">
                                  {getInitials(notif.from_name || notif.from_email)}
                                </span>
                              </div>

                              <div className="flex-1 min-w-0">
                                {/* Sender & Date */}
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <p className="text-sm font-medium text-white truncate">
                                    {notif.from_name || notif.from_email}
                                  </p>
                                  <span className="text-xs text-gray-500 flex-shrink-0">
                                    {formatDate(notif.date)}
                                  </span>
                                </div>

                                {/* Subject */}
                                <p className="text-sm text-gray-300 truncate mb-1">
                                  {notif.subject}
                                </p>

                                {/* Summary */}
                                {notif.analysis?.summary && (
                                  <p className="text-xs text-gray-400 line-clamp-2">
                                    {Array.isArray(notif.analysis.summary)
                                      ? notif.analysis.summary.join(' • ')
                                      : notif.analysis.summary}
                                  </p>
                                )}
                              </div>

                              {/* Dismiss Button */}
                              <button
                                onClick={(e) => dismissNotification(e, notif)}
                                className="p-2 text-gray-500 hover:text-white hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                                title="Dismiss"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Default - No Email Selected */
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <polyline points="3 7 12 13 21 7" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">Select an email to read</p>
                  </div>
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
