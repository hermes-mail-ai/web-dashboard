/**
 * Compose email subject field
 */
function ComposeSubject({ value, onChange }) {
  return (
    <div className="flex-shrink-0 flex items-center px-6 py-3 border-b border-slate-700/50">
      <label className="w-16 text-sm text-gray-500">Subject</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter subject"
        className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-500 text-sm"
      />
    </div>
  );
}

export default ComposeSubject;
