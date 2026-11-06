/**
 * Call Session and Invitation Service
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const callService = {
  /**
   * Request a call session with an eligible partner
   */
  async requestCall(callerId, receiverId, sessionId, callType = 'video') {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client is not configured.');
    }

    // Try stored procedure
    const { data: callId, error: rpcErr } = await supabase.rpc('request_call', {
      p_caller_id: callerId,
      p_receiver_id: receiverId,
      p_session_id: sessionId,
      p_call_type: callType,
    });

    if (!rpcErr && callId) {
      return callId;
    }

    // Direct insert fallback
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

    if (error) throw error;

    // Record attempt
    await supabase.from('matching_attempts').insert({
      matching_session_id: sessionId,
      caller_id: callerId,
      partner_id: receiverId,
      call_id: data.id,
      status: 'ringing',
    });

    // Mark current calls
    await supabase.from('user_presence').update({ current_call_id: data.id }).eq('user_id', receiverId);
    await supabase.from('user_presence').update({ current_call_id: data.id }).eq('user_id', callerId);

    return data.id;
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
    if (!isSupabaseConfigured || !supabase) return null;

    const { data, error } = await supabase
      .from('call_sessions')
      .select('*')
      .eq('id', callId)
      .single();

    if (error) return null;

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
