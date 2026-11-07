import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Sparkles, ArrowLeft, Mic } from 'lucide-react';
import ActiveMembersList from '../components/ActiveMembersList';

export default function Members() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Active Community Members
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse all verified English learners online. Select any member to ring them directly for 1-on-1 practice.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/matching"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            Quick Random Match
          </Link>
        </div>
      </div>

      {/* Main Active Members Component */}
      <ActiveMembersList />
    </div>
  );
}
