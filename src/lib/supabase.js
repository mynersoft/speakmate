/**
 * SpeakMate Supabase Client Configuration
 * Initializes the Supabase client using environment variables or user-provided keys.
 */
import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite environment or localStorage for in-browser configuration
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('speakmate_supabase_url') : null;
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('speakmate_supabase_key') : null;

export const supabaseUrl = envUrl && !envUrl.includes('your-project') ? envUrl : storedUrl || '';
export const supabaseAnonKey = envKey && !envKey.includes('your-supabase') ? envKey : storedKey || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey &&
  supabaseAnonKey.length > 20
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/**
 * Update Supabase credentials in browser session
 */
export function saveSupabaseConfig(url, key) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('speakmate_supabase_url', url.trim());
    localStorage.setItem('speakmate_supabase_key', key.trim());
    window.location.reload();
  }
}

/**
 * Clear stored credentials
 */
export function clearSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('speakmate_supabase_url');
    localStorage.removeItem('speakmate_supabase_key');
    window.location.reload();
  }
}
