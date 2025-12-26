function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Icon */}
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-700 flex items-center justify-center mb-6">
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-white mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-gray-400 text-sm max-w-sm mb-6">
          {description}
        </p>
      )}

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
