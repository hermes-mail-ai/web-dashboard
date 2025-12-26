import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/auth';

function Pricing() {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Starter',
      price: '7.99',
      description: 'Perfect for personal use',
      trial: '3-day free trial',
      features: [
        { label: 'Emails per day', value: '100' },
        { label: 'AI generations per day', value: '30' },
        { label: 'Context storage', value: '1 GB' },
        { label: 'AI summaries', value: true },
        { label: 'Smart categorization', value: true },
        { label: 'Priority support', value: false },
      ],
      popular: false,
      gradient: 'from-slate-600 to-slate-700',
    },
    {
      name: 'Pro',
      price: '11.99',
      description: 'Best for professionals',
      trial: '3-day free trial',
      features: [
        { label: 'Emails per day', value: '200' },
        { label: 'AI generations per day', value: '100' },
        { label: 'Context storage', value: '5 GB' },
        { label: 'AI summaries', value: true },
        { label: 'Smart categorization', value: true },
        { label: 'Priority support', value: true },
      ],
      popular: true,
      gradient: 'from-blue-500 to-purple-600',
    },
    {
      name: 'Business',
      price: '20.99',
      description: 'For power users & teams',
      trial: '3-day free trial',
      features: [
        { label: 'Emails per day', value: '500' },
        { label: 'AI generations per day', value: '300' },
        { label: 'Context storage', value: '20 GB' },
        { label: 'AI summaries', value: true },
        { label: 'Smart categorization', value: true },
        { label: 'Priority support', value: true },
      ],
      popular: false,
      gradient: 'from-purple-600 to-pink-600',
    },
  ];

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
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              About
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="text-sm text-white font-medium"
            >
              Pricing
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
        <div className="max-w-7xl mx-auto px-6 py-20">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Choose the plan that fits your needs. All plans include a 3-day free trial.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl ${
                  plan.popular
                    ? 'bg-gradient-to-b from-blue-500/20 to-purple-600/20 border-2 border-blue-500/50'
                    : 'bg-slate-800/50 border border-slate-700'
                } p-8 flex flex-col`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-1">{plan.name}</h3>
                  <p className="text-gray-400 text-sm">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <p className="text-sm text-emerald-400 mt-2">{plan.trial}</p>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      {typeof feature.value === 'boolean' ? (
                        feature.value ? (
                          <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        )
                      ) : (
                        <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      <span className={`text-sm ${typeof feature.value === 'boolean' && !feature.value ? 'text-gray-500' : 'text-gray-300'}`}>
                        {typeof feature.value === 'boolean' ? feature.label : `${feature.label}: ${feature.value}`}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={register}
                  className={`w-full py-3 px-4 font-medium rounded-xl transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-purple-500/25'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  Start Free Trial
                </button>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-24 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-12">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-2">
                  What counts as an "email per day"?
                </h3>
                <p className="text-gray-400">
                  This refers to the number of emails Hermes can process and analyze with AI features each day.
                  You can still receive unlimited emails, but AI summaries and categorization are limited to your plan's quota.
                </p>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-2">
                  What are AI generations?
                </h3>
                <p className="text-gray-400">
                  AI generations include composing emails with AI assistance, generating replies, and other AI-powered writing features.
                </p>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-2">
                  What is context storage?
                </h3>
                <p className="text-gray-400">
                  Context storage allows Hermes to remember information about your contacts, previous conversations, and preferences
                  to provide more personalized and accurate AI assistance.
                </p>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-2">
                  Can I change plans later?
                </h3>
                <p className="text-gray-400">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <img src="/logo.png" alt="Hermes" className="h-5 w-5 opacity-50" />
                <span>Hermes Mail</span>
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

export default Pricing;
