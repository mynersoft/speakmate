/**
 * Authentication and Membership Context for SpeakMate
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { presenceService } from '../services/presenceService';
import { callService } from '../services/callService';
import { isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [membership, setMembership] = useState({ approved: false, role: 'member' });
  const [loading, setLoading] = useState(true);
  const [incomingCall, setIncomingCall] = useState(null);

  // Fetch full user profile & membership
  const loadUserData = useCallback(async (authUser) => {
    if (!authUser) {
      setUser(null);
      setProfile(null);
      setMembership({ approved: false, role: 'member' });
      return;
    }

    setUser(authUser);
    try {
      const [profData, memberData] = await Promise.all([
        profileService.getProfile(authUser.id),
        profileService.getMembershipStatus(authUser.id),
      ]);

      setProfile(
        profData || {
          id: authUser.id,
          display_name: authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || 'Member',
          country: authUser.user_metadata?.country || 'Global',
          english_level: authUser.user_metadata?.english_level || 'Intermediate',
          avatar_url: authUser.user_metadata?.avatar_url || '',
        }
      );

      setMembership(memberData || { approved: false, role: 'member' });
    } catch (err) {
      console.warn('Error loading user profile:', err);
    }
  }, []);

  // Initialize session and presence listener
  useEffect(() => {
    let unsubscribeAuth = () => {};
    let unsubscribeIncoming = () => {};

    const init = async () => {
      setLoading(true);
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const session = await authService.getSession();
        if (session?.user) {
          await loadUserData(session.user);
        }
      } catch (err) {
        console.warn('Init auth error:', err);
      } finally {
        setLoading(false);
      }

      const { data } = authService.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          await loadUserData(session.user);
        } else {
          setUser(null);
          setProfile(null);
          setMembership({ approved: false, role: 'member' });
        }
      });
      unsubscribeAuth = data?.subscription?.unsubscribe || (() => {});
    };

    init();

    return () => {
      unsubscribeAuth();
      unsubscribeIncoming();
    };
  }, [loadUserData]);

  // Manage Presence Heartbeat and Incoming Call Listener when user is authenticated
  useEffect(() => {
    if (!user) return;

    // Start heartbeat
    presenceService.startHeartbeat(user.id, () => true);

    // Listen for incoming call invitations
    const unsubscribeCalls = callService.listenForIncomingCalls(user.id, (call) => {
      setIncomingCall(call);
    });

    return () => {
      presenceService.stopHeartbeat(user.id);
      unsubscribeCalls();
    };
  }, [user]);

  const login = async (email, password) => {
    const data = await authService.signIn({ email, password });
    if (data?.user) {
      await loadUserData(data.user);
    }
    return data;
  };

  const signup = async (formData) => {
    const data = await authService.signUp(formData);
    if (data?.user) {
      await loadUserData(data.user);
    }
    return data;
  };

  const instantGuestSignIn = async (name, country, level) => {
    const data = await authService.instantGuestSignIn(name, country, level);
    if (data?.user) {
      await loadUserData(data.user);
    }
    return data;
  };

  const logout = async () => {
    if (user) {
      await presenceService.stopHeartbeat(user.id);
    }
    await authService.signOut();
    setUser(null);
    setProfile(null);
    setMembership({ approved: true, role: 'member' });
    setIncomingCall(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user);
    }
  };

  const applyInviteCode = async (code) => {
    if (!user) return true;
    try {
      await profileService.applyInviteCode(user.id, code);
      await refreshProfile();
    } catch (e) {
      console.warn('Invite code notice:', e);
    }
    return true;
  };

  const dismissIncomingCall = () => {
    setIncomingCall(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        membership: { approved: true, role: 'member' },
        isApproved: Boolean(user),
        loading,
        isConfigured: isSupabaseConfigured,
        login,
        signup,
        instantGuestSignIn,
        logout,
        refreshProfile,
        applyInviteCode,
        incomingCall,
        setIncomingCall,
        dismissIncomingCall,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
