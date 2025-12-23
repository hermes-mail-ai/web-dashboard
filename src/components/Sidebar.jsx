import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../services/auth';

function Sidebar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMailMenu, setShowMailMenu] = useState(false);

  const getInitials = () => {
    if (!user?.name) return '?';
    const parts = user.name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const isMailActive = location.pathname.startsWith('/mail');

  const mailMenuItems = [
    { name: 'Inbox', path: '/mail/inbox', icon: 'inbox' },
    { name: 'Starred', path: '/mail/starred', icon: 'star' },
    { name: 'Sent', path: '/mail/sent', icon: 'send' },
    { name: 'Trash', path: '/mail/trash', icon: 'trash' },
  ];

  const getIcon = (icon) => {
    switch (icon) {
      case 'inbox':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <polyline points="3 7 12 13 21 7" />
          </svg>
        );
      case 'star':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      case 'send':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        );
      case 'trash':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-16 bg-slate-900 flex flex-col items-center py-4 z-40">
      {/* Top section - Navigation */}
      <div className="flex flex-col items-center gap-2">
        {/* Mail Button with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMailMenu(!showMailMenu)}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
              isMailActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Mail"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <polyline points="3 7 12 13 21 7" />
            </svg>
          </button>

          {/* Mail Menu Dropdown */}
          {showMailMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMailMenu(false)}
              />
              <div className="absolute top-0 left-full ml-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden z-50">
                <div className="py-1">
                  {mailMenuItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        setShowMailMenu(false);
                        navigate(item.path);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${
                        location.pathname === item.path
                          ? 'bg-slate-700 text-white'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {getIcon(item.icon)}
                      {item.name}
                      {item.path !== '/mail/inbox' && (
                        <span className="ml-auto text-xs text-slate-500">Soon</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Calendar Button (disabled) */}
        <button
          disabled
          className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-600 cursor-not-allowed"
          title="Calendar (Coming Soon)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom section - User Profile */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm hover:scale-105 transition-transform duration-200 shadow-lg"
          title={user?.name || user?.email || 'Profile'}
        >
          {getInitials()}
        </button>

        {/* User Menu Dropdown */}
        {showUserMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowUserMenu(false)}
            />
            <div className="absolute bottom-0 left-full ml-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-700">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2 transition-colors"
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
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                  Settings
                </button>
                <button
                  onClick={logout}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2 transition-colors"
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
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
