import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Award, 
  Clock, 
  Video, 
  Zap, 
  Trophy, 
  Calendar, 
  CheckCircle2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { learningToolsService } from '../services/learningToolsService';
import { subscriptionService } from '../services/subscriptionService';
import { useAuth } from '../context/AuthContext';

export default function Progress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [allowance, setAllowance] = useState(null);

  useEffect(() => {
    if (user) {
      const data = learningToolsService.getProgress(user.id);
      setProgress(data);

      subscriptionService.checkPracticeAllowance(user.id).then(setAllowance);
    }
  }, [user]);

  const allBadges = [
    { name: 'First Conversation', desc: 'Completed your first 1-on-1 speaking call', icon: '🎉', earned: true },
    { name: 'Fluency Explorer', desc: 'Practiced English with members from 3+ countries', icon: '🌍', earned: true },
    { name: '3-Day Streak', desc: 'Maintained 3 consecutive days of speaking', icon: '🔥', earned: true },
    { name: 'Quiz Champion', desc: 'Scored 100% on the Daily Fluency Challenge', icon: '🧠', earned: progress?.badges?.includes('Quiz Champion') },
    { name: '100 Minutes Master', desc: 'Clocked over 100 minutes of active speaking', icon: '⏱️', earned: (progress?.practiceMinutesTotal || 0) >= 100 },
    { name: 'Workshop Graduate', desc: 'Attended a live mentor classroom workshop', icon: '🎓', earned: true },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Your Fluency Journey & Progress
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Track your speaking minutes, maintain your daily practice streak, and unlock fluency achievements.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Streak */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 rounded-3xl shadow-lg space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-100">Practice Streak</span>
            <Flame className="w-5 h-5 fill-amber-200 text-amber-200" />
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-black">{progress?.currentStreakDays || 4} Days</span>
            <span className="text-xs text-amber-100 block mt-1">Keep it up tomorrow!</span>
          </div>
        </div>

        {/* Practice Minutes */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Speaking</span>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-black text-slate-900">{progress?.practiceMinutesTotal || 45} mins</span>
            <span className="text-xs text-slate-500 block mt-1">Across {progress?.sessionsCount || 3} practice calls</span>
          </div>
        </div>

        {/* Total XP */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Fluency XP</span>
            <Zap className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-black text-slate-900">{progress?.xpPoints || 320} XP</span>
            <span className="text-xs text-emerald-600 font-bold block mt-1">Level: Intermediate</span>
          </div>
        </div>

        {/* Today's Allowance */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Allowance</span>
            <Trophy className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {allowance?.isUnlimited ? 'Unlimited' : `${allowance?.remainingMinutes || 15}m left`}
            </span>
            <span className="text-xs text-slate-500 block mt-1">
              {allowance?.isUnlimited ? 'Premium Subscriber' : 'Free tier (15m daily)'}
            </span>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Fluency Badges & Achievements</h3>
            <p className="text-xs text-slate-500">Milestones unlocked through active speaking and learning.</p>
          </div>
          <span className="text-xs font-bold text-blue-600">
            {allBadges.filter((b) => b.earned).length} / {allBadges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allBadges.map((badge, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border flex items-center gap-3.5 transition-all ${
                badge.earned
                  ? 'bg-blue-50/50 border-blue-200 shadow-sm'
                  : 'bg-slate-50/60 border-slate-200 opacity-60'
              }`}
            >
              <div className="text-2xl p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
                {badge.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs text-slate-900">{badge.name}</h4>
                  {badge.earned && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
