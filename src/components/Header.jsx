import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Header({ onSearch, searchQuery, user }) {
  const navigate = useNavigate();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');
  const [showBugMenu, setShowBugMenu] = useState(false);
  const bugButtonRef = useRef(null);
  const bugMenuRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(localSearchQuery);
    }
  };

  // Calculate bug menu position - moved more to the left
  const getBugMenuPosition = () => {
    if (!bugButtonRef.current) return { top: 0, left: 0 };
    const rect = bugButtonRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 8,
      left: rect.left - 200, // Move 200px to the left
    };
  };

  const bugMenuPosition = showBugMenu ? getBugMenuPosition() : null;

  // Close bug menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        bugMenuRef.current && 
        !bugMenuRef.current.contains(event.target) &&
        bugButtonRef.current &&
        !bugButtonRef.current.contains(event.target)
      ) {
        setShowBugMenu(false);
      }
    };

    if (showBugMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBugMenu]);

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-slate-900 border-b border-slate-700 flex items-center z-50">
      {/* Logo - Aligned with sidebar border (64px) */}
      <div className="flex items-center gap-3 pl-16">
        <button
          onClick={() => navigate('/mail/inbox')}
          className="flex items-center gap-2 hover:bg-slate-800 rounded-lg px-2 py-1 transition-colors"
        >
          <span className="text-xl font-normal text-gray-200">Hermes Mail</span>
        </button>
      </div>

      {/* Search Bar - Aligned with inbox/email viewer separator (64px + 384px = 448px) */}
      <form onSubmit={handleSearch} className="flex-1 max-w-3xl pl-[448px]">
        <div className="relative flex items-center bg-slate-800 rounded-full px-4 py-2 hover:bg-slate-700 hover:shadow-md transition-all focus-within:bg-slate-700 focus-within:shadow-md">
          <svg className="w-5 h-5 text-gray-400 mr-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            value={localSearchQuery}
            onChange={(e) => {
              setLocalSearchQuery(e.target.value);
              if (onSearch) {
                onSearch(e.target.value);
              }
            }}
            placeholder="Search mail"
            className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-400"
          />
          {localSearchQuery && (
            <button
              type="button"
              onClick={() => {
                setLocalSearchQuery('');
                if (onSearch) {
                  onSearch('');
                }
              }}
              className="ml-2 text-gray-400 hover:text-gray-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Right side buttons */}
      <div className="flex items-center gap-2 ml-auto pr-2">
        {/* Help Button */}
        <button
          onClick={() => {
            // TODO: Open help
          }}
          className="w-10 h-10 rounded-full hover:bg-slate-800 flex items-center justify-center text-gray-300 transition-colors"
          title="Help"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </button>

        {/* Bug Button */}
        <button
          ref={bugButtonRef}
          onClick={() => setShowBugMenu(!showBugMenu)}
          className="w-10 h-10 rounded-full hover:bg-slate-800 flex items-center justify-center text-gray-300 transition-colors"
          title="Report Bug"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Beetle body */}
            <path d="M8 20V19C8 16.2386 10.2386 14 13 14H11C13.7614 14 16 16.2386 16 19V20" fill="none"/>
            <ellipse cx="12" cy="15" rx="5" ry="4" fill="currentColor" stroke="none"/>
            {/* Head */}
            <circle cx="12" cy="10" r="2.5" fill="currentColor" stroke="none"/>
            {/* Antennae */}
            <path d="M10 8L8 5" strokeWidth="1.5"/>
            <path d="M14 8L16 5" strokeWidth="1.5"/>
            {/* Legs */}
            <path d="M7 13L4 11" strokeWidth="1.5"/>
            <path d="M7 16L4 18" strokeWidth="1.5"/>
            <path d="M17 13L20 11" strokeWidth="1.5"/>
            <path d="M17 16L20 18" strokeWidth="1.5"/>
            {/* Wing line */}
            <line x1="12" y1="12" x2="12" y2="19" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
          </svg>
        </button>
      </div>

      {/* Bug Menu Overlay - Rendered outside header */}
      {showBugMenu && bugMenuPosition && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[9998]"
            onClick={() => setShowBugMenu(false)}
          />
          {/* Bug Menu Dropdown */}
          <div 
            ref={bugMenuRef}
            className="fixed w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden z-[9999]"
            style={{
              top: `${bugMenuPosition.top}px`,
              left: `${bugMenuPosition.left}px`,
            }}
          >
            <div className="px-4 py-3 border-b border-slate-700">
              <p className="text-sm font-medium text-gray-200">Report Bug</p>
              <p className="text-xs text-gray-400">Found an issue? Let us know!</p>
            </div>
            <div className="py-1">
              <button
                onClick={() => {
                  setShowBugMenu(false);
                  // TODO: Open bug report form or link
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
                  {/* Beetle body */}
                  <ellipse cx="12" cy="15" rx="5" ry="4" fill="currentColor" stroke="none"/>
                  {/* Head */}
                  <circle cx="12" cy="10" r="2.5" fill="currentColor" stroke="none"/>
                  {/* Antennae */}
                  <path d="M10 8L8 5" strokeWidth="1.5"/>
                  <path d="M14 8L16 5" strokeWidth="1.5"/>
                  {/* Legs */}
                  <path d="M7 13L4 11" strokeWidth="1.5"/>
                  <path d="M7 16L4 18" strokeWidth="1.5"/>
                  <path d="M17 13L20 11" strokeWidth="1.5"/>
                  <path d="M17 16L20 18" strokeWidth="1.5"/>
                  {/* Wing line */}
                  <line x1="12" y1="12" x2="12" y2="19" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
                </svg>
                Report Issue
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

export default Header;
