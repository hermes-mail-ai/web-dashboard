function LoadingSpinner({ size = 'md', text, className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-2',
  };

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-blue-500 border-t-transparent rounded-full animate-spin`}
      />
      {text && <span className="text-gray-300 text-sm">{text}</span>}
    </div>
  );
}

export default LoadingSpinner;
