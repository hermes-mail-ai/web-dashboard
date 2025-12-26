import { getInitials } from '../../utils/formatters';

/**
 * User profile section in settings
 */
function ProfileSection({ user, timezone, onTimezoneChange }) {
  const initials = getInitials(user?.name);

  return (
    <section className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700">
        <h2 className="text-lg font-medium text-gray-100">Profile</h2>
        <p className="text-sm text-gray-400 mt-1">Your account information</p>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-xl">
            {initials}
          </div>
          <div>
            <p className="text-lg font-medium text-gray-100">{user?.name || 'User'}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>

        {/* Timezone Setting */}
        <div className="pt-4 border-t border-slate-700">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => onTimezoneChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="America/Toronto">Toronto (ET)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Paris (CET)</option>
            <option value="Europe/Berlin">Berlin (CET)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
            <option value="Asia/Shanghai">Shanghai (CST)</option>
            <option value="Asia/Dubai">Dubai (GST)</option>
            <option value="Australia/Sydney">Sydney (AEST)</option>
            <option value="Pacific/Auckland">Auckland (NZST)</option>
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Current time: {new Date().toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </section>
  );
}

export default ProfileSection;
