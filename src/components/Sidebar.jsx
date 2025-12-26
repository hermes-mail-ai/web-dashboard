import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../services/auth';

function Sidebar({ user, draftsCount = 0, isOpen = true, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const buttonRef = useRef(null);
  const popupRef = useRef(null);
  const userMenuRef = useRef(null);
  const userButtonRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Close sidebar on navigation (mobile)
  const handleNavigate = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const emailOptions = [
    { name: 'Inbox', path: '/mail/inbox', icon: 'inbox' },
    { name: 'Starred', path: '/mail/starred', icon: 'star' },
    { name: 'Sent', path: '/mail/sent', icon: 'send' },
    { name: 'Drafts', path: '/mail/drafts', icon: 'draft', count: draftsCount },
    { name: 'Trash', path: '/mail/trash', icon: 'trash' },
  ];

  const getInitials = () => {
    if (!user?.name) return '?';
    const parts = user.name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current && 
        !popupRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowEmailPopup(false);
      }
      if (
        userMenuRef.current && 
        !userMenuRef.current.contains(event.target) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target)
      ) {
        setShowUserMenu(false);
      }
    };

    if (showEmailPopup || showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmailPopup, showUserMenu]);

  const getIcon = (icon) => {
    const iconClass = "w-5 h-5";
    switch (icon) {
      case 'inbox':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        );
      case 'star':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
        );
      case 'snooze':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        );
      case 'send':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        );
      case 'draft':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.99 8c0-.72-.37-1.35-.94-1.7L12 1 2.95 6.3C2.38 6.65 2 7.28 2 8v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2l-.01-10zM12 13L3.74 7.84 12 3l8.26 4.84L12 13z"/>
          </svg>
        );
      case 'purchase':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 18c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM1 2v2h2l3.6 7.59-1.35 2.45c-.15.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        );
      case 'important':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      case 'schedule':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
          </svg>
        );
      case 'all':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
          </svg>
        );
      case 'spam':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.79 21L3 11.21v2c0 .53.21 1.04.59 1.41l7.79 7.79c.78.78 2.05.78 2.83 0l6.21-6.21c.78-.78.78-2.05 0-2.83L12.79 21z"/>
            <path d="M11.38 17.41c.39.39.9.59 1.41.59.51 0 1.02-.2 1.41-.59l6.21-6.21c.78-.78.78-2.05 0-2.83L12.62 2.18C12.25 1.81 11.74 1.6 11.21 1.6H5c-1.11 0-2 .89-2 2v6.21c0 .53.21 1.04.59 1.41l7.79 7.79zM5 10V4h5.21l7.79 7.79-5.21 5.21L5 10z"/>
          </svg>
        );
      case 'trash':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        );
      case 'subscriptions':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        );
      case 'labels':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7.01v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z"/>
          </svg>
        );
      case 'add-label':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  // Calculate popup position based on button position
  const getPopupPosition = () => {
    if (!buttonRef.current) return { top: 60, left: 80 };
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.right + 8,
    };
  };

  const popupPosition = showEmailPopup ? getPopupPosition() : null;

  // Calculate user menu position - positioned so Logout button aligns with profile icon
  const getUserMenuPosition = () => {
    if (!userButtonRef.current) return { top: 0, left: 0 };
    const rect = userButtonRef.current.getBoundingClientRect();
    // Position popup so the Logout button (last item) aligns horizontally with the profile icon
    // Popup structure: header (~60px) + Settings button (~40px) + Logout button (~40px) = ~140px total
    // Position so Logout button center aligns with profile icon center
    const popupHeight = 140; // Approximate total height
    const logoutButtonHeight = 40; // Approximate Logout button height
    const profileIconCenter = rect.top + rect.height / 2;
    const logoutButtonCenter = profileIconCenter;
    const popupTop = logoutButtonCenter - (popupHeight - logoutButtonHeight / 2);
    
    return {
      top: popupTop,
      left: rect.right + 8,
    };
  };

  const userMenuPosition = showUserMenu ? getUserMenuPosition() : null;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-20"
          onClick={onClose}
        />
      )}

      <aside className={`fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-slate-900 border-r border-slate-700 z-30 w-16 flex flex-col transition-transform duration-200 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-2">
            {/* Email Icon Button */}
            <button
              ref={buttonRef}
              onClick={() => setShowEmailPopup(!showEmailPopup)}
              className={`relative w-full aspect-square flex items-center justify-center rounded-lg transition-colors ${
                emailOptions.some(option => isActive(option.path))
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-slate-800'
              }`}
              title="Email"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {getIcon('inbox')}
              </div>
            </button>

            {/* Calendar Icon Button (Disabled) */}
            <button
              disabled
              className="w-full aspect-square flex items-center justify-center rounded-lg text-gray-500 cursor-not-allowed opacity-50"
              title="Coming Soon"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
              </svg>
            </button>

            {/* People Icon Button */}
            <button
              onClick={() => handleNavigate('/people')}
              className={`w-full aspect-square flex items-center justify-center rounded-lg transition-colors ${
                location.pathname.startsWith('/people')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-slate-800'
              }`}
              title="People"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Profile Icon at Bottom - aligned with pagination bar */}
        <div className="px-2 border-t border-slate-700 h-[52px] flex items-center justify-center">
          <button
            ref={userButtonRef}
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm hover:opacity-90 transition-opacity"
            title="Account"
            data-tour="ai-profile"
          >
            {getInitials()}
          </button>
        </div>
      </aside>

      {/* Email Popup Overlay - Rendered outside sidebar */}
      {showEmailPopup && popupPosition && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[9998]"
            onClick={() => setShowEmailPopup(false)}
          />
          {/* Popup Menu */}
          <div
            ref={popupRef}
            className="fixed w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden z-[9999]"
            style={{
              top: `${popupPosition.top}px`,
              left: `${popupPosition.left}px`,
            }}
          >
            <div className="py-1">
              {emailOptions.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    handleNavigate(item.path);
                    setShowEmailPopup(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-gray-200 hover:bg-slate-700'
                  }`}
                >
                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                    {getIcon(item.icon)}
                  </div>
                  <span className="flex-1">{item.name}</span>
                  {item.count > 0 && (
                    <span className="px-1.5 py-0.5 text-xs bg-slate-600 text-gray-300 rounded">
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* User Menu Overlay - Rendered outside sidebar */}
      {showUserMenu && userMenuPosition && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[9998]"
            onClick={() => setShowUserMenu(false)}
          />
          {/* User Menu Dropdown */}
          <div
            ref={userMenuRef}
            className="fixed w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden z-[9999]"
            style={{
              top: `${userMenuPosition.top}px`,
              left: `${userMenuPosition.left}px`,
            }}
          >
            <div className="px-4 py-3 border-b border-slate-700">
              <p className="text-sm font-medium text-gray-200 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <div className="py-1">
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  handleNavigate('/profile');
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-slate-700 flex items-center gap-2 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                AI Profile
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  handleNavigate('/settings');
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-slate-700 flex items-center gap-2 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Settings
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-slate-700 flex items-center gap-2 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
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
    </>
  );
}

export default Sidebar;
