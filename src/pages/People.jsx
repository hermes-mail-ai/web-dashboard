import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { isAuthenticated } from '../services/auth';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function People() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountId, setAccountId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      // Get user and their account
      const [userRes, accountsRes] = await Promise.all([
        api.get('/api/v1/users/me'),
        api.get('/api/v1/accounts'),
      ]);
      setUser(userRes.data);

      // Get contacts for the first account
      if (accountsRes.data.length > 0) {
        const accId = accountsRes.data[0].id;
        setAccountId(accId);
        const contactsRes = await api.get(`/api/v1/contacts/${accId}`);
        setContacts(contactsRes.data.contacts || []);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.display_name && contact.display_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
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

  return (
    <div className="min-h-screen bg-slate-900">
      <Header user={user} />
      <Sidebar user={user} />

      <main className="pt-14 min-h-screen ml-16">
        <div className="max-w-6xl mx-auto p-6 w-full">
          {/* Header */}
          <div className="mb-6">
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-normal text-gray-100">People</h1>
                <p className="text-gray-400 text-sm mt-1">
                  Contacts with AI-generated context for smarter email composition
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Contacts List */}
          {contacts.length === 0 ? (
            <div className="text-center py-16 bg-slate-800 rounded-lg border border-slate-700">
              <svg
                className="w-12 h-12 text-gray-600 mx-auto mb-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <p className="text-gray-400 text-lg mb-2">No contacts yet</p>
              <p className="text-gray-500 text-sm">
                Contacts are automatically created when you receive emails from people.
              </p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-16 bg-slate-800 rounded-lg border border-slate-700">
              <p className="text-gray-400">No contacts match your search</p>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <div className="divide-y divide-slate-700">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => navigate(`/people/${accountId}/${contact.id}`)}
                    className="flex items-center gap-4 p-4 hover:bg-slate-700/50 cursor-pointer transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-lg flex-shrink-0">
                      {getInitials(contact.display_name, contact.email)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-100 truncate">
                          {contact.display_name || contact.email.split('@')[0]}
                        </p>
                        {contact.has_context && (
                          <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                            AI Context
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate">{contact.email}</p>
                      {contact.relationship_type && (
                        <p className="text-xs text-gray-500 capitalize mt-0.5">
                          {contact.relationship_type}
                          {contact.organization && ` at ${contact.organization}`}
                        </p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-gray-400">{contact.email_count} emails</p>
                      <p className="text-xs text-gray-500">
                        Last: {formatDate(contact.last_interaction)}
                      </p>
                    </div>

                    {/* Arrow */}
                    <svg
                      className="w-5 h-5 text-gray-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats footer */}
          {contacts.length > 0 && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              {filteredContacts.length} of {contacts.length} contacts
              {contacts.filter((c) => c.has_context).length > 0 && (
                <span className="ml-2">
                  ({contacts.filter((c) => c.has_context).length} with AI context)
                </span>
              )}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default People;
