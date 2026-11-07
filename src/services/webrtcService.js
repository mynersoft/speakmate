/**
 * WebRTC Calling and Signaling Service with Metered Open Relay TURN Integration
 * 
 * Features:
 * - Secure backend ICE credential retrieval via /api/ice-servers
 * - Never exposes secret API keys in frontend code
 * - Metered Open Relay STUN, TURN (UDP), TURN (TCP), and TURNS (TLS) fallback
 * - Direct P2P preference (host/srflx candidates prioritized by WebRTC engine)
 * - Graceful handling of TURN credential expiration and automatic refetching
 * - Automatic ICE restart and reconnection handling
 * - Informative connection state monitoring and error messages
 * - Graceful fallback when TURN is temporarily unavailable
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { closePeerConnection, stopMediaStream } from '../utils/cleanup';

// Cached ICE servers in memory
let cachedIceConfig = null;
let cacheExpiry = 0;

/**
 * Fallback STUN configuration if backend endpoint is temporarily unreachable
 */
function getEmergencyStunServers() {
  const customStun = import.meta.env.VITE_STUN_SERVER;
  return [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:openrelay.metered.ca:80' },
    ...(customStun ? [{ urls: customStun }] : []),
  ];
}

/**
 * Fetch ICE servers (STUN + Metered Open Relay TURN) securely from the backend
 */
