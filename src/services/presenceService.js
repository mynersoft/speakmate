/**
 * Realtime Presence and Active Members Service
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';

let heartbeatTimer = null;
let presenceChannel = null;

// Community active members fallback for empty rooms or demo exploration
export const SAMPLE_MEMBERS = [
  {
    id: 'sample-member-1',
    user_id: 'sample-member-1',
    display_name: 'Elena Rostova',
    country: 'Spain',
    english_level: 'Intermediate',
    bio: 'Practicing English for tech interviews. Love talking about travel, coding, and culinary arts.',
    is_online: true,
    is_available: true,
    current_call_id: null,
    last_seen: new Date().toISOString(),
  },
  {
    id: 'sample-member-2',
    user_id: 'sample-member-2',
    display_name: 'Kenji Sato',
    country: 'Japan',
    english_level: 'Advanced',
    bio: 'Software engineer from Tokyo. Looking for casual conversations on culture and productivity.',
    is_online: true,
    is_available: true,
    current_call_id: null,
    last_seen: new Date(Date.now() - 15000).toISOString(),
  },
  {
    id: 'sample-member-3',
    user_id: 'sample-member-3',
    display_name: 'Mateo Morales',
    country: 'Colombia',
    english_level: 'Intermediate',
    bio: 'Practicing conversational fluency every day. Let us discuss movies, soccer, and global traditions.',
    is_online: true,
    is_available: false,
    current_call_id: 'call-sample-3',
    last_seen: new Date(Date.now() - 30000).toISOString(),
  },
  {
    id: 'sample-member-4',
    user_id: 'sample-member-4',
    display_name: 'Amira Hassan',
    country: 'Egypt',
    english_level: 'Fluent',
    bio: 'Language enthusiast and teacher. Happy to help intermediate speakers gain confidence!',
    is_online: true,
    is_available: true,
    current_call_id: null,
    last_seen: new Date(Date.now() - 45000).toISOString(),
  },
];

export const presenceService = {
  /**
   * Start recurring heartbeat to keep presence fresh in PostgreSQL and Realtime
   */
  startHeartbeat(userId, getIsAvailable) {
    if (!userId) return;

    this.stopHeartbeat();

    const ping = async () => {
      try {
        const isAvailable = typeof getIsAvailable === 'function' ? getIsAvailable() : Boolean(getIsAvailable);
        
        if (isSupabaseConfigured && supabase) {
          const { error } = await supabase.rpc('send_presence_heartbeat', {
            p_user_id: userId,
            p_is_available: isAvailable,
          });

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
        }
      } catch (err) {
        console.warn('Presence heartbeat error:', err?.message);
      }
    };

    ping();
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
    if (!userId) return;

    if (isSupabaseConfigured && supabase) {
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
    }
  },

  /**
   * Get list of currently real active members and members with scheduled practice time
   */
  async getActiveMembers(currentUserId = null) {
    const activeMembers = [];
    const seenUserIds = new Set();

    if (isSupabaseConfigured && supabase) {
      try {
        // 1. Fetch real online members from user_presence (active in the last 15 minutes)
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
        const { data: presenceData, error: presErr } = await supabase
          .from('user_presence')
          .select(`
            user_id,
            is_online,
            is_available,
            current_call_id,
            last_seen,
            profiles:user_id (id, display_name, avatar_url, country, english_level, bio, practice_time)
          `)
          .eq('is_online', true)
          .gte('last_seen', fifteenMinutesAgo)
          .order('last_seen', { ascending: false });

        if (!presErr && Array.isArray(presenceData)) {
          presenceData.forEach((item) => {
            if (item.profiles && !seenUserIds.has(item.user_id)) {
              seenUserIds.add(item.user_id);
              const localTime = localStorage.getItem(`speakmate_practice_time_${item.user_id}`) || '';
              activeMembers.push({
                id: item.user_id,
                user_id: item.user_id,
                display_name: item.profiles.display_name || 'Community Member',
                avatar_url: item.profiles.avatar_url || '',
                country: item.profiles.country || 'Global',
                english_level: item.profiles.english_level || 'Intermediate',
                bio: item.profiles.bio || '',
                practice_time: item.profiles.practice_time || localTime,
                is_online: item.is_online,
                is_available: item.is_available && !item.current_call_id,
                current_call_id: item.current_call_id,
                last_seen: item.last_seen,
                isCurrentUser: currentUserId && item.user_id === currentUserId,
              });
            }
          });
        }

        // 2. Also fetch real community members from profiles who have registered or scheduled practice time
        const { data: profilesData, error: profErr } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, country, english_level, bio, practice_time, updated_at')
          .order('updated_at', { ascending: false })
          .limit(30);

        if (!profErr && Array.isArray(profilesData)) {
          profilesData.forEach((prof) => {
            if (!seenUserIds.has(prof.id)) {
              seenUserIds.add(prof.id);
              const localTime = localStorage.getItem(`speakmate_practice_time_${prof.id}`) || '';
              activeMembers.push({
                id: prof.id,
                user_id: prof.id,
                display_name: prof.display_name || 'Community Member',
                avatar_url: prof.avatar_url || '',
                country: prof.country || 'Global',
                english_level: prof.english_level || 'Intermediate',
                bio: prof.bio || '',
                practice_time: prof.practice_time || localTime,
                is_online: false,
                is_available: false,
                current_call_id: null,
                last_seen: prof.updated_at,
                isCurrentUser: currentUserId && prof.id === currentUserId,
              });
            }
          });
        }
      } catch (err) {
        console.warn('Error fetching real active members:', err);
      }
    }

    // Attach custom practice time for current user if set in localStorage
    if (currentUserId) {
      const mySavedTime = localStorage.getItem(`speakmate_practice_time_${currentUserId}`);
      const me = activeMembers.find((m) => m.user_id === currentUserId);
      if (me && mySavedTime && !me.practice_time) {
        me.practice_time = mySavedTime;
      }
    }

    // Show only real members - no fake samples
    return activeMembers;
  },

  /**
   * Get online stats for real active users
   */
  async getOnlineStats() {
    if (!isSupabaseConfigured || !supabase) {
      return { onlineCount: 1, availableCount: 1, inCallCount: 0 };
    }

    try {
      const sixtySecondsAgo = new Date(Date.now() - 60000).toISOString();
      const { data, error } = await supabase
        .from('user_presence')
        .select('is_online, is_available, current_call_id')
        .eq('is_online', true)
        .gte('last_seen', sixtySecondsAgo);

      if (error || !Array.isArray(data)) {
        return { onlineCount: 1, availableCount: 1, inCallCount: 0 };
      }

      const onlineCount = data.length || 1;
      const availableCount = data.filter((p) => p.is_available && !p.current_call_id).length || 1;
      const inCallCount = data.filter((p) => p.current_call_id).length;

      return { onlineCount, availableCount, inCallCount };
    } catch (_) {
      return { onlineCount: 1, availableCount: 1, inCallCount: 0 };
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
