'use client';

/**
 * useOnline Hook
 * 
 * Custom React hook for detecting online/offline status using browser events.
 * 
 * Features:
 * - Detects online/offline status using window.navigator.onLine
 * - Listens to 'online' and 'offline' events
 * - Updates Zustand store with current online status
 * - Handles SSR safely (checks for typeof window)
 * - Cleans up event listeners on unmount
 * 
 * Validates: Requirement 38 (Offline Support)
 */

import { useEffect, useState } from 'react';
import { useResumeStore } from '@/store/resume-store';

/**
 * useOnline Hook
 * 
 * Returns the current online/offline status and updates the store.
 * 
 * @returns {boolean} true if online, false if offline
 * 
 * Usage:
 * const isOnline = useOnline();
 * 
 * if (!isOnline) {
 *   // Show offline indicator
 *   // Disable AI features
 * }
 */
export function useOnline(): boolean {
  // Initialize state with current navigator.onLine status
  // Default to true for SSR safety
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Get the store's setOnlineStatus action
  const setOnlineStatus = useResumeStore((state) => state.setOnlineStatus);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    /**
     * Handle online event
     * Called when the browser goes from offline to online
     */
    const handleOnline = () => {
      setIsOnline(true);
      setOnlineStatus(true);
    };

    /**
     * Handle offline event
     * Called when the browser goes from online to offline
     */
    const handleOffline = () => {
      setIsOnline(false);
      setOnlineStatus(false);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup: Remove event listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);

  return isOnline;
}

export default useOnline;
