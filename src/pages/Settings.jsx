import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Mic, 
  Lock, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Trash2,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { saveSupabaseConfig, clearSupabaseConfig, isSupabaseConfigured, supabaseUrl } from '../lib/supabase';
import { stopMediaStream } from '../utils/cleanup';

export default function Settings() {
  const { user, logout } = useAuth();

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Device test state
  const [devices, setDevices] = useState({ cameras: [], microphones: [] });
  const [testStream, setTestStream] = useState(null);
  const [micLevel, setMicLevel] = useState(0);
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Supabase credentials configuration
  const [dbUrl, setDbUrl] = useState(supabaseUrl || '');
  const [dbKey, setDbKey] = useState('');

  // Load hardware media devices
  useEffect(() => {
    async function getDevices() {
      try {
        const devList = await navigator.mediaDevices.enumerateDevices();
        const cams = devList.filter((d) => d.kind === 'videoinput');
        const mics = devList.filter((d) => d.kind === 'audioinput');
        setDevices({ cameras: cams, microphones: mics });
      } catch (err) {
        console.warn('Error reading devices:', err);
      }
    }

    getDevices();
  }, []);

  // Test microphone audio levels using Web Audio API
  const startHardwareTest = async () => {
    try {
      if (testStream) {
        stopMediaStream(testStream);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setTestStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Audio analysis
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.error('Hardware test error:', err);
    }
  };

  const stopHardwareTest = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (testStream) {
      stopMediaStream(testStream);
      setTestStream(null);
    }
    setMicLevel(0);
  };

  useEffect(() => {
    return () => {
      stopHardwareTest();
    };
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess(false);

    try {
      await authService.updatePassword(newPassword);
      setPasswordSuccess(true);
      setNewPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSaveDb = (e) => {
    e.preventDefault();
    if (!dbUrl || !dbKey) return;
    saveSupabaseConfig(dbUrl, dbKey);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Preferences & Device Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure your audio, video equipment, security, and connection settings.
        </p>
      </div>

      {/* HARDWARE / DEVICE TESTING CARD */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Camera className="w-5 h-5 text-blue-600" />
          Camera & Microphone Hardware Check
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Test your video resolution and microphone input level before joining practice calls.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Test video screen */}
          <div className="relative aspect-video rounded-2xl bg-slate-900 overflow-hidden border border-slate-200">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${testStream ? 'block' : 'hidden'}`}
              style={{ transform: 'scaleX(-1)' }}
            />
            {!testStream && (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                <Camera className="w-8 h-8 mb-2 text-slate-600" />
                <span className="text-xs font-semibold">Camera is not running</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Click Start Hardware Test below</span>
              </div>
            )}
          </div>

          {/* Test Controls & Mic Meter */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1">
                Detected Microphones ({devices.microphones.length})
              </span>
              <p className="text-xs text-slate-500 font-mono">
                {devices.microphones[0]?.label || 'Default System Microphone'}
              </p>
            </div>

            {/* Mic volume meter */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1">
                  <Mic className="w-3.5 h-3.5 text-blue-600" />
                  Live Audio Input Level
                </span>
                <span className="font-mono text-slate-500">{micLevel}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-emerald-500 transition-all duration-75"
                  style={{ width: `${micLevel}%` }}
                />
              </div>
            </div>

            <div className="pt-2">
              {testStream ? (
                <button
                  type="button"
                  onClick={stopHardwareTest}
                  className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
                >
                  Stop Test
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startHardwareTest}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  Start Hardware Test
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* WEBRTC NETWORKING & METERED OPEN RELAY TURN */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            WebRTC Infrastructure & Metered Open Relay TURN
          </h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            STUN + TURN Active
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          SpeakMate prioritizes direct P2P connections via Google STUN and seamlessly falls back to Metered Open Relay TURN (UDP, TCP, and TLS) when symmetric firewalls or restricted NATs are encountered.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              STUN Discovery (Direct P2P Priority)
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Google STUN:</span>
              <span className="font-mono text-slate-700">stun.l.google.com:19302</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Metered STUN:</span>
              <span className="font-mono text-slate-700">openrelay.metered.ca:80</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Transport:</span>
              <span className="text-slate-700 font-medium">Direct UDP Peer-to-Peer</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Metered Open Relay (Firewall Traversal)
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">TURN Relay (UDP):</span>
              <span className="font-mono text-slate-700">openrelay.metered.ca:80, 443</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">TURN Relay (TCP):</span>
              <span className="font-mono text-slate-700">openrelay.metered.ca:80?transport=tcp</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">TURNS (Encrypted TLS):</span>
              <span className="font-mono text-slate-700">turns:openrelay.metered.ca:443</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-blue-900 block">
              Backend Secure ICE Credentials Endpoint
            </span>
            <span className="text-blue-700/80 text-[11px]">
              Fetched dynamically via <code>/api/ice-servers</code>. Secret API keys are never exposed in client code.
            </span>
          </div>
          <a
            href="/api/ice-servers"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors shrink-0"
          >
            Inspect ICE Config
          </a>
        </div>
      </div>

      {/* DATABASE / BACKEND CONNECTION SETTINGS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Supabase Backend Connection
          </h2>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isSupabaseConfigured
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            {isSupabaseConfigured ? 'Connected' : 'Credentials Needed'}
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Specify your Supabase PostgreSQL and Realtime credentials.
        </p>

        <form onSubmit={handleSaveDb} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project URL
            </label>
            <input
              type="url"
              required
              value={dbUrl}
              onChange={(e) => setDbUrl(e.target.value)}
              placeholder="https://xyz.supabase.co"
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Anon / Public Key
            </label>
            <input
              type="text"
              required
              value={dbKey}
              onChange={(e) => setDbKey(e.target.value)}
              placeholder="eyJhbGciOiJIUz..."
              className="w-full px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
            >
              Save Credentials & Reload
            </button>
            <button
              type="button"
              onClick={clearSupabaseConfig}
              className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* SECURITY / PASSWORD UPDATE */}
      {user && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Lock className="w-5 h-5 text-slate-700" />
            Change Password
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Ensure your account uses a secure password of at least 8 characters.
          </p>

          {passwordError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Password successfully updated!</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="max-w-md space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
