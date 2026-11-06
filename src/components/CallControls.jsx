import React from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  SkipForward, 
  Flag, 
  ShieldAlert
} from 'lucide-react';

export default function CallControls({
  isAudioEnabled,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo,
  onEndCall,
  onNextPartner,
  onReport,
  disabled = false,
}) {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-3xl bg-slate-900/90 backdrop-blur-lg border border-slate-700/60 shadow-2xl">
      
      {/* Microphone Toggle */}
      <button
        onClick={onToggleAudio}
        disabled={disabled}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md ${
          isAudioEnabled
            ? 'bg-slate-800 hover:bg-slate-700 text-white'
            : 'bg-rose-600 text-white shadow-rose-600/30'
        }`}
        title={isAudioEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
      >
        {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
      </button>

      {/* Camera Toggle */}
      <button
        onClick={onToggleVideo}
        disabled={disabled}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md ${
          isVideoEnabled
            ? 'bg-slate-800 hover:bg-slate-700 text-white'
            : 'bg-rose-600 text-white shadow-rose-600/30'
        }`}
        title={isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
      >
        {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
      </button>

      {/* Next Partner / Skip Button */}
      <button
        onClick={onNextPartner}
        disabled={disabled}
        className="px-5 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        title="Skip to Next Approved Partner"
      >
        <SkipForward className="w-4 h-4" />
        <span className="hidden sm:inline">Next Partner</span>
      </button>

      {/* End Call Button */}
      <button
        onClick={onEndCall}
        disabled={disabled}
        className="w-12 sm:w-auto sm:px-5 h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        title="Leave & End Call"
      >
        <PhoneOff className="w-5 h-5" />
        <span className="hidden sm:inline">End</span>
      </button>

      {/* Report Button */}
      {onReport && (
        <button
          onClick={onReport}
          className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-amber-400 flex items-center justify-center transition-colors"
          title="Report or Block"
        >
          <Flag className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
