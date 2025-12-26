/**
 * Email accounts management section in settings
 */
function EmailAccountsSection({
  accounts,
  providers,
  onConnect,
  onDisconnect,
}) {
  return (
    <section className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700">
        <h2 className="text-lg font-medium text-gray-100">Email Accounts</h2>
        <p className="text-sm text-gray-400 mt-1">Manage your connected email accounts</p>
      </div>

      <div className="p-6">
        {/* Connected Accounts */}
        {accounts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Connected Accounts</h3>
            <div className="space-y-3">
              {accounts.map((account) => (
                <ConnectedAccount
                  key={account.id}
                  account={account}
                  onDisconnect={() => onDisconnect(account.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Add Account - Beta limit: 1 account per user */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3">Add Account</h3>
          {accounts.length >= 1 ? (
            <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 text-center">
              <p className="text-gray-400 text-sm">
                Beta users can connect 1 email account.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Multiple accounts will be available in future updates.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {providers.map((provider) => (
                <ProviderButton
                  key={provider.name}
                  provider={provider}
                  onClick={() => onConnect(provider.name)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Connected account item
 */
function ConnectedAccount({ account, onDisconnect }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
          {account.provider === 'google' ? (
            <GoogleIcon />
          ) : (
            <EmailIcon />
          )}
        </div>
        <div>
          <p className="font-medium text-gray-100">{account.email}</p>
          <p className="text-sm text-gray-400 capitalize">{account.provider}</p>
        </div>
      </div>
      <button
        onClick={onDisconnect}
        className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
      >
        Disconnect
      </button>
    </div>
  );
}

/**
 * Provider connection button
 */
function ProviderButton({ provider, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 bg-slate-700 hover:bg-slate-600 rounded-lg border border-slate-600 hover:border-slate-500 transition-all text-left"
    >
      <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
        {provider.name === 'google' ? (
          <GoogleIcon />
        ) : (
          <EmailIcon />
        )}
      </div>
      <div>
        <p className="font-medium text-gray-100">Connect {provider.display_name}</p>
        <p className="text-sm text-gray-400">Add your {provider.display_name} account</p>
      </div>
      <svg
        className="w-5 h-5 text-gray-400 ml-auto"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}

/**
 * Google icon SVG
 */
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

/**
 * Email icon SVG
 */
function EmailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="w-5 h-5 text-gray-300"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <polyline points="3 7 12 13 21 7" />
    </svg>
  );
}

export default EmailAccountsSection;
export { ConnectedAccount, ProviderButton, GoogleIcon, EmailIcon };
