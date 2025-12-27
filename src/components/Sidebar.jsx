import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../services/auth';
import SidebarNav, { UserProfileButton } from './navigation/SidebarNav';
import UserMenu from './navigation/UserMenu';
import EmailFolderPopup from './navigation/EmailFolderPopup';

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

  // Calculate popup position based on button position
  const getPopupPosition = () => {
    if (!buttonRef.current) return { top: 60, left: 80, arrowOffset: 0 };
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.right + 8,
      arrowOffset: rect.top + rect.height / 2, // Vertical center of button for arrow alignment
    };
  };

  // Calculate user menu position - positioned above the profile button
  const getUserMenuPosition = () => {
    if (!userButtonRef.current) return { top: 0, left: 0 };
    const rect = userButtonRef.current.getBoundingClientRect();
    const popupHeight = 180; // Approximate height of the menu

    // Position popup above the profile button
    const popupTop = rect.top - popupHeight + 20;

    return {
      top: Math.max(60, popupTop), // Ensure it doesn't go above the header
      left: rect.right + 8,
    };
  };

  const popupPosition = showEmailPopup ? getPopupPosition() : null;
  const userMenuPosition = showUserMenu ? getUserMenuPosition() : null;

  const isEmailActive = emailOptions.some(option => isActive(option.path));
  const isPeopleActive = location.pathname.startsWith('/people');

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
          <SidebarNav
            isEmailActive={isEmailActive}
            isPeopleActive={isPeopleActive}
            onEmailClick={() => setShowEmailPopup(!showEmailPopup)}
            onPeopleClick={() => handleNavigate('/people')}
            emailButtonRef={buttonRef}
          />
        </div>

        <UserProfileButton
          ref={userButtonRef}
          user={user}
          onClick={() => setShowUserMenu(!showUserMenu)}
        />
      </aside>

      {/* Email Popup Overlay */}
      {showEmailPopup && popupPosition && (
        <EmailFolderPopup
          ref={popupRef}
          emailOptions={emailOptions}
          isActive={isActive}
          onNavigate={handleNavigate}
          onClose={() => setShowEmailPopup(false)}
          position={popupPosition}
        />
      )}

      {/* User Menu Overlay */}
      {showUserMenu && userMenuPosition && (
        <UserMenu
          ref={userMenuRef}
          user={user}
          onNavigate={handleNavigate}
          onLogout={logout}
          onClose={() => setShowUserMenu(false)}
          position={userMenuPosition}
        />
      )}
    </>
  );
}

export default Sidebar;
