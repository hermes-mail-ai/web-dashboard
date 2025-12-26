/**
 * Subscription and usage section in settings
 */
function SubscriptionSection({
  subscription,
  usage,
  checkoutSuccess,
  portalLoading,
  onOpenPortal,
  onUpgrade,
}) {
  const formatPlanName = (plan) => {
    if (!plan) return 'Free';
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  const formatStatus = (status) => {
    if (!status) return '';
    const labels = {
      trialing: 'Trial',
      active: 'Active',
      canceled: 'Canceled',
      past_due: 'Past Due',
      expired: 'Expired',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      trialing: 'text-blue-400 bg-blue-400/10',
      active: 'text-emerald-400 bg-emerald-400/10',
      canceled: 'text-gray-400 bg-gray-400/10',
      past_due: 'text-red-400 bg-red-400/10',
      expired: 'text-red-400 bg-red-400/10',
    };
    return colors[status] || 'text-gray-400 bg-gray-400/10';
  };

  return (
    <section className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700">
        <h2 className="text-lg font-medium text-gray-100">Subscription</h2>
        <p className="text-sm text-gray-400 mt-1">Your plan and usage</p>
      </div>
      <div className="p-6 space-y-6">
        {/* Success Message */}
        {checkoutSuccess && (
          <div className="p-3 bg-emerald-900/30 border border-emerald-700/50 rounded-lg text-emerald-400 text-sm">
            Subscription activated successfully! Welcome to Hermes.
          </div>
        )}

        {/* Current Plan */}
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Current Plan</h3>
          <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-100">
                  {formatPlanName(subscription?.plan)}
                </p>
                {subscription?.status && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(subscription.status)}`}>
                    {formatStatus(subscription.status)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {subscription?.stripe_customer_id ? (
                <button
                  onClick={onOpenPortal}
                  disabled={portalLoading}
                  className="px-3 py-1.5 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50"
                >
                  {portalLoading ? 'Loading...' : 'Manage'}
                </button>
              ) : (
                <button
                  onClick={onUpgrade}
                  className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>

          {/* Trial End Date */}
          {subscription?.status === 'trialing' && subscription?.trial_end && (
            <p className="text-xs text-gray-400 mt-2">
              Trial ends: {new Date(subscription.trial_end).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Usage */}
        {usage && (
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Today's Usage</h3>
            <div className="space-y-4">
              <UsageBar
                label="Emails processed"
                current={usage.emails_processed}
                limit={usage.emails_limit}
                color="bg-blue-500"
              />
              <UsageBar
                label="AI generations"
                current={usage.ai_generations}
                limit={usage.ai_generations_limit}
                color="bg-purple-500"
              />
              <UsageBar
                label="Context storage"
                current={usage.context_storage_mb.toFixed(1)}
                limit={usage.context_storage_limit_mb}
                unit="MB"
                color="bg-emerald-500"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Usage progress bar component
 */
function UsageBar({ label, current, limit, unit = '', color }) {
  const percentage = Math.min(100, (parseFloat(current) / limit) * 100);
  const displayCurrent = unit ? `${current} ${unit}` : current;
  const displayLimit = unit ? `${limit} ${unit}` : limit;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300">{displayCurrent} / {displayLimit}</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default SubscriptionSection;
export { UsageBar };
