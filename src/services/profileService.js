/**
 * Supabase Profile and Membership Service
 * Streamlined for frictionless instant access without community approval barriers
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const profileService = {
  /**
   * Get user profile by user UUID
   */
  async getProfile(userId) {
    if (!isSupabaseConfigured || !supabase) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    return data;
  },

  /**
   * Update profile fields
   */
  async updateProfile(userId, updates) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        display_name: updates.displayName?.trim(),
        avatar_url: updates.avatarUrl?.trim(),
        country: updates.country,
        english_level: updates.englishLevel,
        bio: updates.bio?.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update member custom active practice time
   */
  async updatePracticeTime(userId, practiceTime) {
    if (!userId) return null;
    const cleanTime = practiceTime?.trim() || '';

    // Cache locally for instant UI responsiveness
    try {
      if (cleanTime) {
        localStorage.setItem(`speakmate_practice_time_${userId}`, cleanTime);
      } else {
        localStorage.removeItem(`speakmate_practice_time_${userId}`);
      }
    } catch (_) {}

    if (isSupabaseConfigured && supabase) {
      try {
        // Attempt to update practice_time in profiles
        const { data, error } = await supabase
          .from('profiles')
          .update({
            practice_time: cleanTime,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
          .select()
          .single();

        if (!error && data) return data;
      } catch (err) {
        console.warn('Database practice_time column notice (using metadata fallback):', err?.message);
      }

      // If practice_time column not present in profiles table, update user metadata
      try {
        await supabase.auth.updateUser({
          data: { practice_time: cleanTime },
        });
      } catch (_) {}
    }

    return { practice_time: cleanTime };
  },

  /**
   * Get member custom active practice time
   */
  getPracticeTime(userId) {
    if (!userId) return '';
    try {
      return localStorage.getItem(`speakmate_practice_time_${userId}`) || '';
    } catch (_) {
      return '';
    }
  },

  /**
   * Membership status - Instant open access (Community approval barrier removed)
   */
  async getMembershipStatus(userId) {
    // If Supabase is configured, ensure community_members has approved = true
    if (isSupabaseConfigured && supabase && userId) {
      try {
        await supabase
          .from('community_members')
          .upsert({
            user_id: userId,
            approved: true,
            approved_at: new Date().toISOString(),
            role: 'member',
          }, { onConflict: 'user_id' });
      } catch (_) {
        // Table may not exist yet, fallback gracefully
      }
    }

    // Always approved for easy, instant practice access
    return {
      approved: true,
      role: 'member',
      approved_at: new Date().toISOString(),
    };
  },

  /**
   * Apply invite code - accepts any code smoothly without erroring
   */
  async applyInviteCode(userId, inviteCode) {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        await supabase
          .from('community_members')
          .upsert({
            user_id: userId,
            approved: true,
            approved_at: new Date().toISOString(),
            invite_code_used: inviteCode?.trim() || 'WELCOME',
          }, { onConflict: 'user_id' });
      } catch (_) {}
    }
    return true;
  },
};
