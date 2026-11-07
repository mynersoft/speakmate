import React, { useState, useEffect } from 'react';
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
  Award,
  Clock,
  BookOpen,
  DollarSign,
  Crown,
  Zap,
  Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePresence } from '../hooks/usePresence';
import { subscriptionService } from '../services/subscriptionService';
import { learningToolsService } from '../services/learningToolsService';
import ActiveMembersList from '../components/ActiveMembersList';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { stats } = usePresence();

  const [subscription, setSubscription] = useState(null);
  const [allowance, setAllowance] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (user) {
      subscriptionService.getUserSubscription(user.id).then(setSubscription);
      subscriptionService.checkPracticeAllowance(user.id).then(setAllowance);
      const prog = learningToolsService.getProgress(user.id);
      setProgress(prog);
    }
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Top Banner: Member Welcome & Status */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              English Speaking Lounge • Ready to Match
            </span>

            {subscription?.isPremium ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-bold shadow-md">
                <Crown className="w-3.5 h-3.5 fill-slate-950" />
                Premium Member • Unlimited Practice
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 text-xs font-semibold">
                Free Member • {allowance?.remainingMinutes || 15}m practice remaining today
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Hello, {profile?.display_name || user?.email?.split('@')[0]}!
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Practice conversational English 1-on-1 with community peers, join mentor live classes, and explore certified courses.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/matching"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              Start Practice Call
            </Link>

            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-sm transition-colors"
            >
              <BookOpen className="w-4 h-4 text-indigo-300" />
              Explore Courses
            </Link>

            {!subscription?.isPremium && (
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors shadow-sm"
              >
                <Crown className="w-4 h-4" />
                Upgrade to Unlimited
              </Link>
            )}
          </div>
        </div>

        {/* Decorative blur */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>
      </div>

      {/* THE THREE PLATFORM PILLARS (PRACTICE, LEARN, EARN) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* PILLAR 1: PRACTICE */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Pillar 1</span>
              <h3 className="text-lg font-bold text-slate-900">PRACTICE</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time video & audio conversation matching. Skip partners, reconnect, and conquer speaking anxiety.
            </p>
          </div>
          <Link
            to="/matching"
            className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            Launch Speaking Lounge <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* PILLAR 2: LEARN */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-all">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Pillar 2</span>
              <h3 className="text-lg font-bold text-slate-900">LEARN</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Curated course library, live group workshops, daily speaking topics, pronunciation bank, and daily quizzes.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/courses"
              className="flex-1 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs text-center transition-colors"
            >
              Courses
            </Link>
            <Link
              to="/classes"
              className="flex-1 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs text-center transition-colors"
            >
              Live Classes
            </Link>
          </div>
        </div>

        {/* PILLAR 3: EARN */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Pillar 3</span>
              <h3 className="text-lg font-bold text-slate-900">EARN</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Approved mentors teach live classes, sell custom courses, and receive direct payouts via bKash, Nagad & Bank.
            </p>
          </div>
          <Link
            to="/mentor/dashboard"
            className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            Mentor Studio & Payouts <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900">{stats.onlineCount || 1}</span>
            <p className="text-[11px] font-medium text-slate-500">Learners Online</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900">{stats.availableCount || 1}</span>
            <p className="text-[11px] font-medium text-slate-500">Ready to Match</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900">{progress?.currentStreakDays || 4} Days</span>
            <p className="text-[11px] font-medium text-slate-500">Practice Streak</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900">{progress?.xpPoints || 320} XP</span>
            <p className="text-[11px] font-medium text-slate-500">Fluency Score</p>
          </div>
        </div>
      </div>

      {/* ACTIVE MEMBERS SECTION */}
      <div id="active-members" className="scroll-mt-20">
        <ActiveMembersList />
      </div>

    </div>
  );
}
