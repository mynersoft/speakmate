import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  DollarSign, 
  Users, 
  BookOpen, 
  Video, 
  Check, 
  X, 
  Settings, 
  TrendingUp, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [mentorApps, setMentorApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commissionInput, setCommissionInput] = useState(20);
  const [freeMinsInput, setFreeMinsInput] = useState(15);
  const [savedSettings, setSavedSettings] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [overview, apps] = await Promise.all([
        adminService.getOverviewStats(),
        adminService.getMentorApplications(),
      ]);

      if (overview?.stats) {
        setStats(overview.stats);
        setCommissionInput(overview.config?.commissionRatePercent || 20);
        setFreeMinsInput(overview.config?.freeDailyPracticeMinutes || 15);
      }
      setMentorApps(apps);
    } catch (err) {
      console.error('Error loading admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleReviewApplication = async (userId, decision) => {
    await adminService.reviewMentorApplication(userId, decision, `Reviewed by admin on ${new Date().toLocaleDateString()}`);
    loadAdminData();
    alert(`Mentor application has been ${decision}!`);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    await adminService.updatePlatformSettings({
      commissionRatePercent: Number(commissionInput),
      freeDailyPracticeMinutes: Number(freeMinsInput),
    });
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            SpeakMate Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Platform Operations & Moderation
          </h1>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          Refresh Metrics
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Platform Sales</span>
          <p className="text-2xl font-black text-slate-900">৳{stats?.grossSalesBdt?.toLocaleString() || '48,500'} BDT</p>
          <span className="text-[11px] text-slate-400">Total processed revenue</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform Net Commission</span>
          <p className="text-2xl font-black text-blue-600">৳{stats?.platformNetCommissionBdt?.toLocaleString() || '9,700'} BDT</p>
          <span className="text-[11px] text-blue-600 font-semibold">{commissionInput}% platform cut</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Mentor Payouts</span>
          <p className="text-2xl font-black text-emerald-600">৳{stats?.totalMentorPayoutsBdt?.toLocaleString() || '18,200'} BDT</p>
          <span className="text-[11px] text-slate-400">Dispatched via bKash / Bank</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Mentor Reviews</span>
          <p className="text-2xl font-black text-amber-500">
            {mentorApps.filter((a) => a.status === 'pending').length}
          </p>
          <span className="text-[11px] text-slate-400">Applications awaiting review</span>
        </div>
      </div>

      {/* Grid: Mentor Approvals & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Mentor Applications Review */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Mentor Verification Queue</h3>
              <p className="text-xs text-slate-500">Review teacher credentials and approve or reject access.</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              {mentorApps.length} Total
            </span>
          </div>

          {mentorApps.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 italic">
              No pending mentor applications in the moderation queue.
            </div>
          ) : (
            <div className="space-y-4">
              {mentorApps.map((app) => (
                <div
                  key={app.id || app.user_id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{app.display_name}</h4>
                      <span className="text-xs text-blue-600 font-semibold">{app.english_proficiency}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider self-start sm:self-auto ${
                      app.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : app.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Background:</strong> {app.teaching_experience}
                  </p>

                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{app.introduction}"
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 text-xs">
                    <span className="text-slate-500 font-mono">
                      Phone: {app.phone_or_whatsapp || 'Not provided'}
                    </span>

                    {app.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReviewApplication(app.user_id, 'approved')}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve Mentor
                        </button>
                        <button
                          onClick={() => handleReviewApplication(app.user_id, 'rejected')}
                          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Platform Settings Configuration */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Settings className="w-5 h-5 text-slate-600" />
            <h3 className="font-bold text-base text-slate-900">Platform Settings</h3>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Platform Commission Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={commissionInput}
                onChange={(e) => setCommissionInput(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Current platform commission deducted from mentor sales.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Free Daily Practice Limit (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={freeMinsInput}
                onChange={(e) => setFreeMinsInput(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Daily free speaking time before upgrade is required.
              </span>
            </div>

            {savedSettings && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                Settings saved successfully!
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              Update Platform Rules
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
