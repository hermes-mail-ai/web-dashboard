import { useState, useCallback } from 'react';

/**
 * Hook for managing toast notifications
 * @param {number} defaultDuration - Default duration in ms (default: 3000)
 * @returns {Object} - { toast, showToast, hideToast }
 */
export function useToast(defaultDuration = 3000) {
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info', // 'info' | 'success' | 'error'
  });

  const showToast = useCallback((message, type = 'info', duration = defaultDuration) => {
    setToast({ show: true, message, type });

    if (duration > 0) {
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'info' });
      }, duration);
    }
  }, [defaultDuration]);

  const hideToast = useCallback(() => {
    setToast({ show: false, message: '', type: 'info' });
  }, []);

  const showSuccess = useCallback((message, duration) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message, duration = 5000) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showInfo = useCallback((message, duration) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  return {
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showInfo,
  };
}
