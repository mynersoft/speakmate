import React from 'react';
import { Video } from 'lucide-react';

export default function LoadingScreen({ message = 'Loading SpeakMate...' }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 animate-pulse">
          <Video className="w-8 h-8" />
        </div>
        <div className="absolute -inset-2 rounded-3xl border-2 border-blue-400/40 animate-ping"></div>
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1">SpeakMate</h3>
      <p className="text-xs font-medium text-slate-500">{message}</p>
    </div>
  );
}
