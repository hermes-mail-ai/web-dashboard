import ContactAutocomplete from '../ContactAutocomplete';

/**
 * Compose email recipients (To/Cc/Bcc) fields
 */
function ComposeRecipients({
  composeTo,
  setComposeTo,
  composeCc,
  setComposeCc,
  composeBcc,
  setComposeBcc,
  showCc,
  setShowCc,
  showBcc,
  setShowBcc,
  showCcBccMenu,
  setShowCcBccMenu,
  accountId,
}) {
  return (
    <>
      {/* To Field */}
      <div className="flex-shrink-0 px-6 py-3 border-b border-slate-700/50">
        <div className="flex items-start gap-2">
          <label className="w-16 text-sm text-gray-500 pt-2">To</label>
          <div className="flex-1">
            <ContactAutocomplete
              value={composeTo}
              onChange={setComposeTo}
              accountId={accountId}
              placeholder="recipient@example.com"
            />
          </div>
          {/* Add Cc/Bcc dropdown */}
          {(!showCc || !showBcc) && (
            <div className="relative pt-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCcBccMenu(!showCcBccMenu);
                }}
                className="p-1.5 hover:bg-slate-700 rounded transition-colors text-gray-500 hover:text-gray-300"
                title="Add Cc/Bcc"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              {showCcBccMenu && (
                <div
                  className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 py-1 min-w-[100px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {!showCc && (
                    <button
                      onClick={() => {
                        setShowCc(true);
                        setShowCcBccMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-slate-700 transition-colors"
                    >
                      Add Cc
                    </button>
                  )}
                  {!showBcc && (
                    <button
                      onClick={() => {
                        setShowBcc(true);
                        setShowCcBccMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-slate-700 transition-colors"
                    >
                      Add Bcc
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cc Field */}
      {showCc && (
        <div className="flex-shrink-0 px-6 py-3 border-b border-slate-700/50">
          <div className="flex items-start gap-2">
            <label className="w-16 text-sm text-gray-500 pt-2">Cc</label>
            <div className="flex-1">
              <ContactAutocomplete
                value={composeCc}
                onChange={setComposeCc}
                accountId={accountId}
                placeholder="cc@example.com"
              />
            </div>
            <button
              onClick={() => {
                setShowCc(false);
                setComposeCc([]);
              }}
              className="p-1.5 hover:bg-slate-700 rounded transition-colors text-gray-500 hover:text-gray-300 mt-1.5"
              title="Remove Cc"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Bcc Field */}
      {showBcc && (
        <div className="flex-shrink-0 px-6 py-3 border-b border-slate-700/50">
          <div className="flex items-start gap-2">
            <label className="w-16 text-sm text-gray-500 pt-2">Bcc</label>
            <div className="flex-1">
              <ContactAutocomplete
                value={composeBcc}
                onChange={setComposeBcc}
                accountId={accountId}
                placeholder="bcc@example.com"
              />
            </div>
            <button
              onClick={() => {
                setShowBcc(false);
                setComposeBcc([]);
              }}
              className="p-1.5 hover:bg-slate-700 rounded transition-colors text-gray-500 hover:text-gray-300 mt-1.5"
              title="Remove Bcc"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ComposeRecipients;
