/**
 * Automatic Partner Matching Service
 * Coordinates matching sessions, exclusion filtering, and atomic candidate retrieval.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const matchingService = {
  /**
   * Start a new matching session
   */
  async startMatchingSession(userId) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client is not configured.');
    }

    // Set user presence available
    await supabase
      .from('user_presence')
      .update({
        is_available: true,
        is_online: true,
        last_seen: new Date().toISOString(),
      })
      .eq('user_id', userId);

    const { data, error } = await supabase
      .from('matching_sessions')
      .insert({
        user_id: userId,
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  /**
   * Find one eligible online community member for this matching session
   */
  async findEligiblePartner(userId, sessionId, excludedPartnerIds = []) {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    // 1. Try atomic database RPC function first
    try {
      const { data, error } = await supabase.rpc('find_matching_partner', {
        p_user_id: userId,
        p_session_id: sessionId,
      });

      if (!error && data && data.length > 0) {
        return data[0];
      }
    } catch (rpcErr) {
      console.warn('RPC matching fallback:', rpcErr);
    }

    // 2. Direct Query Fallback with full exclusion rules
    try {
      // Get previously attempted partner IDs for this session
      const { data: attempts } = await supabase
        .from('matching_attempts')
        .select('partner_id')
        .eq('matching_session_id', sessionId);

      const attemptedIds = new Set([
        ...(attempts || []).map((a) => a.partner_id),
        ...excludedPartnerIds,
        userId,
      ]);

      // Get blocked users
      const { data: blocks } = await supabase
        .from('user_blocks')
        .select('blocker_id, blocked_id')
        .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

      (blocks || []).forEach((b) => {
        attemptedIds.add(b.blocker_id);
        attemptedIds.add(b.blocked_id);
      });

      // Find available, online, approved members active in the last 60 seconds
      const sixtySecondsAgo = new Date(Date.now() - 60000).toISOString();
      const { data: candidates, error: candErr } = await supabase
        .from('user_presence')
        .select(`
          user_id,
          last_seen,
          profiles:user_id (id, display_name, avatar_url, country, english_level),
          community_members:user_id (approved)
        `)
        .eq('is_online', true)
        .eq('is_available', true)
        .is('current_call_id', null)
        .gte('last_seen', sixtySecondsAgo)
        .neq('user_id', userId)
        .order('last_seen', { ascending: false })
        .limit(20);

      if (candErr || !candidates) return null;

      // Filter in memory for attempt exclusions
      const eligible = candidates.find((item) => {
        const pId = item.user_id;
        return !attemptedIds.has(pId);
      });

      if (eligible && eligible.profiles) {
        return {
          partner_id: eligible.user_id,
          display_name: eligible.profiles.display_name,
          avatar_url: eligible.profiles.avatar_url,
          country: eligible.profiles.country,
          english_level: eligible.profiles.english_level,
        };
      }

      return null;
    } catch (err) {
      console.warn('Find eligible partner query error:', err);
      return null;
    }
  },

  /**
   * End a matching session
   */
  async endMatchingSession(sessionId, userId) {
    if (!isSupabaseConfigured || !supabase || !sessionId) return;

    try {
      await supabase
        .from('matching_sessions')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (userId) {
        await supabase
          .from('user_presence')
          .update({ is_available: false })
          .eq('user_id', userId);
      }
    } catch (err) {
      console.warn('Error ending matching session:', err);
    }
  },
};
