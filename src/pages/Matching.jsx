import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  ShieldCheck, 
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Lock,
  Volume2,
  Users,
  RefreshCw,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMatching, MATCH_STATES } from '../hooks/useMatching';
import MatchingStatus from '../components/MatchingStatus';
import { stopMediaStream } from '../utils/cleanup';

export default function Matching() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If navigated here with a preferred partner from Active Members list
  const preferredPartner = location.state?.preferredPartner || null;

  const {
    matchState,
    currentPartner,
    countdown,
    errorMessage,
    attemptCount,
    startMatching,
    skipToNextPartner,
    stopMatching,
    retrySearch,
  } = useMatching();

  // Media permission and preview state
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt' | 'granted' | 'denied'
  const [mediaMode, setMediaMode] = useState('video'); // 'video' | 'audio'
  const [previewStream, setPreviewStream] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(true);
  const [previewAudio, setPreviewAudio] = useState(true);
  const [micVolume, setMicVolume] = useState(0); // 0 to 100 for live meter
  const [permissionErrorDetail, setPermissionErrorDetail] = useState('');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const previewVideoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Set up live audio volume analyzer
  const setupAudioMeter = (stream) => {
    try {
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) return;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      } else if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        // Normalize 0-100
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setMicVolume(normalized);
        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.warn('Audio meter setup notice:', err);
    }
  };

  const cleanupAudioMeter = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (_) {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setMicVolume(0);
  };

  /**
   * Request media permission via explicit user click
   */
  const requestMediaPermission = async (mode = 'video') => {
    setIsRequestingPermission(true);
    setPermissionErrorDetail('');

    // Clean any prior preview
    if (previewStream) {
      stopMediaStream(previewStream);
      setPreviewStream(null);
    }
    cleanupAudioMeter();

    try {
      let stream;
      if (mode === 'video') {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user',
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          setMediaMode('video');
          setPreviewVideo(true);
        } catch (vidErr) {
          console.warn('Camera failed, attempting audio-only fallback:', vidErr);
          // Fallback to audio-only if camera device not found or denied
          stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          setMediaMode('audio');
          setPreviewVideo(false);
        }
      } else {
        // Explicit Audio-only mode
        stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        setMediaMode('audio');
        setPreviewVideo(false);
      }

      setPreviewStream(stream);
      setPreviewAudio(true);
      setPermissionStatus('granted');

      // Hook up video preview if video track is present
      if (previewVideoRef.current && stream.getVideoTracks().length > 0) {
        previewVideoRef.current.srcObject = stream;
      }

      // Hook up mic level meter
      setupAudioMeter(stream);
    } catch (err) {
      console.warn('Permission request error:', err);
      setPermissionStatus('denied');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionErrorDetail(
          'Camera or microphone permission was blocked by your browser. Please click the Lock or Camera icon in your address bar to allow access.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionErrorDetail(
          'No camera or microphone found on your device. Please connect a headset or webcam.'
        );
      } else {
        setPermissionErrorDetail(err.message || 'Unable to access media devices.');
      }
    } finally {
      setIsRequestingPermission(false);
    }
  };

  // Toggle preview video track
  const togglePreviewVideo = () => {
    if (previewStream) {
      const vTrack = previewStream.getVideoTracks()[0];
      if (vTrack) {
        vTrack.enabled = !vTrack.enabled;
        setPreviewVideo(vTrack.enabled);
      }
    }
  };

  // Toggle preview audio track
  const togglePreviewAudio = () => {
    if (previewStream) {
      const aTrack = previewStream.getAudioTracks()[0];
      if (aTrack) {
        aTrack.enabled = !aTrack.enabled;
        setPreviewAudio(aTrack.enabled);
      }
    }
  };

  // Start Practicing handler
  const handleStartPractice = async () => {
    // If not granted yet, request permission first
    if (permissionStatus !== 'granted' || !previewStream) {
      await requestMediaPermission(mediaMode);
    }

    // Clean preview before WebRTC manager starts
    if (previewStream) {
      stopMediaStream(previewStream);
      setPreviewStream(null);
    }
    cleanupAudioMeter();

    startMatching(preferredPartner, mediaMode);
  };

  // Clean on unmount or when call becomes active
  useEffect(() => {
    return () => {
      if (previewStream) {
        stopMediaStream(previewStream);
      }
      cleanupAudioMeter();
    };
  }, [previewStream]);

  const isMatchingActive = 
    matchState !== MATCH_STATES.IDLE && 
    matchState !== MATCH_STATES.STOPPED;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (isMatchingActive) stopMatching();
            navigate('/dashboard');
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Approved Community Member
          </span>
        </div>
      </div>

      {/* MATCHING ACTIVE VIEW */}
      {isMatchingActive ? (
        <MatchingStatus
          matchState={matchState}
          currentPartner={currentPartner}
          countdown={countdown}
          errorMessage={errorMessage}
          attemptCount={attemptCount}
          onSkip={skipToNextPartner}
          onStop={stopMatching}
          onRetry={retrySearch}
          onReturnDashboard={() => {
            stopMatching();
            navigate('/dashboard');
          }}
        />
      ) : (
        /* IDLE PRACTICE LOUNGE & DEVICE PERMISSION SETUP */
        <div className="space-y-6">

          {/* TARGET PARTNER BANNER (if arrived from Active Members list) */}
          {preferredPartner && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
                  {preferredPartner.display_name?.charAt(0).toUpperCase() || 'P'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                      Direct Partner Selected
                    </span>
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Ready
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                    {preferredPartner.display_name} • {preferredPartner.country} ({preferredPartner.english_level})
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/matching', { replace: true, state: {} })}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-medium"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* MAIN PERMISSION & DEVICE CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            
            <div className="text-center max-w-lg mx-auto mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mb-3 shadow-inner">
                <Video className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Camera & Microphone Setup
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Grant permission so your practice partner can hear and see you during English conversations.
              </p>
            </div>

            {/* PERMISSION ACTIONS / STATUS */}
            {permissionStatus === 'prompt' && (
              <div className="max-w-md mx-auto space-y-4 mb-8">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                  <p className="text-xs font-semibold text-slate-700">
                    Click below to allow camera & microphone access in your browser:
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => requestMediaPermission('video')}
                      disabled={isRequestingPermission}
                      className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                      {isRequestingPermission ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Video className="w-4 h-4" />
                      )}
                      <span>Allow Camera & Mic</span>
                    </button>

                    <button
                      onClick={() => requestMediaPermission('audio')}
                      disabled={isRequestingPermission}
                      className="px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Mic className="w-4 h-4 text-blue-600" />
                      <span>Allow Mic Only (Audio)</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" />
                    Encrypted WebRTC P2P
                  </span>
                  <span>•</span>
                  <span>Browser asks once</span>
                </div>
              </div>
            )}

            {/* PERMISSION DENIED TROUBLESHOOTING CARD */}
            {permissionStatus === 'denied' && (
              <div className="max-w-md mx-auto mb-8 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">
                      Permission Blocked
                    </h4>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      {permissionErrorDetail || 'Camera and microphone access was blocked by your browser.'}
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 p-3 rounded-xl border border-amber-200/80 text-[11px] space-y-1 text-slate-700">
                  <p className="font-bold text-slate-900">How to unblock in 5 seconds:</p>
                  <p>1. Look at the left side of your browser URL address bar.</p>
                  <p>2. Click the <strong>Lock (🔒)</strong> or <strong>Camera (📹)</strong> icon.</p>
                  <p>3. Toggle <strong>Camera</strong> and <strong>Microphone</strong> to <strong>Allow</strong>.</p>
                  <p>4. Click <strong>Retry Permission</strong> below.</p>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => requestMediaPermission('video')}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry Permission
                  </button>
                  <button
                    onClick={() => requestMediaPermission('audio')}
                    className="px-4 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 font-semibold text-xs hover:bg-amber-100/50 transition-colors"
                  >
                    Try Audio Only
                  </button>
                </div>
              </div>
            )}

            {/* PERMISSION GRANTED: LIVE PREVIEW & CONTROLS */}
            {permissionStatus === 'granted' && (
              <div className="max-w-md mx-auto mb-8 space-y-4">
                
                {/* Status Indicator */}
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {mediaMode === 'video' ? 'Camera & Microphone Ready' : 'Microphone Ready (Audio Practice)'}
                  </span>
                  <button
                    onClick={() => requestMediaPermission(mediaMode === 'video' ? 'audio' : 'video')}
                    className="text-[11px] text-blue-600 hover:text-blue-700 underline font-medium"
                  >
                    Switch to {mediaMode === 'video' ? 'Audio-only' : 'Video mode'}
                  </button>
                </div>

                {/* Video Preview Box (if in video mode) */}
                {mediaMode === 'video' ? (
                  <div className="relative aspect-video rounded-2xl bg-slate-900 overflow-hidden shadow-lg border-2 border-slate-200 group">
                    <video
                      ref={previewVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover mirror ${previewVideo ? 'block' : 'hidden'}`}
                      style={{ transform: 'scaleX(-1)' }}
                    />

                    {!previewVideo && (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4">
                        <VideoOff className="w-8 h-8 mb-2 text-slate-500" />
                        <span className="text-xs font-semibold">Camera Preview Muted</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">Your partner will hear your audio</span>
                      </div>
                    )}

                    {/* Preview overlay toggles */}
                    <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2 z-10">
                      <button
                        type="button"
                        onClick={togglePreviewAudio}
                        className={`p-2.5 rounded-xl text-white text-xs font-medium backdrop-blur-md transition-colors ${
                          previewAudio ? 'bg-slate-800/80 hover:bg-slate-700' : 'bg-rose-600'
                        }`}
                        title={previewAudio ? 'Mute Mic' : 'Unmute Mic'}
                      >
                        {previewAudio ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={togglePreviewVideo}
                        className={`p-2.5 rounded-xl text-white text-xs font-medium backdrop-blur-md transition-colors ${
                          previewVideo ? 'bg-slate-800/80 hover:bg-slate-700' : 'bg-rose-600'
                        }`}
                        title={previewVideo ? 'Turn off camera' : 'Turn on camera'}
                      >
                        {previewVideo ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Audio Mode Card */
                  <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white text-center flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30">
                      <Mic className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Voice-Only Practice Mode</h4>
                      <p className="text-xs text-slate-400 mt-0.5">High-definition audio conversation</p>
                    </div>
                  </div>
                )}

                {/* Real-time Microphone Volume Bar */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                      Microphone Input Level
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {micVolume > 5 ? 'Sound detected ✓' : 'Speak to test mic'}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-75 rounded-full ${
                        micVolume > 10 ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.max(4, micVolume)}%` }}
                    />
                  </div>
                </div>

              </div>
            )}

            {/* ACTION CTA BUTTONS */}
            <div className="max-w-xs mx-auto text-center space-y-3">
              <button
                onClick={handleStartPractice}
                className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2.5"
              >
                {preferredPartner ? (
                  <>
                    <PhoneCall className="w-5 h-5" />
                    Ring {preferredPartner.display_name.split(' ')[0]}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Start Practicing Now
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-400">
                1-on-1 English practice • Metered TURN Relay • 15s auto-retry
              </p>

              {/* Quick Link to Browse Active Members */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  View all active members online
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
