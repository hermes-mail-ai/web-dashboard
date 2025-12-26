import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
          {/* Header */}
          <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
            <div className="max-w-7xl mx-auto h-full px-6 flex items-center">
              <button
                onClick={this.handleGoHome}
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
              {/* Error Icon */}
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500/20 to-orange-600/20 border border-slate-700 flex items-center justify-center mx-auto mb-8">
                <svg
                  className="w-12 h-12 text-red-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-white mb-4">
                Something went wrong
              </h1>

              {/* Description */}
              <p className="text-gray-400 max-w-md mx-auto mb-8">
                We're sorry, but something unexpected happened. Please try refreshing the page
                or return to the home page.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={this.handleReload}
                  className="px-6 py-3 font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/25"
                >
                  Refresh Page
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="px-6 py-3 font-medium text-gray-300 hover:text-white border border-slate-700 rounded-xl hover:border-slate-600 hover:bg-slate-800/50 transition-all"
                >
                  Go Home
                </button>
              </div>

              {/* Error Details (Development Only) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="mt-8 text-left max-w-2xl mx-auto">
                  <details className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <summary className="text-gray-400 cursor-pointer hover:text-white">
                      Error Details
                    </summary>
                    <pre className="mt-4 text-sm text-red-400 overflow-auto">
                      {this.state.error.toString()}
                    </pre>
                  </details>
                </div>
              )}
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

    return this.props.children;
  }
}

export default ErrorBoundary;
