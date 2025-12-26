import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

function EmailImportModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState('choice'); // 'choice', 'syncing', 'processing', 'complete'
  const [progress, setProgress] = useState(0);
  const [syncedCount, setSyncedCount] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [primaryCount, setPrimaryCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [timeSavedMinutes, setTimeSavedMinutes] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState(null);
  const shouldContinueRef = useRef(true);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      shouldContinueRef.current = false;
      setStep('choice');
      setProgress(0);
      setSyncedCount(0);
      setProcessedCount(0);
      setPrimaryCount(0);
      setFilteredCount(0);
      setTimeSavedMinutes(0);
      setError(null);
    } else {
      shouldContinueRef.current = true;
    }
  }, [isOpen]);

  const processLoop = async () => {
    while (shouldContinueRef.current) {
      try {
        // Process emails in batches for progress updates
        const processRes = await api.post('/api/v1/emails/process', null, {
          params: { batch_size: 10 }
        });

        if (!shouldContinueRef.current) break;

        // Update status after each batch
        const statusRes = await api.get('/api/v1/emails/status');
        const { total_synced, total_processed, pending, progress_percent, primary_count, filtered_count, time_saved_minutes } = statusRes.data;

        setSyncedCount(total_synced);
        setProcessedCount(total_processed);
        setPrimaryCount(primary_count);
        setFilteredCount(filtered_count);
        setTimeSavedMinutes(time_saved_minutes);
        setProgress(progress_percent);

        // Check if done
        if (processRes.data.remaining === 0 || pending === 0) {
          setStep('complete');
          break;
        }
      } catch (err) {
        console.error('Failed to process:', err);
        break;
      }
    }
  };

  const handleImport = async () => {
    setStep('syncing');
    setStatusText('Syncing emails from Gmail...');
    setError(null);

    try {
      // Start the sync - this syncs emails from Gmail
      const syncResponse = await api.post('/api/v1/emails/sync', null, {
        params: { max_results: 100 }
      });

      const synced = syncResponse.data.synced || 0;
      setSyncedCount(synced);

      if (synced === 0) {
        setStatusText('No new emails to import.');
        setTimeout(() => setStep('complete'), 1500);
        return;
      }

      // Start processing loop
      setStep('processing');
      setStatusText('AI is analyzing your emails...');

      // Process all emails sequentially (no overlapping batches)
      processLoop();

    } catch (err) {
      console.error('Import failed:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to import emails');
      setStep('choice');
    }
  };


  const handleComplete = () => {
    localStorage.setItem('hermes_onboarding_complete', 'true');
    // Pass stats to parent for toast message
    const efficiencyPercent = syncedCount > 0 ? Math.round((filteredCount / syncedCount) * 100) : 0;
    onComplete({
      syncedCount,
      primaryCount,
      filteredCount,
      timeSavedMinutes,
      efficiencyPercent,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md mx-4 overflow-hidden">
        {/* Choice Screen */}
        {step === 'choice' && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">Welcome to Hermes Mail</h2>
              <p className="text-gray-400">
                Import your recent emails to get started with AI-powered email management.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleImport}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Load Past 100 Emails
              </button>

            </div>
          </div>
        )}

        {/* Syncing Screen */}
        {step === 'syncing' && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">Syncing Emails</h2>
              <p className="text-gray-400">{statusText}</p>
            </div>

            <p className="text-center text-gray-500 text-sm">
              Fetching your emails from Gmail...
            </p>
          </div>
        )}

        {/* Processing Screen */}
        {step === 'processing' && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">Analyzing Emails</h2>
              <p className="text-gray-400">{statusText}</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>{processedCount} of {syncedCount} emails</span>
                <span>{progress}%</span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <p className="text-center text-gray-500 text-sm">
              AI is categorizing and prioritizing your emails...
            </p>
          </div>
        )}

        {/* Complete Screen */}
        {step === 'complete' && (
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">All Set!</h2>
            </div>

            {/* Stats */}
            <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
              <p className="text-gray-300 text-center mb-3">
                Out of your <span className="text-white font-semibold">{syncedCount}</span> emails,
                only <span className="text-blue-400 font-semibold">{primaryCount}</span> need your attention.
              </p>
              {filteredCount > 0 && (
                <p className="text-gray-400 text-sm text-center">
                  We'll handle the other {filteredCount} for you.
                </p>
              )}
            </div>

            {/* Efficiency */}
            {syncedCount > 0 && primaryCount > 0 && (
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-4 mb-6 border border-blue-500/20">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  <p className="text-white">
                    Hermes makes you <span className="font-semibold text-blue-400">{Math.round(syncedCount / primaryCount)}x</span> more efficient
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleComplete}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              I'm Committed to Saving Time
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmailImportModal;
