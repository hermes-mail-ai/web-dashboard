import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { isAuthenticated } from '../services/auth';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function PersonContext() {
  const navigate = useNavigate();
  const { accountId, contactId } = useParams();
  const [user, setUser] = useState(null);
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadData();
  }, [navigate, accountId, contactId]);

  const loadData = async () => {
    try {
      const [userRes, contactRes] = await Promise.all([
        api.get('/api/v1/users/me'),
        api.get(`/api/v1/contacts/${accountId}/${contactId}`),
      ]);
      setUser(userRes.data);
      setContact(contactRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshContext = async () => {
    setRefreshing(true);
    try {
      const res = await api.post(`/api/v1/contacts/${accountId}/${contactId}/refresh`);
      setContact(res.data.contact);
    } catch (err) {
      console.error('Failed to refresh context:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteContext = async () => {
    if (!confirm('Are you sure you want to delete all AI-generated context for this contact? This cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/api/v1/contacts/${accountId}/${contactId}`);
      // Reload to show cleared state
      const contactRes = await api.get(`/api/v1/contacts/${accountId}/${contactId}`);
      setContact(contactRes.data);
    } catch (err) {
      console.error('Failed to delete context:', err);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (name, email) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }
    return email[0].toUpperCase();
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

  if (!contact) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-gray-400">Contact not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header user={user} />
      <Sidebar user={user} />

      <main className="pt-14 min-h-screen ml-16">
        <div className="max-w-4xl mx-auto p-6 w-full">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/people')}
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
              Back to People
            </button>
          </div>

          {/* Contact Header */}
          <div className="flex items-start gap-6 mb-8">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-2xl flex-shrink-0">
              {getInitials(contact.display_name, contact.email)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-normal text-gray-100">
                {contact.display_name || contact.email.split('@')[0]}
              </h1>
              <p className="text-gray-400 mt-1">{contact.email}</p>
              {contact.relationship_type && (
                <p className="text-sm text-gray-500 mt-2 capitalize">
                  {contact.relationship_type}
                  {contact.organization && ` at ${contact.organization}`}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Stats */}
            <section className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-2xl font-light text-gray-100">{contact.email_count}</p>
                  <p className="text-sm text-gray-500">Emails</p>
                </div>
                <div>
                  <p className="text-lg text-gray-100">{formatDate(contact.last_interaction)}</p>
                  <p className="text-sm text-gray-500">Last Interaction</p>
                </div>
                <div>
                  <p className="text-lg text-gray-100 capitalize">
                    {contact.preferred_tone || 'Not set'}
                  </p>
                  <p className="text-sm text-gray-500">Preferred Tone</p>
                </div>
                <div>
                  <p className="text-lg text-gray-100">
                    {contact.has_context ? 'Generated' : 'Not Generated'}
                  </p>
                  <p className="text-sm text-gray-500">AI Context</p>
                </div>
              </div>
            </section>

            {/* AI Context */}
            <section className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-100">AI-Generated Context</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Insights learned from your email history
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRefreshContext}
                    disabled={refreshing}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    {refreshing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 2v6h-6" />
                          <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                          <path d="M3 22v-6h6" />
                          <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                        </svg>
                        {contact.has_context ? 'Refresh' : 'Generate'}
                      </>
                    )}
                  </button>
                  {contact.has_context && (
                    <button
                      onClick={handleDeleteContext}
                      disabled={deleting}
                      className="px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 text-sm font-medium rounded-lg transition-colors"
                    >
                      {deleting ? 'Deleting...' : 'Delete Context'}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {contact.context_summary ? (
                  <div className="space-y-6">
                    {/* Context Summary */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Summary</h3>
                      <p className="text-gray-200">{contact.context_summary}</p>
                    </div>

                    {/* Common Topics */}
                    {contact.common_topics && contact.common_topics.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Common Topics</h3>
                        <div className="flex flex-wrap gap-2">
                          {contact.common_topics.map((topic, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-slate-700 text-gray-300 rounded-full text-sm"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Relationship Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {contact.relationship_type && (
                        <div className="p-4 bg-slate-700/50 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Relationship</p>
                          <p className="text-gray-200 capitalize">{contact.relationship_type}</p>
                        </div>
                      )}
                      {contact.organization && (
                        <div className="p-4 bg-slate-700/50 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Organization</p>
                          <p className="text-gray-200">{contact.organization}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg
                      className="w-12 h-12 text-gray-600 mx-auto mb-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M12 2a10 10 0 1 0 10 10" />
                      <path d="M12 12L12 6" />
                      <path d="M12 12L16 12" />
                      <path d="M22 2L17 7" />
                      <path d="M22 7L17 7L17 2" />
                    </svg>
                    <p className="text-gray-400 mb-2">No AI context generated yet</p>
                    <p className="text-gray-500 text-sm mb-4">
                      Click "Generate" to analyze your email history with this contact
                    </p>
                    <button
                      onClick={handleRefreshContext}
                      disabled={refreshing}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {refreshing ? 'Generating...' : 'Generate Context'}
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Known Facts */}
            {contact.known_facts && contact.known_facts.length > 0 && (
              <section className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700">
                  <h2 className="text-lg font-medium text-gray-100">Known Facts</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Accumulated from email conversations
                  </p>
                </div>
                <div className="p-6">
                  <ul className="space-y-2">
                    {contact.known_facts.map((fact, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-200">
                        <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
                        <span className="text-sm">{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Privacy Notice */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <div>
                  <p className="text-sm text-gray-400">
                    This context is stored privately in your account and is used to personalize email composition.
                    You can delete it at any time using the "Delete Context" button.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PersonContext;
