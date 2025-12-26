import { forwardRef } from 'react';
import { InboxIcon, CalendarIcon, PeopleIcon } from './SidebarIcons';
import { getInitials } from '../../utils/formatters';

/**
 * Sidebar navigation buttons component
 */
function SidebarNav({
  isEmailActive,
  isPeopleActive,
  onEmailClick,
  onPeopleClick,
  emailButtonRef,
}) {
  return (
    <div className="p-2 space-y-2">
      {/* Email Icon Button */}
      <button
        ref={emailButtonRef}
        onClick={onEmailClick}
        className={`relative w-full aspect-square flex items-center justify-center rounded-lg transition-colors ${
          isEmailActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:bg-slate-800'
        }`}
        title="Email"
      >
        <div className="w-5 h-5 flex items-center justify-center">
          <InboxIcon />
        </div>
      </button>

      {/* Calendar Icon Button (Disabled) */}
      <button
        disabled
        className="w-full aspect-square flex items-center justify-center rounded-lg text-gray-500 cursor-not-allowed opacity-50"
        title="Coming Soon"
      >
        <CalendarIcon />
      </button>

      {/* People Icon Button */}
      <button
        onClick={onPeopleClick}
        className={`w-full aspect-square flex items-center justify-center rounded-lg transition-colors ${
          isPeopleActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:bg-slate-800'
        }`}
        title="People"
      >
        <PeopleIcon />
      </button>
    </div>
  );
}

/**
 * User profile button at bottom of sidebar
 */
const UserProfileButton = forwardRef(function UserProfileButton({
  user,
  onClick,
}, ref) {
  const initials = getInitials(user?.name);

  return (
    <div className="px-2 border-t border-slate-700 h-[52px] flex items-center justify-center">
      <button
        ref={ref}
        onClick={onClick}
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm hover:opacity-90 transition-opacity"
        title="Account"
        data-tour="ai-profile"
      >
        {initials}
      </button>
    </div>
  );
});

export default SidebarNav;
export { UserProfileButton };
