/**
 * Hook for managing WebRTC call connection, audio/video tracks, and duration
 * with Metered Open Relay diagnostics and reconnection handling
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { WebRTCManager } from '../services/webrtcService';
import { callService } from '../services/callService';
import { clearSafeInterval } from '../utils/cleanup';

export function useWebRTC({ callId, isCaller, currentUserId, onCallEnded }) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [connectionType, setConnectionType] = useState('direct'); // 'direct' (P2P) or 'relay' (TURN)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [remoteAudioEnabled, setRemoteAudioEnabled] = useState(true);
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [diagnostics, setDiagnostics] = useState({
    protocol: 'udp',
    lastCandidateType: 'host',
    selectedCandidatePair: null,
  });

  const webrtcManagerRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const isEndedRef = useRef(false);

  // Initialize WebRTC
  useEffect(() => {
    if (!callId) return;

    let isSubscribed = true;
    isEndedRef.current = false;

    const manager = new WebRTCManager({
      callId,
      isCaller,
      onRemoteStream: (stream) => {
        if (isSubscribed) {
          setRemoteStream(stream);
        }
      },
      onConnectionStateChange: (state) => {
        if (!isSubscribed) return;
        setConnectionStatus(state);

        if (state === 'connected') {
          setErrorMessage('');
          // Start duration timer
          if (!durationIntervalRef.current) {
            durationIntervalRef.current = setInterval(() => {
              setCallDuration((prev) => prev + 1);
            }, 1000);
          }
        } else if (state === 'connecting') {
          // Normal connecting state
        } else if (state === 'disconnected') {
          setErrorMessage('Peer temporarily disconnected. Waiting for connection recovery...');
        } else if (state === 'failed') {
          setErrorMessage('Connection failed. Switching to Metered TURN relay fallback...');
        } else if (state === 'closed') {
          clearSafeInterval(durationIntervalRef);
          if (!isEndedRef.current && onCallEnded) {
            isEndedRef.current = true;
            onCallEnded('Call closed');
          }
        }
      },
      onDiagnosticUpdate: (diag) => {
        if (!isSubscribed) return;
        if (diag.connectionType) setConnectionType(diag.connectionType);
        setDiagnostics((prev) => ({ ...prev, ...diag }));
      },
      onError: (msg) => {
        if (isSubscribed) {
          setErrorMessage(msg);
        }
      },
    });

    webrtcManagerRef.current = manager;

    // Listen to remote media toggles
    manager.onRemoteMediaToggle = ({ type, enabled }) => {
      if (type === 'audio') setRemoteAudioEnabled(enabled);
      if (type === 'video') setRemoteVideoEnabled(enabled);
    };

    // Step 1: acquire media
    manager
      .initLocalMedia({ video: true, audio: true })
      .then((stream) => {
        if (isSubscribed) {
          setLocalStream(stream);
          // Step 2: start peer connection and signaling with Metered TURN
          return manager.startCall();
        }
      })
      .catch((err) => {
        if (isSubscribed) {
          setErrorMessage(err.message || 'Media permissions denied.');
        }
      });

    // Listen to call_sessions database changes for abrupt termination
    const unsubscribeSession = callService.listenToCallSession(callId, (session) => {
      if (session.status === 'ended' && !isEndedRef.current) {
        isEndedRef.current = true;
        clearSafeInterval(durationIntervalRef);
        if (onCallEnded) onCallEnded('Call ended by partner');
      }
    });

    return () => {
      isSubscribed = false;
      clearSafeInterval(durationIntervalRef);
      unsubscribeSession();
      if (manager) {
        manager.cleanup();
      }
    };
  }, [callId, isCaller, onCallEnded]);

  // Toggle Microphone
  const toggleAudio = useCallback(() => {
    if (webrtcManagerRef.current) {
      const active = webrtcManagerRef.current.toggleAudio();
      setIsAudioEnabled(active);
    }
  }, []);

  // Toggle Camera
  const toggleVideo = useCallback(() => {
    if (webrtcManagerRef.current) {
      const active = webrtcManagerRef.current.toggleVideo();
      setIsVideoEnabled(active);
    }
  }, []);

  // End Call
  const endCall = useCallback(async () => {
    if (isEndedRef.current) return;
    isEndedRef.current = true;
    clearSafeInterval(durationIntervalRef);

    if (webrtcManagerRef.current) {
      webrtcManagerRef.current.cleanup();
    }

    if (callId && currentUserId) {
      try {
        await callService.endCall(callId, currentUserId);
      } catch (err) {
        console.warn('Error ending call record:', err);
      }
    }

    if (onCallEnded) {
      onCallEnded('Call ended');
    }
  }, [callId, currentUserId, onCallEnded]);

  return {
    localStream,
    remoteStream,
    connectionStatus,
    connectionType,
    diagnostics,
    isAudioEnabled,
    isVideoEnabled,
    remoteAudioEnabled,
    remoteVideoEnabled,
    callDuration,
    errorMessage,
    toggleAudio,
    toggleVideo,
    endCall,
  };
}

export default useWebRTC;
