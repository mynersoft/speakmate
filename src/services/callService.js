/**
 * Call Session and Invitation Service
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// In-memory call sessions for offline/sample testing or non-UUID test partners
const localCallSessions = new Map();
const localCallListeners = new Map();

export const callService = {
  /**
   * Request a call session with an eligible partner
   */
  async requestCall(callerId, receiverId, sessionId, callType = 'video') {
    const isSample = String(receiverId).startsWith('sample-') || String(receiverId).startsWith('mock-');

    if (!isSample && isSupabaseConfigured && supabase) {
      // Try stored procedure
      try {
        const { data: callId, error: rpcErr } = await supabase.rpc('request_call', {
          p_caller_id: callerId,
          p_receiver_id: receiverId,
          p_session_id: sessionId,
          p_call_type: callType,
        });

        if (!rpcErr && callId) {
          return callId;
        }
      } catch (_) {}

      // Direct insert fallback
      try {
        const { data, error } = await supabase
          .from('call_sessions')
          .insert({
            caller_id: callerId,
            receiver_id: receiverId,
            matching_session_id: sessionId,
            call_type: callType,
            status: 'ringing',
          })
          .select('id')
          .single();

        if (!error && data?.id) {
          try {
            await supabase.from('matching_attempts').insert({
              matching_session_id: sessionId,
              caller_id: callerId,
              partner_id: receiverId,
              call_id: data.id,
              status: 'ringing',
            });
            await supabase.from('user_presence').update({ current_call_id: data.id }).eq('user_id', receiverId);
            await supabase.from('user_presence').update({ current_call_id: data.id }).eq('user_id', callerId);
          } catch (_) {}
          return data.id;
        }
      } catch (err) {
        console.warn('Database call request notice:', err);
      }
    }

    // In-memory simulation for active community sample partners or offline testing
    const simulatedCallId = `call-sample-${Date.now()}`;
    const simSession = {
      id: simulatedCallId,
      caller_id: callerId,
      receiver_id: receiverId,
      matching_session_id: sessionId,
      call_type: callType,
      status: 'ringing',
      created_at: new Date().toISOString(),
    };
    localCallSessions.set(simulatedCallId, simSession);

    // Auto-accept simulated sample partner call after 2.5 seconds ringing
    setTimeout(() => {
      simSession.status = 'accepted';
      simSession.accepted_at = new Date().toISOString();
      simSession.started_at = new Date().toISOString();
      const listener = localCallListeners.get(simulatedCallId);
      if (listener) listener(simSession);
    }, 2500);

    return simulatedCallId;
  },

  /**
   * Accept an incoming call request
   */
  async acceptCall(callId, userId) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client is not configured.');
    }

    const { data, error } = await supabase.rpc('accept_call', {
      p_call_id: callId,
      p_user_id: userId,
    });

    if (error) {
      // Fallback direct update
      const { data: updated, error: updErr } = await supabase
        .from('call_sessions')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          started_at: new Date().toISOString(),
        })
        .eq('id', callId)
        .eq('receiver_id', userId)
        .select()
        .single();

      if (updErr) throw updErr;

      // Update presence
      await supabase.from('user_presence').update({ is_available: false, current_call_id: callId }).eq('user_id', userId);
      return true;
    }

    return Boolean(data);
  },

  /**
   * Reject or time-out a call request
   */
  async rejectOrTimeoutCall(callId, userId, reason = 'rejected') {
    if (!isSupabaseConfigured || !supabase) return false;

    const { data, error } = await supabase.rpc('reject_or_timeout_call', {
      p_call_id: callId,
      p_user_id: userId,
      p_reason: reason,
    });

    if (error) {
      // Fallback
      await supabase
        .from('call_sessions')
        .update({
          status: reason === 'timeout' ? 'missed' : 'rejected',
          ended_at: new Date().toISOString(),
        })
        .eq('id', callId);

      await supabase
        .from('user_presence')
        .update({ current_call_id: null })
        .eq('user_id', userId);

      return true;
    }

    return Boolean(data);
  },

  /**
   * End an active call
   */
  async endCall(callId, userId) {
    if (!isSupabaseConfigured || !supabase) return false;

    const { data, error } = await supabase.rpc('end_call', {
      p_call_id: callId,
      p_user_id: userId,
    });

    if (error) {
      await supabase
        .from('call_sessions')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
        })
        .eq('id', callId);

      await supabase
        .from('user_presence')
        .update({ current_call_id: null, is_available: false })
        .eq('user_id', userId);

      return true;
    }

    return Boolean(data);
  },

  /**
   * Fetch call session by ID with caller and receiver profiles
   */
  async getCallSession(callId) {
    if (localCallSessions.has(callId)) {
      const local = localCallSessions.get(callId);
      // Return simulated partner
      return {
        ...local,
        caller: { display_name: 'You', country: 'Global' },
        receiver: {
          display_name: 'Elena Rostova',
          country: 'Spain',
          english_level: 'Intermediate',
          avatar_url: '',
        },
      };
    }

    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const { data, error } = await supabase
        .from('call_sessions')
        .select('*')
        .eq('id', callId)
        .single();

      if (error || !data) return null;

      // Fetch caller & receiver profiles
      const [callerRes, receiverRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', data.caller_id).single(),
        supabase.from('profiles').select('*').eq('id', data.receiver_id).single(),
      ]);

      return {
        ...data,
        caller: callerRes.data || null,
        receiver: receiverRes.data || null,
      };
    } catch (_) {
      return null;
    }
  },

  /**
   * Listen for incoming calls targeted at this user
   */
  listenForIncomingCalls(userId, onIncomingCall) {
    if (!isSupabaseConfigured || !supabase || !userId) {
      return () => {};
    }

    const channelName = `incoming-calls:${userId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_sessions',
          filter: `receiver_id=eq.${userId}`,
        },
        async (payload) => {
          if (payload.new && payload.new.status === 'ringing') {
            // Fetch caller profile for invitation card
            const { data: callerProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', payload.new.caller_id)
              .single();

            onIncomingCall({
              ...payload.new,
              caller: callerProfile || { display_name: 'Community Member', country: 'Global' },
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Listen to status changes on an ongoing call session
   */
  listenToCallSession(callId, onStatusChange) {
    // If local simulated session, register listener
    if (localCallSessions.has(callId)) {
      localCallListeners.set(callId, onStatusChange);
      return () => {
        localCallListeners.delete(callId);
      };
    }

    if (!isSupabaseConfigured || !supabase || !callId) {
      return () => {};
    }

    const channelName = `call-status:${callId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'call_sessions',
          filter: `id=eq.${callId}`,
        },
        (payload) => {
          if (payload.new && onStatusChange) {
            onStatusChange(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Block a user
   */
  async blockUser(blockerId, blockedId) {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.from('user_blocks').insert({
      blocker_id: blockerId,
      blocked_id: blockedId,
    });
  },

  /**
   * Report a user
   */
  async reportUser(reporterId, reportedId, reason, details = '') {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.from('user_reports').insert({
      reporter_id: reporterId,
      reported_id: reportedId,
      reason,
      details,
    });
  },
};
