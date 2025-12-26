import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Header({ user, onMenuClick, showMenuButton = false, onHelpClick }) {
  const navigate = useNavigate();
  const [showBugMenu, setShowBugMenu] = useState(false);
  const bugButtonRef = useRef(null);
  const bugMenuRef = useRef(null);

  // Calculate bug menu position - aligned to the right edge of the button
  const getBugMenuPosition = () => {
    if (!bugButtonRef.current) return { top: 0, left: 0 };
    const rect = bugButtonRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right, // Align right edge with button's right edge
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
      {/* Mobile Menu Button */}
      {showMenuButton && (
        <button
          onClick={onMenuClick}
          className="md:hidden w-14 h-14 flex items-center justify-center text-gray-300 hover:bg-slate-800 transition-colors"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}

      {/* Logo area in top-left corner */}
      <div className="hidden md:flex w-16 h-14 items-center justify-center flex-shrink-0">
        <button
          onClick={() => navigate('/')}
          className="w-12 h-12 flex items-center justify-center hover:bg-slate-800 rounded-lg transition-colors"
          title="Go to Home"
        >
          <img src="/logo.png" alt="Hermes" className="w-16 h-16" />
        </button>
      </div>

      {/* App Title */}
      <div className="flex items-center">
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
          onClick={onHelpClick}
          className="w-10 h-10 rounded-full hover:bg-slate-800 flex items-center justify-center text-gray-300 transition-colors"
          title="Help"
          data-tour="help-button"
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
              right: `${bugMenuPosition.right}px`,
            }}
          >
            <div className="py-1">
              <button
                onClick={() => {
                  setShowBugMenu(false);
                  // TODO: Open bug report form
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-slate-700 flex items-center gap-2 transition-colors"
              >
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.5"/>
                    <path d="M10 4L8.5 2M14 4L15.5 2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                    <ellipse cx="12" cy="12" rx="4" ry="5"/>
                    <line x1="12" y1="8" x2="12" y2="16" stroke="#1e293b" strokeWidth="1"/>
                    <path d="M8 9L5 7.5M8 12L5 12M8 15L5 16.5M16 9L19 7.5M16 12L19 12M16 15L19 16.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  </svg>
                </div>
                <span>Report Bug</span>
              </button>
              <button
                onClick={() => {
                  setShowBugMenu(false);
                  // TODO: Open feedback form
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-slate-700 flex items-center gap-2 transition-colors"
              >
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                  </svg>
                </div>
                <span>Send Feedback</span>
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

export default Header;