export async function fetchIceServers(forceRefresh = false) {
  const now = Date.now();

  // Return cached credentials if still valid
  if (!forceRefresh && cachedIceConfig && cacheExpiry > now + 30000) {
    return cachedIceConfig;
  }

  try {
    const response = await fetch('/api/ice-servers', {
      headers: { 'Accept': 'application/json' },
    });

    if (response.ok) {
      const payload = await response.json();
      if (payload.success && Array.isArray(payload.iceServers) && payload.iceServers.length > 0) {
        cachedIceConfig = payload.iceServers;
        cacheExpiry = payload.expiresAt || (now + 10 * 60 * 1000);
        return cachedIceConfig;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch ICE servers from /api/ice-servers (using emergency STUN):', err);
  }

  // Graceful fallback to STUN if backend is temporarily unreachable
  cachedIceConfig = getEmergencyStunServers();
  cacheExpiry = now + 60000;
  return cachedIceConfig;
}

export class WebRTCManager {
  constructor({ callId, isCaller, onRemoteStream, onConnectionStateChange, onError, onDiagnosticUpdate }) {
    this.callId = callId;
    this.isCaller = isCaller;
    this.onRemoteStream = onRemoteStream;
    this.onConnectionStateChange = onConnectionStateChange;
    this.onError = onError;
    this.onDiagnosticUpdate = onDiagnosticUpdate;

    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = new MediaStream();
    this.signalingChannel = null;
    this.pendingIceCandidates = [];
    this.isRemoteDescriptionSet = false;
    this.isRestartingIce = false;
    this.connectionType = 'direct'; // 'direct' (P2P host/srflx) or 'relay' (TURN)
    this.selectedCandidatePair = null;
  }

  /**
   * Acquire local camera and microphone stream with automatic audio-only fallback
   */
  async initLocalMedia({ video = true, audio = true }) {
    try {
      const constraints = {
        video: video
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user',
            }
          : false,
        audio: audio
          ? {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          : false,
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (err) {
      console.warn('Initial getUserMedia with video failed, checking audio-only fallback:', err);
      // If video was requested and failed (e.g. no camera, permission denied for video), fallback to audio-only
      if (video && audio) {
        try {
          this.localStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          console.info('Successfully acquired audio-only fallback stream.');
          return this.localStream;
        } catch (audioErr) {
          console.error('Audio-only fallback also failed:', audioErr);
        }
      }

      let message = 'Failed to access camera or microphone.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera or microphone permission was denied. Please allow device access in your browser address bar.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera or microphone found on this device.';
      } else if (err.name === 'NotReadableError') {
        message = 'Camera or microphone is currently in use by another application.';
      }
      if (this.onError) this.onError(message, err);
      throw new Error(message);
    }
  }

  /**
   * Setup RTCPeerConnection with Metered Open Relay TURN credentials and Supabase Realtime signaling
   */
  async startCall() {
    // 1. Fetch ICE servers (STUN + Metered Open Relay TURN)
    const iceServers = await fetchIceServers();

    const configuration = {
      iceServers,
      iceCandidatePoolSize: 10,
      iceTransportPolicy: 'all', // 'all' prefers direct host/srflx P2P and uses TURN relay when needed
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    };

    this.peerConnection = new RTCPeerConnection(configuration);

    // 2. Add local audio and video tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }

    // 3. Handle incoming remote tracks
    this.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream.addTrack(track);
      });
      if (this.onRemoteStream) {
        this.onRemoteStream(this.remoteStream);
      }
    };

    // 4. Handle ICE candidates (relay vs direct monitoring)
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.signalingChannel) {
        // Log candidate protocol & type for diagnostics
        const candidateType = event.candidate.type; // 'host' | 'srflx' | 'relay'
        const protocol = event.candidate.protocol; // 'udp' | 'tcp'

        if (candidateType === 'relay') {
          this.connectionType = 'relay';
        }

        if (this.onDiagnosticUpdate) {
          this.onDiagnosticUpdate({
            lastCandidateType: candidateType,
            protocol,
            connectionType: this.connectionType,
          });
        }

        this.signalingChannel.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: { candidate: event.candidate.toJSON() },
        });
      }
    };

    // 5. Connection state monitoring
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection.connectionState;
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(state);
      }

      if (state === 'failed') {
        console.warn('WebRTC connection state failed. Attempting automatic ICE restart with fresh credentials...');
        this.restartIce(true);
      } else if (state === 'connected') {
        this.inspectActiveCandidatePair();
      }
    };

    // 6. ICE connection state monitoring & reconnection
    this.peerConnection.oniceconnectionstatechange = () => {
      const iceState = this.peerConnection.iceConnectionState;

      if (iceState === 'failed') {
        console.warn('ICE connection state failed. Reconnecting via Metered TURN relay...');
        this.restartIce(true);
      } else if (iceState === 'connected' || iceState === 'completed') {
        this.inspectActiveCandidatePair();
      }
    };

    // 7. Setup Supabase Realtime channel for signaling
    await this.setupSignaling();

    // 8. If caller, generate and send SDP Offer
    if (this.isCaller) {
      await this.createOffer();
    }
  }

  /**
   * Inspect active candidate pair using getStats() to verify direct P2P vs TURN Relay
   */
  async inspectActiveCandidatePair() {
    if (!this.peerConnection) return;
    try {
      const stats = await this.peerConnection.getStats();
      stats.forEach((report) => {
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          const localCandidate = stats.get(report.localCandidateId);
          const remoteCandidate = stats.get(report.remoteCandidateId);

          if (localCandidate && remoteCandidate) {
            const isRelay = localCandidate.candidateType === 'relay' || remoteCandidate.candidateType === 'relay';
            this.connectionType = isRelay ? 'relay' : 'direct';
            this.selectedCandidatePair = {
              localType: localCandidate.candidateType,
              remoteType: remoteCandidate.candidateType,
              localProtocol: localCandidate.protocol,
              isRelay,
            };

            if (this.onDiagnosticUpdate) {
              this.onDiagnosticUpdate({
                connectionType: this.connectionType,
                selectedCandidatePair: this.selectedCandidatePair,
              });
            }
          }
        }
      });
    } catch (_) {}
  }

  /**
   * Setup Supabase Realtime channel for WebRTC signaling
   */
  async setupSignaling() {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase not configured, signaling channel unavailable.');
      return;
    }

    const channelName = `signaling-${this.callId}`;
    this.signalingChannel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: true, self: false },
      },
    });

    this.signalingChannel
      .on('broadcast', { event: 'offer' }, async ({ payload }) => {
        if (!this.isCaller && payload?.sdp) {
          await this.handleOffer(payload.sdp);
        }
      })
      .on('broadcast', { event: 'answer' }, async ({ payload }) => {
        if (this.isCaller && payload?.sdp) {
          await this.handleAnswer(payload.sdp);
        }
      })
      .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        if (payload?.candidate) {
          await this.handleCandidate(payload.candidate);
        }
      })
      .on('broadcast', { event: 'media-toggle' }, ({ payload }) => {
        if (this.onRemoteMediaToggle && payload) {
          this.onRemoteMediaToggle(payload);
        }
      })
      .on('broadcast', { event: 'peer-hung-up' }, () => {
        if (this.onConnectionStateChange) {
          this.onConnectionStateChange('disconnected');
        }
      });

    await this.signalingChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED' && this.isCaller) {
        if (this.peerConnection && this.peerConnection.localDescription) {
          this.signalingChannel.send({
            type: 'broadcast',
            event: 'offer',
            payload: { sdp: this.peerConnection.localDescription },
          });
        }
      }
    });
  }

  /**
   * Create SDP Offer (Caller)
   */
  async createOffer() {
    if (!this.peerConnection) return;
    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await this.peerConnection.setLocalDescription(offer);

      if (this.signalingChannel) {
        this.signalingChannel.send({
          type: 'broadcast',
          event: 'offer',
          payload: { sdp: offer },
        });
      }
    } catch (err) {
      console.error('Error creating offer:', err);
      if (this.onError) this.onError('Failed to create WebRTC offer.', err);
    }
  }

  /**
   * Handle incoming SDP Offer (Receiver)
   */
  async handleOffer(offer) {
    if (!this.peerConnection) return;
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      this.isRemoteDescriptionSet = true;

      // Drain queued ICE candidates
      while (this.pendingIceCandidates.length > 0) {
        const candidate = this.pendingIceCandidates.shift();
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      if (this.signalingChannel) {
        this.signalingChannel.send({
          type: 'broadcast',
          event: 'answer',
          payload: { sdp: answer },
        });
      }
    } catch (err) {
      console.error('Error handling offer:', err);
      if (this.onError) this.onError('Failed to process incoming call offer.', err);
    }
  }

  /**
   * Handle incoming SDP Answer (Caller)
   */
  async handleAnswer(answer) {
    if (!this.peerConnection) return;
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      this.isRemoteDescriptionSet = true;

      // Drain queued ICE candidates
      while (this.pendingIceCandidates.length > 0) {
        const candidate = this.pendingIceCandidates.shift();
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (err) {
      console.error('Error handling answer:', err);
      if (this.onError) this.onError('Failed to process call answer.', err);
    }
  }

  /**
   * Handle incoming ICE candidate
   */
  async handleCandidate(candidate) {
    try {
      if (!this.peerConnection || !this.isRemoteDescriptionSet) {
        this.pendingIceCandidates.push(candidate);
      } else {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (err) {
      console.warn('Error adding ICE candidate:', err);
    }
  }

  /**
   * Toggle local microphone track
   */
  toggleAudio(enabled) {
    if (!this.localStream) return false;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = enabled !== undefined ? enabled : !audioTrack.enabled;
      if (this.signalingChannel) {
        this.signalingChannel.send({
          type: 'broadcast',
          event: 'media-toggle',
          payload: { type: 'audio', enabled: audioTrack.enabled },
        });
      }
      return audioTrack.enabled;
    }
    return false;
  }

  /**
   * Toggle local camera track
   */
  toggleVideo(enabled) {
    if (!this.localStream) return false;
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = enabled !== undefined ? enabled : !videoTrack.enabled;
      if (this.signalingChannel) {
        this.signalingChannel.send({
          type: 'broadcast',
          event: 'media-toggle',
          payload: { type: 'video', enabled: videoTrack.enabled },
        });
      }
      return videoTrack.enabled;
    }
    return false;
  }

  /**
   * Attempt ICE restart upon connection failure or credential expiration
   */
  async restartIce(refreshCredentials = false) {
    if (!this.peerConnection || this.isRestartingIce) return;
    this.isRestartingIce = true;

    try {
      // If requested or expired, refresh ICE server configuration with setConfiguration
      if (refreshCredentials) {
        const freshServers = await fetchIceServers(true);
        if (this.peerConnection.setConfiguration) {
          this.peerConnection.setConfiguration({
            iceServers: freshServers,
            iceCandidatePoolSize: 10,
            iceTransportPolicy: 'all',
          });
        }
      }

      if (this.isCaller) {
        const offer = await this.peerConnection.createOffer({ iceRestart: true });
        await this.peerConnection.setLocalDescription(offer);
        if (this.signalingChannel) {
          this.signalingChannel.send({
            type: 'broadcast',
            event: 'offer',
            payload: { sdp: offer },
          });
        }
      }
    } catch (err) {
      console.warn('ICE restart attempt error:', err);
      if (this.onError) {
        this.onError('Network connection interrupted. Retrying peer reconnection...');
      }
    } finally {
      setTimeout(() => {
        this.isRestartingIce = false;
      }, 3000);
    }
  }

  /**
   * Complete teardown of peer connection, signaling channels, and media tracks
   */
  cleanup() {
    if (this.signalingChannel) {
      try {
        this.signalingChannel.send({
          type: 'broadcast',
          event: 'peer-hung-up',
          payload: {},
        });
        if (supabase) {
          supabase.removeChannel(this.signalingChannel);
        }
      } catch (_) {}
      this.signalingChannel = null;
    }

    stopMediaStream(this.localStream);
    this.localStream = null;

    closePeerConnection(this.peerConnection);
    this.peerConnection = null;

    this.pendingIceCandidates = [];
    this.isRemoteDescriptionSet = false;
  }
}
