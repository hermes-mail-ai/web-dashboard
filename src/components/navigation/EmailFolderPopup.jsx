import { forwardRef } from 'react';
import { getIcon } from './SidebarIcons';

/**
 * Email folder popup menu component
 */
const EmailFolderPopup = forwardRef(function EmailFolderPopup({
  emailOptions,
  isActive,
  onNavigate,
  onClose,
  position,
}, ref) {
  const handleItemClick = (path) => {
    onNavigate(path);
    onClose();
  };

  // Calculate arrow position relative to popup
  const arrowTop = position.arrowOffset ? position.arrowOffset - position.top : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={onClose}
      />
      {/* Popup Menu */}
      <div
        ref={ref}
        className="fixed w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-visible z-[9999]"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        {/* Speech bubble arrow pointing left */}
        <div
          className="absolute w-0 h-0 -left-2"
          style={{
            top: `${arrowTop}px`,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: '8px solid rgb(51 65 85)', // slate-700 border color
          }}
        >
          <div
            className="absolute w-0 h-0"
            style={{
              top: '-7px',
              left: '1px',
              borderTop: '7px solid transparent',
              borderBottom: '7px solid transparent',
              borderRight: '7px solid rgb(30 41 59)', // slate-800 background color
            }}
          />
        </div>
        <div className="py-1">
          {emailOptions.map((item) => (
            <button
              key={item.path}
              onClick={() => handleItemClick(item.path)}
              className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-200 hover:bg-slate-700'
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                {getIcon(item.icon, 'w-4 h-4')}
              </div>
              <span className="flex-1">{item.name}</span>
              {item.count > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-slate-600 text-gray-300 rounded">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
});

export default EmailFolderPopup;
