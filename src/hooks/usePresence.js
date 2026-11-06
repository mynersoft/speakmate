/**
 * Hook for managing presence and community statistics
 */
import { useState, useEffect, useCallback } from 'react';
import { presenceService } from '../services/presenceService';
import { useAuth } from '../context/AuthContext';

export function usePresence() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ onlineCount: 0, availableCount: 0, inCallCount: 0 });
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshStats = useCallback(async () => {
    try {
      const data = await presenceService.getOnlineStats();
      setStats(data);
    } catch (err) {
      console.warn('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStats();

    // Poll stats every 20 seconds
    const interval = setInterval(refreshStats, 20000);

    // Subscribe to presence table changes
    const unsubscribe = presenceService.subscribePresence(() => {
      refreshStats();
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [refreshStats]);

  const toggleAvailability = useCallback(async (newAvailable) => {
    if (!user) return;
    const nextVal = newAvailable !== undefined ? newAvailable : !isAvailable;
    setIsAvailable(nextVal);
    await presenceService.setAvailability(user.id, nextVal);
    refreshStats();
  }, [user, isAvailable, refreshStats]);

  return {
    stats,
    isAvailable,
    toggleAvailability,
    refreshStats,
    loading,
  };
}

export default usePresence;
