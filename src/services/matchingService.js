/**
 * Automatic Partner Matching Service
 * Coordinates matching sessions, exclusion filtering, and atomic candidate retrieval.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';

import { SAMPLE_MEMBERS } from './presenceService';

export const matchingService = {
  /**
   * Start a new matching session
   */
  async startMatchingSession(userId) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client is not configured.');
    }

    // Set user presence available
    try {
      await supabase
        .from('user_presence')
        .update({
          is_available: true,
          is_online: true,
          last_seen: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } catch (_) {}

    try {
      const { data, error } = await supabase
        .from('matching_sessions')
        .insert({
          user_id: userId,
          status: 'active',
          started_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (!error && data?.id) {
        return data.id;
      }
    } catch (_) {}

    return `session-${Date.now()}`;
  },

  /**
   * Find one eligible online community member for this matching session
   */
  async findEligiblePartner(userId, sessionId, excludedPartnerIds = [], preferredPartner = null) {
    const excludedSet = new Set(excludedPartnerIds || []);
    if (userId) excludedSet.add(userId);

    // 1. Direct Target: if a preferred partner was selected from Active Members list
    if (preferredPartner) {
      const pId = preferredPartner.user_id || preferredPartner.id || preferredPartner.partner_id;
      if (pId && !excludedSet.has(pId)) {
        return {
          partner_id: pId,
          display_name: preferredPartner.display_name || 'Community Member',
          avatar_url: preferredPartner.avatar_url || '',
          country: preferredPartner.country || 'Global',
          english_level: preferredPartner.english_level || 'Intermediate',
          is_sample: Boolean(preferredPartner.is_sample || String(pId).startsWith('sample-')),
        };
      }
    }

    if (!isSupabaseConfigured || !supabase) {
      // Pick next available sample member not in excludedSet
      const sample = SAMPLE_MEMBERS.find((m) => !excludedSet.has(m.user_id) && m.user_id !== userId);
      if (sample) {
        return {
          partner_id: sample.user_id,
          display_name: sample.display_name,
          avatar_url: sample.avatar_url || '',
          country: sample.country,
          english_level: sample.english_level,
          is_sample: true,
        };
      }
      return null;
    }

    // 2. Try atomic database RPC function
    try {
      const { data, error } = await supabase.rpc('find_matching_partner', {
        p_user_id: userId,
        p_session_id: sessionId,
      });

      if (!error && data && data.length > 0) {
        const candidate = data[0];
        if (!excludedSet.has(candidate.partner_id)) {
          return candidate;
        }
      }
    } catch (rpcErr) {
      console.warn('RPC matching notice:', rpcErr);
    }

    // 3. Direct Query Fallback with exclusion rules
    try {
      // Find available, online members active in the last 60 seconds
      const sixtySecondsAgo = new Date(Date.now() - 60000).toISOString();
      const { data: candidates, error: candErr } = await supabase
        .from('user_presence')
        .select(`
          user_id,
          last_seen,
          profiles:user_id (id, display_name, avatar_url, country, english_level)
        `)
        .eq('is_online', true)
        .eq('is_available', true)
        .is('current_call_id', null)
        .gte('last_seen', sixtySecondsAgo)
        .neq('user_id', userId)
        .order('last_seen', { ascending: false })
        .limit(20);

      if (!candErr && Array.isArray(candidates) && candidates.length > 0) {
        const eligible = candidates.find((item) => !excludedSet.has(item.user_id));
        if (eligible && eligible.profiles) {
          return {
            partner_id: eligible.user_id,
            display_name: eligible.profiles.display_name || 'Active Member',
            avatar_url: eligible.profiles.avatar_url || '',
            country: eligible.profiles.country || 'Global',
            english_level: eligible.profiles.english_level || 'Intermediate',
            is_sample: false,
          };
        }
      }
    } catch (err) {
      console.warn('Find eligible partner query notice:', err);
    }

    // Only real members are matched
    return null;
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
