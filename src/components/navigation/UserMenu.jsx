import { forwardRef } from 'react';
import { SettingsIcon, LogoutIcon, UserIcon } from './SidebarIcons';

/**
 * User profile dropdown menu component
 */
const UserMenu = forwardRef(function UserMenu({
  user,
  onNavigate,
  onLogout,
  onClose,
  position,
}, ref) {
  const handleNavigate = (path) => {
    onClose();
    onNavigate(path);
  };

  const handleLogout = () => {
    onClose();
    onLogout();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={onClose}
      />
      {/* User Menu Dropdown */}
      <div
        ref={ref}
        className="fixed w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden z-[9999]"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <div className="px-4 py-3 border-b border-slate-700">
          <p className="text-sm font-medium text-gray-200 truncate">{user?.name || 'User'}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>
        <div className="py-1">
          <button
            onClick={() => handleNavigate('/profile')}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-slate-700 flex items-center gap-2 transition-colors"
          >
            <UserIcon className="w-4 h-4" />
            AI Profile
          </button>
          <button
            onClick={() => handleNavigate('/settings')}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-slate-700 flex items-center gap-2 transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-slate-700 flex items-center gap-2 transition-colors"
          >
            <LogoutIcon className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
});

export default UserMenu;
