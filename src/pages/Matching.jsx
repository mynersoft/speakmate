import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  ShieldCheck, 
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMatching, MATCH_STATES } from '../hooks/useMatching';
import MatchingStatus from '../components/MatchingStatus';
import { stopMediaStream } from '../utils/cleanup';

export default function Matching() {
  const { user, isApproved } = useAuth();
  const navigate = useNavigate();
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

  const [previewStream, setPreviewStream] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(true);
  const [previewAudio, setPreviewAudio] = useState(true);
  const [permissionError, setPermissionError] = useState('');
  const previewVideoRef = useRef(null);

  // Initialize camera preview on mount when idle
  useEffect(() => {
    let active = true;

    if (matchState === MATCH_STATES.IDLE || matchState === MATCH_STATES.STOPPED) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (active) {
            setPreviewStream(stream);
            if (previewVideoRef.current) {
              previewVideoRef.current.srcObject = stream;
            }
          }
        })
        .catch((err) => {
          console.warn('Camera preview notice:', err);
          if (active) {
            setPermissionError('Camera or microphone permission required for video practice. Please allow in browser address bar.');
          }
        });
    }

    return () => {
      active = false;
      if (previewStream) {
        stopMediaStream(previewStream);
      }
    };
  }, [matchState]);

  // Clean preview when matching starts
  useEffect(() => {
    if (matchState !== MATCH_STATES.IDLE && matchState !== MATCH_STATES.STOPPED) {
      if (previewStream) {
        stopMediaStream(previewStream);
        setPreviewStream(null);
      }
    }
  }, [matchState, previewStream]);

  const togglePreviewVideo = () => {
    if (previewStream) {
      const vTrack = previewStream.getVideoTracks()[0];
      if (vTrack) {
        vTrack.enabled = !vTrack.enabled;
        setPreviewVideo(vTrack.enabled);
      }
    }
  };

  const togglePreviewAudio = () => {
    if (previewStream) {
      const aTrack = previewStream.getAudioTracks()[0];
      if (aTrack) {
        aTrack.enabled = !aTrack.enabled;
        setPreviewAudio(aTrack.enabled);
      }
    }
  };

  const handleStart = () => {
    if (previewStream) {
      stopMediaStream(previewStream);
      setPreviewStream(null);
    }
    startMatching();
  };

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
            Active Member
          </span>
        </div>
      </div>

      {permissionError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{permissionError}</span>
        </div>
      )}

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
        /* IDLE PRACTICE LOUNGE & CAMERA TEST */
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center">
          
          <div className="max-w-md mx-auto mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
              English Practice Lounge
            </h2>
            <p className="text-xs text-slate-500">
              Check your camera and microphone below, then click Start Practicing to connect with an available community member.
            </p>
          </div>

          {/* Camera Preview Box */}
          <div className="relative max-w-sm mx-auto aspect-video rounded-2xl bg-slate-900 overflow-hidden shadow-lg border-2 border-slate-200 mb-6 group">
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
                <span className="text-xs font-semibold">Camera is Turned Off</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Audio mode will be used</span>
              </div>
            )}

            {/* In-preview toggles */}
            <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2 z-10">
              <button
                type="button"
                onClick={togglePreviewAudio}
                className={`p-2 rounded-xl text-white text-xs font-medium backdrop-blur-md transition-colors ${
                  previewAudio ? 'bg-slate-800/80 hover:bg-slate-700' : 'bg-rose-600'
                }`}
                title={previewAudio ? 'Mute' : 'Unmute'}
              >
                {previewAudio ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={togglePreviewVideo}
                className={`p-2 rounded-xl text-white text-xs font-medium backdrop-blur-md transition-colors ${
                  previewVideo ? 'bg-slate-800/80 hover:bg-slate-700' : 'bg-rose-600'
                }`}
                title={previewVideo ? 'Turn off camera' : 'Turn on camera'}
              >
                {previewVideo ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Start CTA */}
          <div className="max-w-xs mx-auto">
            <button
              onClick={handleStart}
              className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2.5"
            >
              <Sparkles className="w-5 h-5" />
              Start Practicing
            </button>
            <p className="text-[11px] text-slate-400 mt-2">
              Automatic matching • 15s ringing timeout • Instant skip
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
