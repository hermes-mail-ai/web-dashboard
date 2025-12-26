import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/auth';

function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-50">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src="/logo.png" alt="Hermes" className="h-16 w-16" />
            <span className="text-xl font-semibold text-white">Hermes Mail</span>
          </button>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => navigate('/about')}
              className="text-sm text-white font-medium"
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

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Email reimagined for the{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                AI era
              </span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              Hermes is built on a simple belief: your inbox should work for you, not the other way around.
              We're using AI to make email faster, smarter, and less overwhelming.
            </p>
          </div>
        </div>

        {/* Mission Section */}
        <div className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  We believe email doesn't have to be a chore. Every day, billions of people spend hours
                  sorting through their inboxes, reading lengthy messages, and crafting responses.
                </p>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  Hermes uses advanced AI to understand your emails, summarize what matters,
                  and help you respond in a fraction of the time. We're not replacing email—we're
                  making it work the way it should.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  Our goal is simple: give you back the hours you lose to email every week,
                  so you can focus on what actually matters.
                </p>
              </div>
              <div className="flex justify-center">
                <div className="w-64 h-64 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-slate-700 flex items-center justify-center">
                  <img src="/logo.png" alt="Hermes" className="w-32 h-32" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <h2 className="text-3xl font-bold text-white text-center mb-12">What We Stand For</h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Value 1 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Privacy First</h3>
                <p className="text-gray-400">
                  Your emails are yours. We never sell your data, and we use local processing
                  whenever possible to keep your information private.
                </p>
              </div>

              {/* Value 2 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Time is Precious</h3>
                <p className="text-gray-400">
                  Every feature we build is designed to save you time. If it doesn't make
                  email faster or easier, we don't ship it.
                </p>
              </div>

              {/* Value 3 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Human-Centered AI</h3>
                <p className="text-gray-400">
                  AI should enhance your abilities, not replace your judgment. Hermes assists
                  you—you're always in control.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <h2 className="text-3xl font-bold text-white text-center mb-12">How Hermes Works</h2>

            <div className="max-w-3xl mx-auto space-y-8">
              {/* Step 1 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Connect Your Email</h3>
                  <p className="text-gray-400">
                    Link your Gmail or other email accounts securely. We use OAuth authentication
                    so we never see your password.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">AI Analyzes Your Inbox</h3>
                  <p className="text-gray-400">
                    Our AI reads and understands your emails, generating summaries,
                    detecting priority levels, and categorizing messages automatically.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Work Smarter</h3>
                  <p className="text-gray-400">
                    Read summaries instead of full emails, use AI to draft responses,
                    and let smart categorization show you what needs attention first.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to take back your inbox?
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Join thousands of users who have transformed their email experience with Hermes.
                Start your free trial today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={register}
                  className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/25"
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => navigate('/pricing')}
                  className="px-8 py-4 text-lg font-medium text-gray-300 hover:text-white border border-slate-700 rounded-xl hover:border-slate-600 hover:bg-slate-800/50 transition-all"
                >
                  View Pricing
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-8">
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
          </div>
        </footer>
      </main>
    </div>
  );
}

export default About;
