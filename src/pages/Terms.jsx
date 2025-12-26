import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/auth';

function Terms() {
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

      {/* Main Content */}
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
            <p className="text-gray-400">Last updated: December 25, 2025</p>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-400 leading-relaxed">
                By accessing or using Hermes Mail ("Service"), you agree to be bound by these Terms of Service ("Terms").
                If you do not agree to these Terms, you may not access or use the Service. We reserve the right to update
                these Terms at any time, and your continued use of the Service constitutes acceptance of any changes.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p className="text-gray-400 leading-relaxed">
                Hermes Mail is an AI-powered email management platform that helps users organize, summarize, and respond
                to emails more efficiently. The Service includes features such as AI-generated email summaries, smart
                categorization, email composition assistance, and contact management. The Service requires connection
                to your existing email accounts (such as Gmail) via OAuth authentication.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts & Registration</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                To use the Service, you must create an account and connect at least one email account. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access to your account</li>
                <li>Be responsible for all activities that occur under your account</li>
                <li>Not share your account with others or allow others to access your account</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Acceptable Use Policy</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Send spam, unsolicited messages, or engage in email abuse</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on the intellectual property rights of others</li>
                <li>Transmit malware, viruses, or other harmful code</li>
                <li>Harass, threaten, or harm other users</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Use the Service for any fraudulent or deceptive purposes</li>
                <li>Circumvent any usage limits or restrictions</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Subscription & Payment</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                Hermes Mail offers subscription-based plans with varying features and usage limits. By subscribing to a paid plan:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>You authorize us to charge your payment method on a recurring basis</li>
                <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>We reserve the right to change pricing with 30 days notice</li>
                <li>Free trials automatically convert to paid subscriptions unless cancelled</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>
              <p className="text-gray-400 leading-relaxed">
                The Service and its original content, features, and functionality are owned by Hermes Mail and are
                protected by international copyright, trademark, and other intellectual property laws. You retain
                ownership of your email content. By using the Service, you grant us a limited license to process
                your emails for the purpose of providing the Service features.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Privacy</h2>
              <p className="text-gray-400 leading-relaxed">
                Your privacy is important to us. Our collection and use of personal information is governed by our{' '}
                <button
                  onClick={() => navigate('/privacy')}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Privacy Policy
                </button>
                , which is incorporated into these Terms by reference. By using the Service, you consent to the
                collection and use of information as described in the Privacy Policy.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Disclaimers & Limitations</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES,
                EXPRESS OR IMPLIED, INCLUDING:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Warranties of merchantability and fitness for a particular purpose</li>
                <li>Warranties that the Service will be uninterrupted or error-free</li>
                <li>Warranties regarding the accuracy of AI-generated content</li>
                <li>Warranties that the Service will meet your specific requirements</li>
              </ul>
              <p className="text-gray-400 leading-relaxed mt-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Termination</h2>
              <p className="text-gray-400 leading-relaxed">
                We may terminate or suspend your account and access to the Service immediately, without prior notice
                or liability, for any reason, including breach of these Terms. Upon termination, your right to use
                the Service will immediately cease. You may also terminate your account at any time through your
                account settings. Upon termination, we will delete your data in accordance with our Privacy Policy.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Changes to Terms</h2>
              <p className="text-gray-400 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify you of any material changes
                by posting the new Terms on this page and updating the "Last updated" date. Your continued use of
                the Service after any changes constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Governing Law</h2>
              <p className="text-gray-400 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the State of California,
                United States, without regard to its conflict of law provisions. Any disputes arising from these Terms
                or the Service shall be resolved in the courts of California.
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Information</h2>
              <p className="text-gray-400 leading-relaxed">
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="text-gray-400 mt-4">
                <strong className="text-white">Email:</strong> legal@hermes-mail.com<br />
                <strong className="text-white">Address:</strong> Hermes Mail, Inc.
              </p>
            </section>
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

export default Terms;
