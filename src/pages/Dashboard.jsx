import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Video, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  Mic, 
  Lightbulb,
  Globe,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePresence } from '../hooks/usePresence';

const PRACTICE_TOPICS = [
  {
    category: 'Travel & Cultures',
    prompt: 'What was your most memorable trip, and what local custom surprised you?',
  },
  {
    category: 'Work & Ambitions',
    prompt: 'What career skills are you developing this year, and why is English important for your goals?',
  },
  {
    category: 'Daily Life & Routines',
    prompt: 'Describe your favorite morning routine or a weekend hobby you could spend all day on.',
  },
];

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { stats } = usePresence();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* WELCOME BANNER & START PRACTICING HERO */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 rounded-l-full pointer-events-none" />

        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-100 text-xs font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            English Speaking Lounge • Ready to Match
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Hello, {profile?.display_name || user?.email?.split('@')[0]}!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100 leading-relaxed">
            Ready to enhance your English conversational skills? Connect 1-on-1 with another language learner right now with zero barriers.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/matching"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-700 font-bold text-sm shadow-md hover:bg-blue-50 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-5 h-5 text-blue-600" />
              Start Practicing Now
            </Link>

            <Link
              to="/settings"
              className="inline-flex items-center gap-2 px-5 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-sm transition-colors"
            >
              <Mic className="w-4 h-4" />
              Test Camera & Mic
            </Link>
          </div>
        </div>
      </div>

      {/* STATS & COMMUNITY OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">
              {stats.onlineCount || 1}
            </span>
            <p className="text-xs font-medium text-slate-500">Learners Online Now</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">
              {stats.availableCount || 1}
            </span>
            <p className="text-xs font-medium text-slate-500">Ready For Practice</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">
              {stats.inCallCount || 0}
            </span>
            <p className="text-xs font-medium text-slate-500">Active Conversations</p>
          </div>
        </div>
      </div>

      {/* USER PROFILE SUMMARY CARD */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
              {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {profile?.display_name || user?.email?.split('@')[0]}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Active Member
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  {profile?.country || 'Global'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-blue-600 font-medium">
                  <Award className="w-3.5 h-3.5" />
                  {profile?.english_level || 'Intermediate'}
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/profile"
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
          >
            Edit Profile
          </Link>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            You are fully configured and ready for unlimited 1-on-1 conversations. Direct P2P & Metered Open Relay TURN are active.
          </p>
          <Link
            to="/matching"
            className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-700 shrink-0"
          >
            Launch Practice Lounge <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* CONVERSATION TOPIC PROMPTS FOR PRACTICE */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-bold text-slate-900">
            Suggested Conversation Prompts
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Use these conversation starters with your practice partner to build fluency and confidence.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRACTICE_TOPICS.map((item, index) => (
            <div key={index} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full mb-2">
                  {item.category}
                </span>
                <p className="text-xs font-medium text-slate-700 leading-relaxed">
                  "{item.prompt}"
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Discussion topic</span>
                <Link to="/matching" className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1">
                  Practice <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
