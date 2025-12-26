import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/auth';

function Privacy() {
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
            <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
            <p className="text-gray-400">Last updated: December 25, 2025</p>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <p className="text-gray-400 leading-relaxed">
                At Hermes Mail, we take your privacy seriously. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our AI-powered email management service.
                Please read this policy carefully to understand our practices regarding your personal data.
              </p>
            </section>

            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>

              <h3 className="text-lg font-medium text-white mb-3 mt-6">Account Information</h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                When you create an account, we collect:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Email address</li>
                <li>Name and profile information from your connected email accounts</li>
                <li>Authentication tokens for connected email services</li>
                <li>Account preferences and settings</li>
              </ul>

              <h3 className="text-lg font-medium text-white mb-3 mt-6">Email Data</h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                To provide our services, we access and process:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Email content, including headers, body text, and attachments</li>
                <li>Email metadata (sender, recipients, timestamps, subject lines)</li>
                <li>Contact information from your address book</li>
                <li>Email organization (folders, labels, categories)</li>
              </ul>

              <h3 className="text-lg font-medium text-white mb-3 mt-6">Usage Information</h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                We automatically collect:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Device information (browser type, operating system)</li>
                <li>IP address and general location</li>
                <li>Feature usage and interaction data</li>
                <li>Error logs and performance data</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Provide AI-powered email summaries and categorization</li>
                <li>Generate email composition suggestions and replies</li>
                <li>Build and maintain your contact context for personalized assistance</li>
                <li>Sync and display your emails across devices</li>
                <li>Improve our AI models and service quality</li>
                <li>Send you service updates and notifications</li>
                <li>Detect and prevent fraud and abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Email Data Handling</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                We understand that email contains sensitive information. Here's how we handle it:
              </p>

              <h3 className="text-lg font-medium text-white mb-3 mt-6">AI Processing</h3>
              <p className="text-gray-400 leading-relaxed">
                Your emails are processed by our AI systems to generate summaries, categorize messages, and provide
                composition assistance. This processing is automated and designed to enhance your productivity.
              </p>

              <h3 className="text-lg font-medium text-white mb-3 mt-6">Data Minimization</h3>
              <p className="text-gray-400 leading-relaxed">
                We only access and store the email data necessary to provide our services. We do not sell your
                email content or use it for advertising purposes.
              </p>

              <h3 className="text-lg font-medium text-white mb-3 mt-6">Context Storage</h3>
              <p className="text-gray-400 leading-relaxed">
                Your subscription plan includes context storage, which allows our AI to remember important details
                about your contacts and conversations for more personalized assistance. You can delete this context
                at any time through your settings.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Data Storage & Security</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>All data is encrypted in transit using TLS/SSL</li>
                <li>Data at rest is encrypted using AES-256 encryption</li>
                <li>Access to data is restricted to authorized personnel only</li>
                <li>We use OAuth for email account connections (we never see your email password)</li>
                <li>Regular security audits and penetration testing</li>
                <li>Data is stored in secure, SOC 2 compliant data centers</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Third-Party Services</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                We use the following third-party services to operate Hermes Mail:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li><strong className="text-white">Email Providers:</strong> Google Gmail API for email synchronization</li>
                <li><strong className="text-white">Payment Processing:</strong> Stripe for subscription payments</li>
                <li><strong className="text-white">AI Services:</strong> AI model providers for email processing</li>
                <li><strong className="text-white">Analytics:</strong> Anonymous usage analytics to improve our service</li>
                <li><strong className="text-white">Cloud Infrastructure:</strong> Secure cloud hosting providers</li>
              </ul>
              <p className="text-gray-400 leading-relaxed mt-4">
                These providers have their own privacy policies governing the use of your information.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Cookies & Tracking</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Keep you logged in to your account</li>
                <li>Remember your preferences and settings</li>
                <li>Understand how you use our service</li>
                <li>Improve performance and user experience</li>
              </ul>
              <p className="text-gray-400 leading-relaxed mt-4">
                You can control cookies through your browser settings, but disabling them may affect your
                ability to use certain features of the Service.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Your Rights</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                Depending on your location, you may have the following rights regarding your personal data:
              </p>

              <h3 className="text-lg font-medium text-white mb-3 mt-6">For All Users</h3>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li><strong className="text-white">Access:</strong> Request a copy of your personal data</li>
                <li><strong className="text-white">Deletion:</strong> Request deletion of your account and data</li>
                <li><strong className="text-white">Correction:</strong> Update or correct your information</li>
                <li><strong className="text-white">Portability:</strong> Export your data in a portable format</li>
                <li><strong className="text-white">Disconnection:</strong> Revoke access to connected email accounts</li>
              </ul>

              <h3 className="text-lg font-medium text-white mb-3 mt-6">For EU/EEA Users (GDPR)</h3>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Right to restrict processing</li>
                <li>Right to object to processing</li>
                <li>Right to withdraw consent</li>
                <li>Right to lodge a complaint with a supervisory authority</li>
              </ul>

              <h3 className="text-lg font-medium text-white mb-3 mt-6">For California Residents (CCPA)</h3>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Right to know what personal information is collected</li>
                <li>Right to know whether personal information is sold or disclosed</li>
                <li>Right to opt-out of the sale of personal information</li>
                <li>Right to non-discrimination for exercising your rights</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Data Retention</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                We retain your data as follows:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li><strong className="text-white">Account Data:</strong> Retained while your account is active</li>
                <li><strong className="text-white">Email Cache:</strong> Synced emails are cached temporarily for performance</li>
                <li><strong className="text-white">Context Storage:</strong> Retained according to your subscription plan limits</li>
                <li><strong className="text-white">After Deletion:</strong> Data is permanently deleted within 30 days of account deletion</li>
                <li><strong className="text-white">Backups:</strong> May be retained for up to 90 days for disaster recovery</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Children's Privacy</h2>
              <p className="text-gray-400 leading-relaxed">
                Hermes Mail is not intended for children under 13 years of age. We do not knowingly collect
                personal information from children under 13. If you are a parent or guardian and believe your
                child has provided us with personal information, please contact us immediately and we will
                delete such information from our systems.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. International Data Transfers</h2>
              <p className="text-gray-400 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of
                residence. We ensure appropriate safeguards are in place for international transfers, including
                Standard Contractual Clauses where required. By using the Service, you consent to the transfer
                of your information to countries that may have different data protection laws than your country.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to This Policy</h2>
              <p className="text-gray-400 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes
                by posting the new Privacy Policy on this page and updating the "Last updated" date. For significant
                changes, we will also send you an email notification. We encourage you to review this Privacy Policy
                periodically.
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Us</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <p className="text-gray-400">
                <strong className="text-white">Email:</strong> privacy@hermes-mail.com<br />
                <strong className="text-white">Data Protection Officer:</strong> dpo@hermes-mail.com<br />
                <strong className="text-white">Address:</strong> Hermes Mail, Inc.
              </p>
              <p className="text-gray-400 mt-4">
                For GDPR-related inquiries, our EU representative can be contacted at eu-representative@hermes-mail.com.
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

export default Privacy;
