import { useState, useEffect } from 'react';
import api from '../services/api';

function EmailImportModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState('choice'); // 'choice', 'importing', 'complete'
  const [progress, setProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(50);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setStep('choice');
      setProgress(0);
      setImportedCount(0);
      setError(null);
    }
  }, [isOpen]);

  const handleImport = async () => {
    setStep('importing');
    setStatusText('Syncing emails from Gmail...');
    setError(null);

    try {
      // Start the sync - this syncs emails from Gmail
      const syncResponse = await api.post('/api/v1/emails/sync', null, {
        params: { max_results: 50 }
      });

      const syncedCount = syncResponse.data.synced || 0;
      setImportedCount(syncedCount);
      setTotalCount(syncedCount);
      setProgress(100);
      setStatusText('Emails synced! AI processing will continue in background...');

      // Wait a moment then complete
      setTimeout(() => {
        setStep('complete');
      }, 1500);

    } catch (err) {
      console.error('Import failed:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to import emails');
      setStep('choice');
    }
  };

  const handleStartFresh = () => {
    localStorage.setItem('hermes_onboarding_complete', 'true');
    onComplete();
    onClose();
  };

  const handleComplete = () => {
    localStorage.setItem('hermes_onboarding_complete', 'true');
    onComplete();
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
                Load Past 50 Emails
              </button>

              <button
                onClick={handleStartFresh}
                className="w-full py-3 px-4 text-gray-400 hover:text-white hover:bg-slate-700 font-medium rounded-xl transition-colors"
              >
                Start Fresh
              </button>
            </div>
          </div>
        )}

        {/* Importing Screen */}
        {step === 'importing' && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">Importing Your Emails</h2>
              <p className="text-gray-400">{statusText}</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>{importedCount} of {totalCount} emails</span>
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
              Please wait while we import your emails...
            </p>
          </div>
        )}

        {/* Complete Screen */}
        {step === 'complete' && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">Import Complete!</h2>
              <p className="text-gray-400">
                {importedCount} emails imported successfully. AI analysis will process in the background.
              </p>
            </div>

            <button
              onClick={handleComplete}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmailImportModal;
