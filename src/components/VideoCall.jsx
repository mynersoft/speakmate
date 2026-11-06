import React, { useRef, useEffect } from 'react';
import { 
  Globe, 
  Award, 
  MicOff, 
  VideoOff, 
  AlertTriangle,
  Lock,
  Volume2
} from 'lucide-react';
import CallControls from './CallControls';

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function VideoCall({
  partner,
  localStream,
  remoteStream,
  connectionStatus,
  connectionType = 'direct',
  isAudioEnabled,
  isVideoEnabled,
  remoteAudioEnabled,
  remoteVideoEnabled,
  callDuration,
  errorMessage,
  onToggleAudio,
  onToggleVideo,
  onEndCall,
  onNextPartner,
  onReport,
}) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] min-h-[550px] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between select-none">
      
      {/* TOP OVERLAY HEADER */}
      <div className="absolute top-0 inset-x-0 z-30 p-4 sm:p-6 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-transparent flex items-center justify-between">
        
        {/* Partner Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600/80 text-white font-bold flex items-center justify-center border-2 border-white/20 shadow-md">
            {partner?.avatar_url ? (
              <img 
                src={partner.avatar_url} 
                alt={partner.display_name} 
                className="w-full h-full rounded-full object-cover" 
              />
            ) : (
              partner?.display_name?.charAt(0).toUpperCase() || 'P'
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-white font-bold text-sm sm:text-base drop-shadow-sm">
                {partner?.display_name || 'English Partner'}
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] text-blue-200 bg-blue-900/60 border border-blue-400/20 px-2 py-0.5 rounded-full">
                <Award className="w-3 h-3 text-blue-400" />
                {partner?.english_level || 'Intermediate'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-slate-400" />
                {partner?.country || 'Global'}
              </span>
              <span>•</span>
              {connectionType === 'relay' ? (
                <span className="flex items-center gap-1 text-[11px] text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded-full border border-blue-400/30" title="Routed through Metered Open Relay TURN server (firewall traversal active)">
                  <Lock className="w-3 h-3 text-blue-400" />
                  Metered TURN Relay
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400" title="Direct peer-to-peer encrypted connection">
                  <Lock className="w-3 h-3" />
                  Direct P2P
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Call Status & Duration Ticker */}
        <div className="flex items-center gap-3">
          {/* Connection status pill */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/70 border border-slate-700/60 backdrop-blur-md text-xs font-medium text-slate-200">
            <span
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-500 animate-pulse'
                  : connectionStatus === 'connecting'
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-rose-500'
              }`}
            />
            <span className="capitalize">{connectionStatus}</span>
          </div>

          {/* Duration Badge */}
          <div className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur-md text-xs font-mono font-bold text-white shadow-inner">
            {formatDuration(callDuration)}
          </div>
        </div>
      </div>

      {/* ERROR BANNER IF ANY */}
      {errorMessage && (
        <div className="absolute top-20 inset-x-4 z-30 max-w-lg mx-auto p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 backdrop-blur-md text-rose-200 text-xs flex items-center gap-2 shadow-lg">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* REMOTE VIDEO CONTAINER */}
      <div className="relative w-full h-full flex items-center justify-center bg-slate-900 overflow-hidden">
        {/* Actual Remote Video Track */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            remoteVideoEnabled ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Remote Camera Off / Audio Only Fallback */}
        {(!remoteVideoEnabled || connectionStatus !== 'connected') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-slate-950/90 backdrop-blur-sm">
            <div className="relative mb-4">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold text-4xl flex items-center justify-center shadow-2xl border-4 border-slate-800">
                {partner?.display_name?.charAt(0).toUpperCase() || 'P'}
              </div>
              {connectionStatus === 'connected' && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-white shadow-sm">
                  <Volume2 className="w-4 h-4 animate-pulse" />
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              {partner?.display_name || 'English Partner'}
            </h3>

            {connectionStatus === 'connected' ? (
              <p className="text-xs text-emerald-400 font-medium">
                Audio-Only Mode • Voice call is active
              </p>
            ) : (
              <p className="text-xs text-amber-400 font-medium animate-pulse">
                Establishing direct WebRTC peer connection...
              </p>
            )}
          </div>
        )}

        {/* Remote Muted Badge */}
        {!remoteAudioEnabled && connectionStatus === 'connected' && (
          <div className="absolute bottom-24 left-6 z-20 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600/90 text-white text-xs font-semibold backdrop-blur-sm">
            <MicOff className="w-3.5 h-3.5" />
            Partner Muted
          </div>
        )}
      </div>

      {/* FLOATING LOCAL VIDEO (PIP) */}
      <div className="absolute bottom-24 sm:bottom-28 right-4 sm:right-6 z-30 w-32 sm:w-48 aspect-video rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700/80 shadow-2xl group">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover mirror ${isVideoEnabled ? 'block' : 'hidden'}`}
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Camera Off Avatar for Local */}
        {!isVideoEnabled && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 p-2 text-center">
            <VideoOff className="w-6 h-6 mb-1 text-slate-500" />
            <span className="text-[10px] font-medium">Camera Off</span>
          </div>
        )}

        {/* Local Mic Status Icon */}
        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1">
          {!isAudioEnabled && (
            <div className="p-1 rounded-md bg-rose-600 text-white" title="Muted">
              <MicOff className="w-3 h-3" />
            </div>
          )}
          <span className="text-[10px] font-semibold text-white/90 bg-slate-950/70 px-1.5 py-0.5 rounded">
            You
          </span>
        </div>
      </div>

      {/* BOTTOM CONTROLS OVERLAY */}
      <div className="absolute bottom-4 inset-x-0 z-30 flex justify-center px-4">
        <CallControls
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          onToggleAudio={onToggleAudio}
          onToggleVideo={onToggleVideo}
          onEndCall={onEndCall}
          onNextPartner={onNextPartner}
          onReport={onReport}
        />
      </div>
    </div>
  );
}
