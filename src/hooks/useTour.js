import { useState, useCallback } from 'react';

const TOUR_STORAGE_KEY = 'hermes_tour_complete';

export function useTour() {
  const [isRunning, setIsRunning] = useState(false);

  const hasCompletedTour = useCallback(() => {
    return localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
  }, []);

  const startTour = useCallback(() => {
    setIsRunning(true);
  }, []);

  const completeTour = useCallback(() => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setIsRunning(false);
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
  }, []);

  const stopTour = useCallback(() => {
    setIsRunning(false);
  }, []);

  return {
    isRunning,
    startTour,
    stopTour,
    completeTour,
    hasCompletedTour,
    resetTour,
  };
}
