import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { isAuthenticated } from '../services/auth';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import RichTextEditor from '../components/RichTextEditor';

function Inbox() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emailBody, setEmailBody] = useState(null);
  const [loadingBody, setLoadingBody] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [composing, setComposing] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', cc: '', bcc: '', subject: '', body: '' });
  const [sending, setSending] = useState(false);
  const [extraFields, setExtraFields] = useState([]); // ['cc'] or ['bcc'] or ['cc', 'bcc']

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

  const handleSelectEmail = async (email) => {
    setSelectedEmail(email);
    setEmailBody(null);
    setLoadingBody(true);

    try {
      const res = await api.get(`/api/v1/emails/${email.id}`);
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

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Dark mode styles for email content
  const darkModeStyles = `
    <style>
      html, body {
        background-color: #0f172a !important;
        color: #e2e8f0 !important;
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
    </style>
  `;

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

      <main className="ml-16 pt-14 h-screen flex flex-col">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-4 m-4">
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1">
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
          <div className="flex flex-1 min-h-0">
            {/* Email List - Left Panel */}
            <div className="w-96 flex-shrink-0 border-r border-slate-800 flex flex-col">
              {/* List Header */}
              <div className="p-4 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-lg font-semibold text-white">Inbox</h1>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {emails.length} emails
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={syncEmails}
                      disabled={syncing}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-1.5 px-3 rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                      {syncing ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                          <path d="M21 3v5h-5" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setComposing(true);
                        setSelectedEmail(null);
                        setComposeData({ to: '', cc: '', bcc: '', subject: '', body: '' });
                        setExtraFields([]);
                      }}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-1.5 px-3 rounded-lg text-sm transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Email List */}
              <div className="flex-1 overflow-y-auto">
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
                  <div className="divide-y divide-slate-800/50">
                    {emails.map((email) => (
                      <div
                        key={email.id}
                        onClick={() => handleSelectEmail(email)}
                        className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${
                          selectedEmail?.id === email.id
                            ? 'bg-slate-800'
                            : !email.is_read
                            ? 'bg-slate-900/50 hover:bg-slate-800/50'
                            : 'hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex-shrink-0 w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-slate-300">
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
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {email.snippet}
                          </p>
                        </div>
                        {email.has_attachments && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-1">
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Email Content - Right Panel */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {composing ? (
                /* Compose Form */
                <div className="flex flex-col h-full">
                  {/* Compose Header with Send Button */}
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">New Message</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          if (!composeData.to || !composeData.subject) {
                            alert('Please fill in To and Subject fields');
                            return;
                          }
                          setSending(true);
                          try {
                            await api.post('/api/v1/emails/send', {
                              to: composeData.to,
                              cc: composeData.cc || undefined,
                              bcc: composeData.bcc || undefined,
                              subject: composeData.subject,
                              body: composeData.body,
                            });
                            setComposing(false);
                            setComposeData({ to: '', cc: '', bcc: '', subject: '', body: '' });
                            setExtraFields([]);
                            await loadEmails();
                          } catch (err) {
                            console.error('Failed to send email:', err);
                            alert(err.response?.data?.detail || 'Failed to send email');
                          } finally {
                            setSending(false);
                          }
                        }}
                        disabled={sending}
                        className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {sending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                              <line x1="22" y1="2" x2="11" y2="13" />
                              <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                            Send
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setComposing(false);
                          setComposeData({ to: '', cc: '', bcc: '', subject: '', body: '' });
                          setExtraFields([]);
                        }}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Close"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Compose Form Fields */}
                  <div className="flex flex-col border-b border-slate-800">
                    {/* To Field */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/50">
                      <label className="text-sm text-slate-400 w-16 flex-shrink-0">To</label>
                      <input
                        type="email"
                        value={composeData.to}
                        onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                        placeholder="recipient@example.com"
                        className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-600"
                      />
                      {/* Add CC/BCC Button */}
                      {extraFields.length < 2 && (
                        <div className="relative group">
                          <button
                            onClick={() => {
                              const available = ['cc', 'bcc'].filter(f => !extraFields.includes(f));
                              if (available.length === 1) {
                                setExtraFields([...extraFields, available[0]]);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded transition-colors"
                            title="Add Cc or Bcc"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          </button>
                          {/* Dropdown for CC/BCC selection */}
                          <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[100px]">
                            {!extraFields.includes('cc') && (
                              <button
                                onClick={() => setExtraFields([...extraFields, 'cc'])}
                                className="block w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors whitespace-nowrap"
                              >
                                Add Cc
                              </button>
                            )}
                            {!extraFields.includes('bcc') && (
                              <button
                                onClick={() => setExtraFields([...extraFields, 'bcc'])}
                                className="block w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors whitespace-nowrap"
                              >
                                Add Bcc
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CC Field */}
                    {extraFields.includes('cc') && (
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/50 bg-slate-900/30">
                        <label className="text-sm text-slate-400 w-16 flex-shrink-0">Cc</label>
                        <input
                          type="email"
                          value={composeData.cc}
                          onChange={(e) => setComposeData({ ...composeData, cc: e.target.value })}
                          placeholder="cc@example.com"
                          className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-600"
                        />
                        <button
                          onClick={() => {
                            setExtraFields(extraFields.filter(f => f !== 'cc'));
                            setComposeData({ ...composeData, cc: '' });
                          }}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                          title="Remove Cc"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* BCC Field */}
                    {extraFields.includes('bcc') && (
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/50 bg-slate-900/30">
                        <label className="text-sm text-slate-400 w-16 flex-shrink-0">Bcc</label>
                        <input
                          type="email"
                          value={composeData.bcc}
                          onChange={(e) => setComposeData({ ...composeData, bcc: e.target.value })}
                          placeholder="bcc@example.com"
                          className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-600"
                        />
                        <button
                          onClick={() => {
                            setExtraFields(extraFields.filter(f => f !== 'bcc'));
                            setComposeData({ ...composeData, bcc: '' });
                          }}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                          title="Remove Bcc"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Subject Field */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <label className="text-sm text-slate-400 w-16 flex-shrink-0">Subject</label>
                      <input
                        type="text"
                        value={composeData.subject}
                        onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                        placeholder="Enter subject"
                        className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Rich Text Editor */}
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <RichTextEditor
                      content={composeData.body}
                      onChange={(html) => setComposeData({ ...composeData, body: html })}
                      placeholder="Write your message..."
                    />
                  </div>
                </div>
              ) : selectedEmail ? (
                <>
                  {/* Email Header */}
                  <div className="p-6 border-b border-slate-800">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-semibold text-white mb-3">
                          {selectedEmail.subject || '(no subject)'}
                        </h2>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-white">
                              {(selectedEmail.from_name || selectedEmail.from_email || '?')[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white">
                              {selectedEmail.from_name || 'Unknown'}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {selectedEmail.from_email}
                            </p>
                          </div>
                          <p className="text-xs text-slate-500 ml-auto flex-shrink-0">
                            {formatFullDate(selectedEmail.date)}
                          </p>
                        </div>
                        {emailBody?.to_email && (
                          <p className="text-xs text-slate-500 mt-2">
                            To: {emailBody.to_email}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Reply"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <polyline points="9 17 4 12 9 7" />
                            <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                          </svg>
                        </button>
                        <button
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Forward"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <polyline points="15 17 20 12 15 7" />
                            <path d="M4 18v-2a4 4 0 0 1 4-4h12" />
                          </svg>
                        </button>
                        <button
                          className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Star"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </button>
                        <button
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Attachments - Top, horizontal scroll */}
                  {emailBody?.attachments?.length > 0 && (
                    <div className="px-6 py-3 border-b border-slate-800 flex-shrink-0">
                      <div className="flex items-center gap-3 overflow-x-auto">
                        <span className="text-xs text-slate-500 flex-shrink-0">
                          {emailBody.attachments.length} attachment{emailBody.attachments.length > 1 ? 's' : ''}
                        </span>
                        {emailBody.attachments.map((attachment) => (
                          <a
                            key={attachment.id}
                            href={`${import.meta.env.VITE_API_URL}/api/v1/emails/${selectedEmail.id}/attachments/${attachment.id}?token=${encodeURIComponent(localStorage.getItem('token'))}`}
                            download={attachment.filename}
                            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors flex-shrink-0"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-400 flex-shrink-0">
                              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                            </svg>
                            <span className="text-sm text-white truncate max-w-[150px]">
                              {attachment.filename}
                            </span>
                            <span className="text-xs text-slate-500 flex-shrink-0">
                              {formatFileSize(attachment.size)}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Email Body */}
                  <div className="flex-1 overflow-y-auto">
                    {loadingBody ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : emailBody ? (
                      <div className="bg-slate-950 h-full">
                        {emailBody.html_body ? (
                          <iframe
                            srcDoc={darkModeStyles + emailBody.html_body}
                            className="w-full h-full border-0"
                            sandbox="allow-same-origin allow-scripts"
                            title="Email content"
                          />
                        ) : (
                          <pre className="whitespace-pre-wrap p-6 text-sm text-slate-200 font-sans h-full bg-slate-950">
                            {emailBody.text_body || selectedEmail.snippet}
                          </pre>
                        )}
                      </div>
                    ) : (
                      <div className="p-6">
                        <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-800">
                          <p className="text-slate-400 text-sm">
                            {selectedEmail.snippet}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* No Email Selected */
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="w-8 h-8 text-slate-600"
                      >
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <polyline points="3 7 12 13 21 7" />
                      </svg>
                    </div>
                    <p className="text-slate-500 text-sm">
                      Select an email to read
                    </p>
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
