import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Header({ onSearch, searchQuery, onToggleSidebar, isSidebarCollapsed }) {
  const navigate = useNavigate();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(localSearchQuery);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-300 flex items-center px-4 z-50">
      {/* Hamburger Menu */}
      <button
        onClick={onToggleSidebar}
        className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 mr-2 transition-colors"
        title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/mail/inbox')}
          className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors mr-[65px]"
        >
          <span className="text-xl font-normal text-gray-700">Hermes Mail</span>
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-3xl">
        <div className="relative flex items-center bg-gray-100 rounded-lg px-4 py-2 hover:bg-gray-200 hover:shadow-md transition-all focus-within:bg-white focus-within:shadow-md">
          <svg className="w-5 h-5 text-gray-500 mr-3" viewBox="0 0 24 24" fill="currentColor">
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
            className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
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
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          )}
        </div>
      </form>
    </header>
  );
}

export default Header;
