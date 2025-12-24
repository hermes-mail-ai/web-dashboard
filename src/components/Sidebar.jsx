import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../services/auth';

function Sidebar({ user, collapsed = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userLabels, setUserLabels] = useState([]);

  const getInitials = () => {
    if (!user?.name) return '?';
    const parts = user.name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const isActive = (path) => location.pathname === path;

  const mainNavItems = [
    { name: 'Inbox', path: '/mail/inbox', icon: 'inbox', count: null },
    { name: 'Starred', path: '/mail/starred', icon: 'star', count: null },
    { name: 'Snoozed', path: '/mail/snoozed', icon: 'snooze', count: null },
    { name: 'Sent', path: '/mail/sent', icon: 'send', count: null },
    { name: 'Drafts', path: '/mail/drafts', icon: 'draft', count: 8 },
    { name: 'Purchases', path: '/mail/purchases', icon: 'purchase', count: 7 },
  ];

  const moreItems = [
    { name: 'Important', path: '/mail/important', icon: 'important' },
    { name: 'Scheduled', path: '/mail/scheduled', icon: 'schedule' },
    { name: 'All Mail', path: '/mail/all', icon: 'all' },
    { name: 'Spam', path: '/mail/spam', icon: 'spam' },
    { name: 'Trash', path: '/mail/trash', icon: 'trash' },
    { name: 'Manage Subscriptions', path: '/mail/subscriptions', icon: 'subscriptions' },
    { name: 'Manage Labels', path: '/mail/labels', icon: 'labels' },
    { name: 'Create New Label', path: '/mail/labels/new', icon: 'add-label' },
  ];

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

  return (
    <aside className={`fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-slate-900 border-r border-slate-700 overflow-hidden z-30 transition-all duration-500 ease-in-out ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="h-full overflow-y-auto">
      <div className="p-2">
        {/* Compose Button */}
        <button
          onClick={() => {/* TODO: Open compose modal */}}
          className="relative w-full bg-slate-800 hover:bg-slate-700 text-gray-200 font-medium py-3 rounded-full shadow-sm border border-slate-600 flex items-center gap-2 mb-2 transition-all hover:shadow-md overflow-hidden"
          title={collapsed ? "Compose" : undefined}
        >
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center ml-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </div>
          <span className={`whitespace-nowrap transition-all duration-500 ease-in-out ${
            collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
          }`}>Compose</span>
        </button>

        {/* Main Navigation */}
        <nav className="space-y-1">
          {mainNavItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative w-full flex items-center py-2 rounded-r-full transition-colors overflow-hidden ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-300 hover:bg-slate-800'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center ml-3">
                {getIcon(item.icon)}
              </div>
              <div className={`flex items-center flex-1 gap-2 transition-all duration-500 ease-in-out ${
                collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 ml-3'
              }`}>
                <span className="text-left">{item.name}</span>
                {item.count !== null && (
                  <span className="text-sm text-gray-400">{item.count}</span>
                )}
              </div>
            </button>
          ))}
        </nav>

        {/* More Section */}
        {!collapsed && (
          <div className="mt-2">
            <button
              onClick={() => setShowMore(!showMore)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-r-full text-gray-300 hover:bg-slate-800 transition-colors"
            >
              <svg 
                className={`w-5 h-5 transition-transform ${showMore ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M7 10l5 5 5-5z"/>
              </svg>
              <span className="flex-1 text-left">{showMore ? 'Less' : 'More'}</span>
            </button>
            {showMore && (
              <div className="mt-1 space-y-1">
                {moreItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`relative w-full flex items-center py-2 rounded-r-full transition-colors overflow-hidden ${
                      isActive(item.path)
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-gray-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center ml-3">
                      {getIcon(item.icon)}
                    </div>
                    <div className="flex items-center flex-1 gap-2 ml-3">
                      <span className="text-left">{item.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* More items as icons when collapsed */}
        {collapsed && (
          <div className="mt-2 space-y-1">
            {moreItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative w-full flex items-center py-2 rounded-r-full transition-colors overflow-hidden ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-300 hover:bg-slate-800'
                }`}
                title={item.name}
              >
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center ml-3">
                  {getIcon(item.icon)}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Labels Section */}
        {!collapsed && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="px-3 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400 uppercase">Labels</span>
                <button
                  onClick={() => {
                    const labelName = prompt('Enter label name:');
                    if (labelName && labelName.trim()) {
                      setUserLabels([...userLabels, { id: Date.now(), name: labelName.trim() }]);
                    }
                  }}
                  className="text-gray-400 hover:text-gray-300 p-1"
                  title="Create new label"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="space-y-1">
              {userLabels.map((label) => (
                <button
                  key={label.id}
                  onClick={() => {
                    // TODO: Filter by label
                  }}
                  className="relative w-full flex items-center py-2 rounded-r-full text-gray-300 hover:bg-slate-800 transition-colors overflow-hidden"
                >
                  <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center ml-3">
                    {getIcon('labels')}
                  </div>
                  <div className="flex items-center flex-1 gap-2 ml-3">
                    <span className="text-left text-sm">{label.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      </div>
    </aside>
  );
}

export default Sidebar;
