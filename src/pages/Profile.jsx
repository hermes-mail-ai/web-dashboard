import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { isAuthenticated } from '../services/auth';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Simplified profile form state
  const [profile, setProfile] = useState({
    full_name: '',
    preferred_tone: 'professional',
    additional_context: '',
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [userRes, profileRes] = await Promise.all([
        api.get('/api/v1/users/me'),
        api.get('/api/v1/profile'),
      ]);
      setUser(userRes.data);

      // If profile exists, populate form
      if (profileRes.data) {
        setProfile({
          full_name: profileRes.data.full_name || '',
          preferred_tone: profileRes.data.preferred_tone || 'professional',
          additional_context: profileRes.data.additional_context || '',
        });
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/api/v1/profile', profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
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
        <div className="max-w-2xl mx-auto p-6 w-full">
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-normal text-gray-100">AI Profile</h1>
                <p className="text-gray-400 text-sm mt-1">
                  Information used to personalize AI-generated emails
                </p>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Saved
                  </>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <section className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700">
              <h2 className="text-lg font-medium text-gray-100">Your Information</h2>
              <p className="text-sm text-gray-400 mt-1">
                The AI uses this to write personalized emails
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleChange}
                  placeholder="John Smith"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used for email signatures and introductions
                </p>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Tone
                </label>
                <select
                  name="preferred_tone"
                  value={profile.preferred_tone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="formal">Formal</option>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Can be overridden per-email or per-contact
                </p>
              </div>

              {/* Additional Context */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  About You
                </label>
                <textarea
                  name="additional_context"
                  value={profile.additional_context}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Tell the AI about yourself...&#10;&#10;Examples:&#10;- I'm a software engineer at Acme Corp&#10;- I'm a student at MIT studying Computer Science&#10;- I prefer concise emails and use specific terminology like..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include your role, organization, communication style, or any context the AI should know
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Profile;
