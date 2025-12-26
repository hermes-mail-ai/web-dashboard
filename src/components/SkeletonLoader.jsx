function SkeletonLoader({ type = 'email', count = 5 }) {
  if (type === 'email') {
    return (
      <div className="divide-y divide-slate-700/50 animate-pulse">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex items-start gap-3 px-4 py-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="h-4 bg-slate-700 rounded w-32" />
                <div className="h-3 bg-slate-700 rounded w-12" />
              </div>
              <div className="h-4 bg-slate-700 rounded w-48 mb-2" />
              <div className="h-3 bg-slate-700 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="animate-pulse">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4">
            <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
            <div className="h-3 bg-slate-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="h-4 bg-slate-700 rounded" style={{ width: `${Math.random() * 40 + 60}%` }} />
        ))}
      </div>
    );
  }

  return null;
}

export default SkeletonLoader;
