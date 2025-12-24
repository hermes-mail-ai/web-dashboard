import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Header({ user }) {
  const navigate = useNavigate();
  const [showBugMenu, setShowBugMenu] = useState(false);
  const bugButtonRef = useRef(null);
  const bugMenuRef = useRef(null);

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
      {/* Logo */}
      <div className="flex items-center gap-3 pl-16">
        <button
          onClick={() => navigate('/mail/inbox')}
          className="flex items-center gap-2 hover:bg-slate-800 rounded-lg px-2 py-1 transition-colors"
        >
          <span className="text-xl font-normal text-gray-200">Hermes Mail</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">Beta</span>
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

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
          className="w-10 h-10 rounded-full hover:bg-slate-800 flex items-center justify-center text-amber-400 transition-colors"
          title="Report Bug"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            {/* Head */}
            <circle cx="12" cy="5" r="2"/>
            {/* Antennae */}
            <path d="M10 4L8 1.5M14 4L16 1.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            {/* Body */}
            <ellipse cx="12" cy="13" rx="5" ry="6"/>
            {/* Wing line */}
            <line x1="12" y1="8" x2="12" y2="18" stroke="#1e293b" strokeWidth="1.5"/>
            {/* Legs */}
            <path d="M7 10L3 8M7 13L3 13M7 16L3 18M17 10L21 8M17 13L21 13M17 16L21 18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
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
