function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 z-50">
      {/* Logo / Title */}
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Hermes Mail
        </h1>
        <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">
          BETA
        </span>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <a
          href="https://google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 flex items-center justify-center text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
          title="Report a bug"
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
            <path d="M8 2l1.88 1.88" />
            <path d="M14.12 3.88L16 2" />
            <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
            <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
            <path d="M12 20v-9" />
            <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
            <path d="M6 13H2" />
            <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
            <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
            <path d="M22 13h-4" />
            <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
          </svg>
        </a>
      </div>
    </header>
  );
}

export default Header;
