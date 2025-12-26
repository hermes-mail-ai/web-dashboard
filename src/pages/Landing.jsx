import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/auth';

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-50">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Hermes" className="h-16 w-16" />
            <span className="text-xl font-semibold text-white">Hermes Mail</span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-white font-medium"
            >
              Home
            </button>
            <button
              onClick={() => navigate('/about')}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              About
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={() => navigate('/blog')}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Blog
            </button>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={login}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Login
            </button>
            <button
              onClick={register}
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Hero */}
          <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center py-20">
            {/* Glowing orb effect */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Logo */}
              <div className="mb-8 flex justify-center">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
                  <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center">
                    <img src="/logo.png" alt="Hermes" className="w-24 h-24" />
                  </div>
                </div>
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Your Email,{' '}
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Supercharged
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Hermes uses AI to summarize your emails, prioritize what matters,
                and help you stay on top of your inbox without the overwhelm.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={register}
                  className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                >
                  Start for Free
                </button>
                <button
                  onClick={login}
                  className="px-8 py-4 text-lg font-medium text-gray-300 hover:text-white border border-slate-700 rounded-xl hover:border-slate-600 hover:bg-slate-800/50 transition-all"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-20 border-t border-slate-800">
            <h2 className="text-3xl font-bold text-white text-center mb-4">
              Why Hermes?
            </h2>
            <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
              Built for people who want to spend less time in their inbox and more time on what matters.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                    <circle cx="7.5" cy="14.5" r="1.5" />
                    <circle cx="16.5" cy="14.5" r="1.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">AI Summaries</h3>
                <p className="text-gray-400">
                  Get instant summaries of long emails. Know what's important without reading every word.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Smart Priority</h3>
                <p className="text-gray-400">
                  AI automatically categorizes and prioritizes your emails so you focus on what matters most.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Privacy First</h3>
                <p className="text-gray-400">
                  Your emails stay yours. We process locally when possible and never sell your data.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-20 border-t border-slate-800">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to transform your inbox?
              </h2>
              <p className="text-gray-400 mb-8">
                Join the beta and experience email the way it should be.
              </p>
              <button
                onClick={register}
                className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/25"
              >
                Get Started for Free
              </button>
            </div>
          </div>

          {/* Footer */}
          <footer className="py-8 border-t border-slate-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <img src="/logo.png" alt="Hermes" className="h-5 w-5 opacity-50" />
                <span>Hermes Mail</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <button
                  onClick={() => navigate('/terms')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Terms of Service
                </button>
                <button
                  onClick={() => navigate('/privacy')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </button>
              </div>
              <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Hermes. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default Landing;
