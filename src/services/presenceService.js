/**
 * Realtime Presence and Heartbeat Service
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';

let heartbeatTimer = null;
let presenceChannel = null;

export const presenceService = {
  /**
   * Start recurring heartbeat to keep presence fresh in PostgreSQL and Realtime
   */
  startHeartbeat(userId, getIsAvailable) {
    if (!isSupabaseConfigured || !supabase || !userId) return;

    this.stopHeartbeat();

    const ping = async () => {
      try {
        const isAvailable = typeof getIsAvailable === 'function' ? getIsAvailable() : Boolean(getIsAvailable);
        
        // RPC heartbeat call
        const { error } = await supabase.rpc('send_presence_heartbeat', {
          p_user_id: userId,
          p_is_available: isAvailable,
        });

        // Fallback update if RPC not applied yet
        if (error) {
          await supabase
            .from('user_presence')
            .upsert({
              user_id: userId,
              is_online: true,
              is_available: isAvailable,
              last_seen: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
        }
      } catch (err) {
        console.warn('Presence heartbeat error:', err?.message);
      }
    };

    // Initial ping
    ping();

    // Recurring ping every 25 seconds (stale threshold is 60s)
    heartbeatTimer = setInterval(ping, 25000);
  },

  /**
   * Stop heartbeat and mark user as offline
   */
  async stopHeartbeat(userId = null) {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }

    if (userId && isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('user_presence')
          .update({
            is_online: false,
            is_available: false,
            current_call_id: null,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
      } catch (err) {
        console.warn('Error setting offline presence:', err);
      }
    }
  },

  /**
   * Set user availability specifically
   */
  async setAvailability(userId, isAvailable) {
    if (!isSupabaseConfigured || !supabase || !userId) return;

    try {
      await supabase
        .from('user_presence')
        .update({
          is_available: isAvailable,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } catch (err) {
      console.warn('Error updating availability:', err);
    }
  },

  /**
   * Get active approved member statistics (online count, practicing count)
   */
  async getOnlineStats() {
    if (!isSupabaseConfigured || !supabase) {
      return { onlineCount: 0, availableCount: 0, inCallCount: 0 };
    }

    try {
      const sixtySecondsAgo = new Date(Date.now() - 60000).toISOString();
      const { data, error } = await supabase
        .from('user_presence')
        .select('is_online, is_available, current_call_id')
        .eq('is_online', true)
        .gte('last_seen', sixtySecondsAgo);

      if (error) throw error;

      const onlineCount = data.length;
      const availableCount = data.filter((p) => p.is_available && !p.current_call_id).length;
      const inCallCount = data.filter((p) => p.current_call_id).length;

      return { onlineCount, availableCount, inCallCount };
    } catch (err) {
      console.warn('Error fetching online stats:', err.message);
      return { onlineCount: 0, availableCount: 0, inCallCount: 0 };
    }
  },

  /**
   * Subscribe to global community presence changes
   */
  subscribePresence(onPresenceChange) {
    if (!isSupabaseConfigured || !supabase) {
      return () => {};
    }

    if (presenceChannel) {
      supabase.removeChannel(presenceChannel);
    }

    presenceChannel = supabase
      .channel('public:user_presence')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_presence' },
        (payload) => {
          if (onPresenceChange) onPresenceChange(payload);
        }
      )
      .subscribe();

    return () => {
      if (presenceChannel) {
        supabase.removeChannel(presenceChannel);
        presenceChannel = null;
      }
    };
  },
};
