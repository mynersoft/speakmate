import React from 'react';
import { 
  Loader2, 
  PhoneCall, 
  Users, 
  RotateCw, 
  SkipForward, 
  XCircle, 
  AlertCircle,
  Clock,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { MATCH_STATES } from '../hooks/useMatching';
import PartnerCard from './PartnerCard';

export default function MatchingStatus({
  matchState,
  currentPartner,
  countdown,
  errorMessage,
  attemptCount,
  onSkip,
  onStop,
  onRetry,
  onReturnDashboard,
}) {
  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-lg shadow-slate-100 text-center transition-all">
      
      {/* 1. SEARCHING STATE */}
      {matchState === MATCH_STATES.SEARCHING && (
        <div className="py-8">
          <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-ping opacity-75"></div>
            <div className="absolute inset-2 rounded-full border-2 border-dashed border-blue-400 animate-spin"></div>
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Users className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Searching for Available Partner...
          </h3>
          <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto">
            Looking through verified, approved community members online right now for English practice.
          </p>

          <button
            onClick={onStop}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <XCircle className="w-4 h-4 text-slate-500" />
            Stop Matching
          </button>
        </div>
      )}

      {/* 2. RINGING / REQUESTING STATE (15-second auto timeout) */}
      {(matchState === MATCH_STATES.RINGING || matchState === MATCH_STATES.REQUESTING) && (
        <div className="py-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-6">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Automatic timeout in {countdown}s
          </div>

          {currentPartner && (
            <div className="mb-6 text-left">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Candidate Matched
              </p>
              <PartnerCard partner={currentPartner} />
            </div>
          )}

          <div className="relative mx-auto w-16 h-16 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-70"></div>
            <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-md shadow-emerald-500/30">
              <PhoneCall className="w-5 h-5 animate-bounce" />
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Calling {currentPartner?.display_name || 'Partner'}...
          </h3>
          <p className="text-xs text-slate-500 mb-8">
            Waiting for them to pick up. If they don't answer within 15 seconds, SpeakMate will automatically try the next available member.
          </p>

          {/* Action buttons: Skip / Next Partner & Stop */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onSkip}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <SkipForward className="w-4 h-4" />
              Next Partner
            </button>

            <button
              onClick={onStop}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              <XCircle className="w-4 h-4 text-slate-500" />
              Cancel Call
            </button>
          </div>
        </div>
      )}

      {/* 3. MISSED / REJECTED / SKIPPED AUTO-RETRY STATE */}
      {(matchState === MATCH_STATES.MISSED || 
        matchState === MATCH_STATES.REJECTED || 
        matchState === MATCH_STATES.SKIPPED) && (
        <div className="py-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <RotateCw className="w-7 h-7 animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {matchState === MATCH_STATES.MISSED && 'Partner Timed Out'}
            {matchState === MATCH_STATES.REJECTED && 'Partner is Busy'}
            {matchState === MATCH_STATES.SKIPPED && 'Skipping to Next Partner...'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {matchState === MATCH_STATES.MISSED && 'No response received in 15 seconds. Automatically looking for your next English practice partner...'}
            {matchState === MATCH_STATES.REJECTED && 'Your partner was unavailable. Finding another approved learner...'}
            {matchState === MATCH_STATES.SKIPPED && 'Finding another verified speaker for you...'}
          </p>
        </div>
      )}

      {/* 4. NO AVAILABLE PARTNERS */}
      {matchState === MATCH_STATES.NO_PARTNER && (
        <div className="py-6">
          <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            No Available Partners Right Now
          </h3>
          <p className="text-sm text-slate-600 mb-6 max-w-sm mx-auto">
            All approved members are currently in calls or offline. Please wait a moment or try again.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onRetry}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all"
            >
              <RotateCw className="w-4 h-4" />
              Try Again
            </button>

            <button
              onClick={onStop}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              <XCircle className="w-4 h-4 text-slate-500" />
              Stop Matching
            </button>

            <button
              onClick={onReturnDashboard}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
          </div>
        </div>
      )}

      {/* 5. FAILED / ERROR STATE */}
      {matchState === MATCH_STATES.FAILED && (
        <div className="py-6">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Matching Interrupted
          </h3>
          <p className="text-xs text-rose-600 mb-6 max-w-sm mx-auto font-medium">
            {errorMessage || 'Something went wrong while connecting with the matching engine.'}
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm"
            >
              <RotateCw className="w-4 h-4" />
              Retry
            </button>
            <button
              onClick={onReturnDashboard}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
