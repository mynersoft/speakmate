import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, PhoneOff, Video, Globe, Award, Sparkles } from 'lucide-react';
import { callService } from '../services/callService';
import { useAuth } from '../context/AuthContext';

export default function IncomingCall() {
  const { incomingCall, dismissIncomingCall, user } = useAuth();
  const navigate = useNavigate();
  const [secondsRemaining, setSecondsRemaining] = useState(15);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (!incomingCall) return;

    setSecondsRemaining(15);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleReject('timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [incomingCall]);

  if (!incomingCall) return null;

  const caller = incomingCall.caller || {};

  const handleAccept = async () => {
    if (!user || isAccepting) return;
    setIsAccepting(true);
    try {
      await callService.acceptCall(incomingCall.id, user.id);
      dismissIncomingCall();
      navigate(`/call/${incomingCall.id}`);
    } catch (err) {
      console.error('Failed to accept call:', err);
      setIsAccepting(false);
      dismissIncomingCall();
    }
  };

  const handleReject = async (reason = 'rejected') => {
    if (!user) return;
    try {
      await callService.rejectOrTimeoutCall(incomingCall.id, user.id, reason);
    } catch (err) {
      console.warn('Reject error:', err);
    } finally {
      dismissIncomingCall();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-blue-100 text-center overflow-hidden">
        {/* Pulsing ringing background ring */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-blue-100 rounded-full opacity-60 animate-ping pointer-events-none"></div>

        <div className="relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            Incoming English Practice Call ({secondsRemaining}s)
          </div>

          {/* Caller Avatar */}
          <div className="relative mx-auto w-24 h-24 mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-3xl flex items-center justify-center shadow-lg shadow-blue-500/30 border-4 border-white">
              {caller.avatar_url ? (
                <img 
                  src={caller.avatar_url} 
                  alt={caller.display_name} 
                  className="w-full h-full rounded-full object-cover" 
                />
              ) : (
                caller.display_name?.charAt(0).toUpperCase() || 'P'
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-sm">
              <Video className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Caller Details */}
          <h3 className="text-xl font-bold text-slate-900 mb-1">
            {caller.display_name || 'Approved Member'}
          </h3>

          <div className="flex items-center justify-center gap-3 text-xs text-slate-600 mb-6">
            <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md">
              <Globe className="w-3 h-3 text-slate-500" />
              {caller.country || 'Global'}
            </span>
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 font-medium px-2.5 py-1 rounded-md">
              <Award className="w-3 h-3 text-blue-600" />
              {caller.english_level || 'Intermediate'}
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-8 max-w-xs mx-auto">
            Ready to speak English? Pick up now to start a 1-on-1 audio/video conversation.
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleReject('rejected')}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-semibold text-sm transition-colors border border-slate-200"
            >
              <PhoneOff className="w-4 h-4 text-rose-500" />
              Decline
            </button>

            <button
              onClick={handleAccept}
              disabled={isAccepting}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-600/30 active:scale-95 disabled:opacity-50"
            >
              <Phone className="w-4 h-4" />
              {isAccepting ? 'Connecting...' : 'Accept Call'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
