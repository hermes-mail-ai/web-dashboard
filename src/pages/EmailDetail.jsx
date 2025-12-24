import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { isAuthenticated } from '../services/auth';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function EmailDetail() {
  const { emailId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadData();
  }, [emailId, navigate]);

  const loadData = async () => {
    try {
      const [userRes, emailRes] = await Promise.all([
        api.get('/api/v1/users/me'),
        api.get(`/api/v1/emails/${emailId}`),
      ]);
      setUser(userRes.data);
      setEmail(emailRes.data);
    } catch (err) {
      console.error('Failed to load email:', err);
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString([], { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header 
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isSidebarCollapsed={isSidebarCollapsed}
          user={user}
        />
        <Sidebar user={user} collapsed={isSidebarCollapsed} />
        <main className={`pt-14 min-h-screen flex items-center justify-center transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !email) {
    return (
      <div className="min-h-screen bg-white">
        <Header 
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isSidebarCollapsed={isSidebarCollapsed}
          user={user}
        />
        <Sidebar user={user} collapsed={isSidebarCollapsed} />
        <main className={`pt-14 min-h-screen flex items-center justify-center transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Email not found'}</p>
            <button
              onClick={() => navigate('/mail/inbox')}
              className="text-blue-600 hover:text-blue-800"
            >
              Back to Inbox
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isSidebarCollapsed={isSidebarCollapsed}
        user={user}
      />
      <Sidebar user={user} collapsed={isSidebarCollapsed} />
      <main className={`pt-14 min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="max-w-4xl mx-auto p-6">
          {/* Back button */}
          <button
            onClick={() => navigate('/mail/inbox')}
            className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>

          {/* Email Header */}
          <div className="bg-white border-b border-gray-200 pb-4 mb-6">
            <h1 className="text-2xl font-normal text-gray-900 mb-4">{email.subject || '(no subject)'}</h1>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-700 font-medium">
                      {(email.from_name || email.from_email || '?')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {email.from_name || email.from_email || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500">{email.from_email}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 ml-12">{formatDate(email.date)}</p>
              </div>
              <div className="flex items-center gap-2">
                {email.has_attachments && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                    </svg>
                    Attachment
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Email Summary */}
          {email.summary && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r">
              <h2 className="text-sm font-semibold text-blue-900 mb-2">Summary</h2>
              <p className="text-sm text-blue-800">{email.summary}</p>
            </div>
          )}

          {/* Email Body */}
          <div className="prose max-w-none">
            {email.body_html ? (
              <div 
                dangerouslySetInnerHTML={{ __html: email.body_html }}
                className="text-gray-900"
              />
            ) : (
              <p className="text-gray-900 whitespace-pre-wrap">{email.body_text}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default EmailDetail;

