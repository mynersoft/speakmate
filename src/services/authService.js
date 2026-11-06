/**
 * Supabase Authentication Service
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const authService = {
  /**
   * Register a new user with metadata (display_name, invite_code, etc.)
   */
  async signUp({ email, password, displayName, country = 'Global', englishLevel = 'Intermediate', inviteCode = '' }) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please provide your Supabase URL and Key.');
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          display_name: displayName.trim(),
          country,
          english_level: englishLevel,
          invite_code: inviteCode.trim(),
        },
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign in with email and password
   */
  async signIn({ email, password }) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please enter your credentials.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign out current user
   */
  async signOut() {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Request password reset link
   */
  async resetPassword(email) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/settings`,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Update current user's password
   */
  async updatePassword(newPassword) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Get active user session
   */
  async getSession() {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Error fetching session:', error.message);
      return null;
    }
    return data.session;
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  },

  /**
   * Subscribe to auth state transitions
   */
  onAuthStateChange(callback) {
    if (!isSupabaseConfigured || !supabase) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabase.auth.onAuthStateChange(callback);
  },
};
