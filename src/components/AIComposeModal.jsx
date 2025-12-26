import { useState } from 'react';
import api from '../services/api';
import BulletEditor from './BulletEditor';

function AIComposeModal({ isOpen, onClose, toEmail, threadId, onGenerated }) {
  const [bulletContent, setBulletContent] = useState('');
  const [tone, setTone] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Extract bullet points from HTML content
  const extractBulletPoints = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const items = div.querySelectorAll('li');
    return Array.from(items)
      .map((li) => li.textContent.trim())
      .filter(Boolean);
  };

  const handleGenerate = async () => {
    const validPoints = extractBulletPoints(bulletContent);
    if (validPoints.length === 0) {
      setError('Please add at least one point');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const res = await api.post('/api/v1/compose/generate', {
        to_email: toEmail,
        bullet_points: validPoints,
        thread_id: threadId || null,
        tone: tone || null,
      });

      setResult(res.data);
    } catch (err) {
      console.error('Failed to generate email:', err);
      setError('Failed to generate email. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onGenerated(result.subject, result.body_html);
      handleClose();
    }
  };

  const handleClose = () => {
    setBulletContent('');
    setTone('');
    setResult(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19 13M17.8 6.2L19 5M3 21l9-9M12.2 6.2L11 5" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-100">AI Compose</h2>
              <p className="text-sm text-gray-400">To: {toEmail}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {!result ? (
            <>
              {/* Bullet Points Editor */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Key points to include
                </label>
                <BulletEditor
                  onChange={setBulletContent}
                  placeholder="e.g., Ask about the project deadline"
                />
              </div>

              {/* Tone */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tone (optional)
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Use default (from profile/contact)</option>
                  <option value="formal">Formal</option>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                </select>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {threadId && (
                <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg text-blue-400 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  Replying to thread - AI will use conversation context
                </div>
              )}
            </>
          ) : (
            /* Preview Result */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
                <p className="text-gray-200 bg-slate-700 px-3 py-2 rounded-lg">{result.subject}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Body</label>
                <div
                  className="text-gray-200 bg-slate-700 px-4 py-3 rounded-lg prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: result.body_html }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
          {result && (
            <button
              onClick={() => setResult(null)}
              className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              Back to edit
            </button>
          )}
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-300 hover:text-gray-100 text-sm transition-colors"
            >
              Cancel
            </button>
            {!result ? (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19 13M17.8 6.2L19 5M3 21l9-9M12.2 6.2L11 5" />
                    </svg>
                    Generate
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleApply}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Use This
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIComposeModal;
