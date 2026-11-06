/**
 * Automatic Partner Matching State Machine Hook
 * Handles automated searching, 15s ringing timeout, auto-next partner retry, and state management.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchingService } from '../services/matchingService';
import { callService } from '../services/callService';

export const MATCH_STATES = {
  IDLE: 'idle',
  SEARCHING: 'searching',
  REQUESTING: 'requesting',
  RINGING: 'ringing',
  ACCEPTED: 'accepted',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  SKIPPED: 'skipped',
  REJECTED: 'rejected',
  MISSED: 'missed',
  ENDED: 'ended',
  STOPPED: 'stopped',
  NO_PARTNER: 'no_partner_available',
  FAILED: 'failed',
};

export function useMatching() {
  const { user, isApproved } = useAuth();
  const navigate = useNavigate();

  const [matchState, setMatchState] = useState(MATCH_STATES.IDLE);
  const [currentPartner, setCurrentPartner] = useState(null);
  const [activeCallId, setActiveCallId] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [countdown, setCountdown] = useState(15);
  const [errorMessage, setErrorMessage] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);

  const sessionIdRef = useRef(null);
  const callIdRef = useRef(null);
  const ringTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const excludedPartnersRef = useRef(new Set());
  const callUnsubscribeRef = useRef(null);
  const isMatchingActiveRef = useRef(false);

  // Clear all running timers and call listeners
  const clearTimers = useCallback(() => {
    if (ringTimerRef.current) {
      clearTimeout(ringTimerRef.current);
      ringTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (callUnsubscribeRef.current) {
      callUnsubscribeRef.current();
      callUnsubscribeRef.current = null;
    }
  }, []);

  /**
   * Search for an eligible partner and dispatch call invitation
   */
  const searchAndConnect = useCallback(async () => {
    if (!isMatchingActiveRef.current || !user) return;

    clearTimers();
    setMatchState(MATCH_STATES.SEARCHING);
    setErrorMessage('');
    setCurrentPartner(null);
    setCountdown(15);

    try {
      const sessionId = sessionIdRef.current;
      const excludedArray = Array.from(excludedPartnersRef.current);

      // Search eligible partner
      const partner = await matchingService.findEligiblePartner(user.id, sessionId, excludedArray);

      if (!isMatchingActiveRef.current) return;

      if (!partner) {
        setMatchState(MATCH_STATES.NO_PARTNER);
        return;
      }

      // Record partner in excluded set so we don't loop on them in this session
      excludedPartnersRef.current.add(partner.partner_id);
      setCurrentPartner(partner);
      setAttemptCount((prev) => prev + 1);

      // Create call request
      setMatchState(MATCH_STATES.REQUESTING);
      const newCallId = await callService.requestCall(user.id, partner.partner_id, sessionId, 'video');

      if (!isMatchingActiveRef.current) {
        // If user cancelled during creation, immediately reject
        await callService.rejectOrTimeoutCall(newCallId, user.id, 'cancelled');
        return;
      }

      callIdRef.current = newCallId;
      setActiveCallId(newCallId);
      setMatchState(MATCH_STATES.RINGING);

      // 15-second countdown ticker
      let secondsLeft = 15;
      setCountdown(15);
      countdownIntervalRef.current = setInterval(() => {
        secondsLeft -= 1;
        setCountdown(secondsLeft);
        if (secondsLeft <= 0) {
          clearInterval(countdownIntervalRef.current);
        }
      }, 1000);

      // 15-second Ringing Timeout -> Automatic Next Partner
      ringTimerRef.current = setTimeout(async () => {
        if (!isMatchingActiveRef.current) return;

        setMatchState(MATCH_STATES.MISSED);
        await callService.rejectOrTimeoutCall(newCallId, user.id, 'timeout');
        clearTimers();

        // Automatically search next available member after 1 second delay
        setTimeout(() => {
          if (isMatchingActiveRef.current) {
            searchAndConnect();
          }
        }, 1200);
      }, 15000);

      // Listen for partner response in Realtime
      callUnsubscribeRef.current = callService.listenToCallSession(newCallId, async (updatedCall) => {
        if (updatedCall.status === 'accepted') {
          clearTimers();
          setMatchState(MATCH_STATES.ACCEPTED);
          isMatchingActiveRef.current = false;
          // Navigate to real WebRTC video call room
          navigate(`/call/${newCallId}`);
        } else if (updatedCall.status === 'rejected') {
          clearTimers();
          setMatchState(MATCH_STATES.REJECTED);
          // Automatically try next partner
          setTimeout(() => {
            if (isMatchingActiveRef.current) {
              searchAndConnect();
            }
          }, 1500);
        }
      });
    } catch (err) {
      console.error('Matching cycle error:', err);
      if (isMatchingActiveRef.current) {
        setErrorMessage(err.message || 'Unable to connect to matching service.');
        setMatchState(MATCH_STATES.FAILED);
      }
    }
  }, [user, clearTimers, navigate]);

  /**
   * Start practicing / begin matching engine
   */
  const startMatching = useCallback(async () => {
    if (!user) {
      setErrorMessage('Please login to start practicing.');
      setMatchState(MATCH_STATES.FAILED);
      return;
    }

    try {
      // Prompt camera/mic permissions check early
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach((t) => t.stop());
      } catch (mediaErr) {
        setErrorMessage('Camera or microphone access is required to practice English. Please allow permissions in your browser.');
        setMatchState(MATCH_STATES.FAILED);
        return;
      }

      clearTimers();
      excludedPartnersRef.current.clear();
      setAttemptCount(0);
      isMatchingActiveRef.current = true;

      const newSessionId = await matchingService.startMatchingSession(user.id);
      sessionIdRef.current = newSessionId;
      setActiveSessionId(newSessionId);

      await searchAndConnect();
    } catch (err) {
      console.error('Error starting matching session:', err);
      setErrorMessage(err.message || 'Failed to start matching session.');
      setMatchState(MATCH_STATES.FAILED);
    }
  }, [user, isApproved, clearTimers, searchAndConnect]);

  /**
   * Next Partner / Skip System:
   * End current request, exclude previous partner, and immediately search next partner.
   */
  const skipToNextPartner = useCallback(async () => {
    clearTimers();

    if (callIdRef.current && user) {
      try {
        await callService.rejectOrTimeoutCall(callIdRef.current, user.id, 'skipped');
      } catch (_) {}
      callIdRef.current = null;
      setActiveCallId(null);
    }

    setMatchState(MATCH_STATES.SKIPPED);
    isMatchingActiveRef.current = true;

    // Small animation breather then immediately search next
    setTimeout(() => {
      if (isMatchingActiveRef.current) {
        searchAndConnect();
      }
    }, 600);
  }, [clearTimers, user, searchAndConnect]);

  /**
   * Stop matching altogether and return to idle
   */
  const stopMatching = useCallback(async () => {
    isMatchingActiveRef.current = false;
    clearTimers();

    if (callIdRef.current && user) {
      try {
        await callService.rejectOrTimeoutCall(callIdRef.current, user.id, 'cancelled');
      } catch (_) {}
      callIdRef.current = null;
      setActiveCallId(null);
    }

    if (sessionIdRef.current && user) {
      await matchingService.endMatchingSession(sessionIdRef.current, user.id);
      sessionIdRef.current = null;
      setActiveSessionId(null);
    }

    setMatchState(MATCH_STATES.STOPPED);
    setCurrentPartner(null);
    setCountdown(15);
  }, [clearTimers, user]);

  // Teardown on unmount
  useEffect(() => {
    return () => {
      isMatchingActiveRef.current = false;
      clearTimers();
      if (sessionIdRef.current && user) {
        matchingService.endMatchingSession(sessionIdRef.current, user.id);
      }
    };
  }, [clearTimers, user]);

  return {
    matchState,
    currentPartner,
    activeCallId,
    activeSessionId,
    countdown,
    errorMessage,
    attemptCount,
    startMatching,
    skipToNextPartner,
    stopMatching,
    retrySearch: searchAndConnect,
  };
}

export default useMatching;
