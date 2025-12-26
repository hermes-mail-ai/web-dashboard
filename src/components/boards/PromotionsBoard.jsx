import { formatEmailDate, getInitials } from '../../utils/formatters';

/**
 * Promotions board component - displays promotional emails in a card grid
 */
function PromotionsBoard({
  promotions = [],
  onSelectEmail,
}) {
  return (
    <div className="flex-1 overflow-y-auto p-6" data-tour="promotions-board">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 mb-4">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-1">This Week's Deals</h2>
          <p className="text-gray-500 text-sm">Promotions from the last 7 days</p>
        </div>

        {/* Promotions Grid */}
        {promotions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No promotions this week</p>
          </div>
        ) : (
          <div className="space-y-3">
            {promotions.map((promo) => (
              <PromotionCard
                key={promo.id}
                promo={promo}
                onClick={() => onSelectEmail?.(promo)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Individual promotion card component
 */
function PromotionCard({ promo, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group relative p-4 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-800/40 border border-slate-700/50 hover:border-purple-500/30 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5"
    >
      {/* Decorative gradient line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-gradient-to-b from-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start gap-4">
        {/* Brand Avatar */}
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-white">
            {getInitials(promo.from_name || promo.from_email)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Brand Name & Date */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-medium text-white truncate">
              {promo.from_name || promo.from_email}
            </p>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {formatEmailDate(promo.date)}
            </span>
          </div>

          {/* Subject */}
          <p className="text-sm text-gray-300 truncate mb-2">
            {promo.subject}
          </p>

          {/* Summary */}
          {promo.analysis?.summary && (
            <p className="text-xs text-gray-400 line-clamp-2">
              {Array.isArray(promo.analysis.summary)
                ? promo.analysis.summary.join(' • ')
                : promo.analysis.summary}
            </p>
          )}
        </div>

        {/* Arrow */}
        <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
  );
}

export default PromotionsBoard;
export { PromotionCard };
