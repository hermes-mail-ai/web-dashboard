import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';

function NotFound() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src="/logo.png" alt="Hermes" className="h-12 w-12" />
            <span className="text-xl font-semibold text-white">Hermes Mail</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          {/* 404 Icon */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-slate-700 flex items-center justify-center mx-auto mb-8">
            <svg
              className="w-12 h-12 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
              <path d="M8 8l6 6M14 8l-6 6" />
            </svg>
          </div>

          {/* Error Code */}
          <h1 className="text-7xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            404
          </h1>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-white mb-4">
            Page Not Found
          </h2>

          {/* Description */}
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/25"
            >
              Go Home
            </button>
            {authenticated && (
              <button
                onClick={() => navigate('/mail/inbox')}
                className="px-6 py-3 font-medium text-gray-300 hover:text-white border border-slate-700 rounded-xl hover:border-slate-600 hover:bg-slate-800/50 transition-all"
              >
                Go to Inbox
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
            <img src="/logo.png" alt="Hermes" className="h-5 w-5 opacity-50" />
            <span>&copy; {new Date().getFullYear()} Hermes Mail. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default NotFound;
