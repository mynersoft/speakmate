import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Hand, 
  MessageSquare, 
  Users, 
  ShieldCheck, 
  Settings, 
  Send, 
  Clock, 
  Volume2, 
  VolumeX, 
  Radio, 
  Sparkles 
} from 'lucide-react';
import { classService } from '../services/classService';
import { useAuth } from '../context/AuthContext';

export default function LiveClassroom() {
  const { classId } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [classData, setClassData] = useState(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'System', text: 'Welcome to the SpeakMate Live Classroom! Maintain respectful dialogue and keep mic muted while the mentor is explaining.', isSystem: true },
    { id: 2, sender: 'Sarah Johnson (Mentor)', text: 'Hello everyone! Glad to see you all. We will begin our interactive fluency drills in 2 minutes.' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [classroomTimer, setClassroomTimer] = useState(0);

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    const fetchClass = async () => {
      const cls = await classService.getClassById(classId);
      if (cls) setClassData(cls);
    };

    fetchClass();

    // Start classroom timer
    const interval = setInterval(() => {
      setClassroomTimer((prev) => prev + 1);
    }, 1000);

    // Acquire local preview stream
    const setupLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Camera/mic access in classroom notice:', err);
      }
    };

    setupLocalStream();

    return () => {
      clearInterval(interval);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [classId]);

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micEnabled;
      }
    }
    setMicEnabled(!micEnabled);
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoEnabled;
      }
    }
    setVideoEnabled(!videoEnabled);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: profile?.display_name || user?.email?.split('@')[0] || 'You',
        text: newMessage.trim(),
      }
    ]);
    setNewMessage('');
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isMentor = user && classData && user.id === classData.mentor_id;

  return (
    <div className="fixed inset-0 bg-slate-950 text-white flex flex-col z-50">
      
      {/* Classroom Header */}
      <header className="h-14 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between bg-slate-900 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            LIVE
          </div>
          <h1 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
            {classData?.title || 'Live Classroom'}
          </h1>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="font-mono font-bold text-slate-200">{formatTimer(classroomTimer)}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <Users className="w-4 h-4 text-slate-500" />
            <span>14 online</span>
          </div>

          <button
            onClick={() => navigate('/classes')}
            className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs transition-colors"
          >
            Leave
          </button>
        </div>
      </header>

      {/* Classroom Main Viewport */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
        
        {/* Main Video & Student Grid Stage */}
        <div className="lg:col-span-3 flex flex-col p-4 sm:p-6 bg-slate-950 overflow-y-auto space-y-4">
          
          {/* Main Mentor Stage */}
          <div className="relative aspect-video max-h-[55vh] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center">
            {/* Simulated Live Mentor Broadcast Feed */}
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1200"
              alt="Mentor Feed"
              className="w-full h-full object-cover"
            />

            {/* Mentor Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-white">
                {classData?.mentor_name || 'Sarah Johnson'} (Mentor)
              </span>
            </div>

            {/* Audio Wave Indicator */}
            <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-1 bg-emerald-400 h-2 animate-pulse"></span>
                <span className="w-1 bg-emerald-400 h-3 animate-pulse delay-75"></span>
                <span className="w-1 bg-emerald-400 h-1.5 animate-pulse delay-150"></span>
              </div>
            </div>
          </div>

          {/* Student WebRTC Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* User's Own Camera */}
            <div className="relative aspect-video rounded-xl bg-slate-900 overflow-hidden border-2 border-blue-600/60 shadow-md">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${!videoEnabled ? 'hidden' : ''}`}
              />
              {!videoEnabled && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 text-xs">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm mb-1">
                    {profile?.display_name?.charAt(0) || 'U'}
                  </div>
                  <span>Camera Off</span>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-semibold text-white">
                You {!micEnabled && '🔇'}
              </div>
            </div>

            {/* Simulated Peers in classroom */}
            {[
              { name: 'Kenji S.', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300' },
              { name: 'Elena R.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300' },
              { name: 'Mateo M.', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300' },
            ].map((peer, idx) => (
              <div key={idx} className="relative aspect-video rounded-xl bg-slate-900 overflow-hidden border border-slate-800">
                <img src={peer.img} alt={peer.name} className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-semibold text-white">
                  {peer.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Chat & Q&A Panel */}
        <div className="lg:col-span-1 bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Classroom Chat & Q&A</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-slate-800 rounded text-slate-400">Live</span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-3 rounded-xl ${
                  m.isSystem
                    ? 'bg-blue-900/30 border border-blue-500/20 text-blue-200'
                    : 'bg-slate-950 border border-slate-800'
                }`}
              >
                <span className="font-bold text-[11px] text-blue-400 block mb-0.5">
                  {m.sender}
                </span>
                <p className="text-slate-200 leading-relaxed">{m.text}</p>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
            <input
              type="text"
              placeholder="Ask a question or comment..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-500"
            />
            <button
              type="submit"
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Classroom Footer Controls */}
      <footer className="h-18 bg-slate-900 border-t border-slate-800 px-6 flex items-center justify-center gap-4 shrink-0">
        
        {/* Mic Toggle */}
        <button
          onClick={toggleMic}
          className={`p-3 rounded-full transition-all ${
            micEnabled ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white shadow-lg'
          }`}
          title={micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
        >
          {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* Video Toggle */}
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full transition-all ${
            videoEnabled ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white shadow-lg'
          }`}
          title={videoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
        >
          {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {/* Raise Hand */}
        <button
          onClick={() => setHandRaised(!handRaised)}
          className={`px-4 py-2.5 rounded-full flex items-center gap-2 text-xs font-bold transition-all ${
            handRaised
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
        >
          <Hand className="w-4 h-4" />
          {handRaised ? 'Hand Raised' : 'Raise Hand'}
        </button>

        {/* Leave */}
        <button
          onClick={() => navigate('/classes')}
          className="p-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg"
          title="Leave Classroom"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
}
