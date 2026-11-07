import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Globe, 
  Award, 
  Sparkles, 
  PhoneCall, 
  Search, 
  RefreshCw, 
  CheckCircle2,
  Clock,
  Calendar,
  Plus,
  Edit3,
  X,
  Check,
  CalendarCheck2
} from 'lucide-react';
import { presenceService } from '../services/presenceService';
import { profileService } from '../services/profileService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const QUICK_TIME_PRESETS = [
  'Active Now (Next 1 hour)',
  'Today 6:00 PM – 8:00 PM',
  'Today 8:00 PM – 10:00 PM',
  'Tomorrow 6:00 PM – 8:00 PM',
  'Daily 7:00 PM – 8:30 PM',
  'Weekends 10:00 AM – 12:00 PM',
];

export default function ActiveMembersList({ onSelectMember }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'online' | 'scheduled'

  // Custom Practice Time state
  const [myPracticeTime, setMyPracticeTime] = useState('');
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [customDay, setCustomDay] = useState('Today');
  const [customStart, setCustomStart] = useState('18:00');
  const [customEnd, setCustomEnd] = useState('20:00');
  const [customNote, setCustomNote] = useState('');
  const [savingTime, setSavingTime] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Detect user local timezone code
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';

  // Load active members and user's saved practice time
  const loadMembersAndSchedule = useCallback(async () => {
    setLoading(true);
    try {
      if (user?.id) {
        const savedTime = profileService.getPracticeTime(user.id);
        if (savedTime) setMyPracticeTime(savedTime);
      }

      const list = await presenceService.getActiveMembers(user?.id);
      setMembers(list);

      // If user has a saved time in profile, sync it
      if (user?.id) {
        const me = list.find((m) => m.user_id === user.id);
        if (me?.practice_time) {
          setMyPracticeTime(me.practice_time);
        }
      }
    } catch (err) {
      console.warn('Error loading real active members:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadMembersAndSchedule();
    const interval = setInterval(loadMembersAndSchedule, 20000);
    return () => clearInterval(interval);
  }, [loadMembersAndSchedule]);

  // Save custom practice time
  const handleSavePracticeTime = async (timeString) => {
    if (!user?.id) return;
    setSavingTime(true);
    try {
      await profileService.updatePracticeTime(user.id, timeString);
      setMyPracticeTime(timeString);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      setIsTimeModalOpen(false);
      // Refresh list to update own schedule
      await loadMembersAndSchedule();
    } catch (err) {
      console.error('Error saving practice schedule:', err);
    } finally {
      setSavingTime(false);
    }
  };

  const handleCustomFormSubmit = (e) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;

    // Convert 24h to 12h readable time
    const formatTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      return `${formattedHours}:${formattedMinutes} ${ampm}`;
    };

    const formattedRange = `${customDay} ${formatTime(customStart)} – ${formatTime(customEnd)}`;
    const fullSchedule = customNote.trim() 
      ? `${formattedRange} (${customNote.trim()})`
      : formattedRange;

    handleSavePracticeTime(fullSchedule);
  };

  const handleClearPracticeTime = async () => {
    if (!user?.id) return;
    await profileService.updatePracticeTime(user.id, '');
    setMyPracticeTime('');
    await loadMembersAndSchedule();
  };

  // Filter members (real users only, excluding current user from callable cards)
  const otherMembers = members.filter((m) => {
    if (user && m.user_id === user.id) return false;
    return true;
  });

  const filteredMembers = otherMembers.filter((m) => {
    // Tab filter
    if (activeTab === 'online' && !m.is_online) return false;
    if (activeTab === 'scheduled' && !m.practice_time) return false;

    // English Level filter
    const matchesLevel = selectedLevel === 'All' || m.english_level === selectedLevel;

    // Search query filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      m.display_name?.toLowerCase().includes(searchLower) ||
      m.country?.toLowerCase().includes(searchLower) ||
      m.bio?.toLowerCase().includes(searchLower) ||
      m.practice_time?.toLowerCase().includes(searchLower);

    return matchesLevel && matchesSearch;
  });

  const onlineCount = otherMembers.filter((m) => m.is_online).length;
  const scheduledCount = otherMembers.filter((m) => Boolean(m.practice_time)).length;

  const handleStartCallWith = (member) => {
    if (onSelectMember) {
      onSelectMember(member);
    } else {
      navigate('/matching', { state: { preferredPartner: member } });
    }
  };

  return (
    <div className="space-y-6">

      {/* USER PRACTICE SCHEDULE BANNER CARD */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden border border-blue-800/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-300 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
              <CalendarCheck2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Your Practice Schedule • Visible to Community</span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold">
              {myPracticeTime ? (
                <span className="flex items-center gap-2 flex-wrap">
                  Active for Practice: 
                  <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-0.5 rounded-xl text-base font-extrabold">
                    {myPracticeTime}
                  </span>
                </span>
              ) : (
                'When are you active for English practice?'
              )}
            </h3>

            <p className="text-xs text-blue-200/80 max-w-xl leading-relaxed">
              {myPracticeTime ? (
                `Other members see your active hours (${userTimezone} timezone) and can connect with you right when you are ready to speak.`
              ) : (
                'Add your active hours so other learners know when you will be online for conversation practice.'
              )}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            {myPracticeTime ? (
              <>
                <button
                  onClick={() => setIsTimeModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Change Time
                </button>
                <button
                  onClick={handleClearPracticeTime}
                  className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white font-medium text-xs transition-colors"
                  title="Remove practice time"
                >
                  Clear
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsTimeModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Set My Practice Time
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ACTIVE MEMBERS SECTION CARD */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Community Members
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {onlineCount} Online Now
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Real community members practicing English. Check their active practice hours and connect 1-on-1.
            </p>
          </div>

          <button
            onClick={loadMembersAndSchedule}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shrink-0"
            title="Refresh members"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Tab Filters: All, Online Now, Scheduled */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              All Members ({otherMembers.length})
            </button>
            <button
              onClick={() => setActiveTab('online')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'online'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Online Now ({onlineCount})
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'scheduled'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Scheduled Time ({scheduledCount})
            </button>
          </div>

          {/* English Level Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Beginner', 'Intermediate', 'Advanced', 'Fluent'].map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors shrink-0 ${
                  selectedLevel === level
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, country, or practice hours (e.g. 'Today', '6:00 PM', 'Daily')..."
            className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        {/* Real Members Cards Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMembers.length === 0 ? (
            <div className="col-span-full py-12 px-4 rounded-2xl bg-slate-50/80 border border-dashed border-slate-200 text-center">
              <Users className="w-10 h-10 mx-auto mb-2 text-slate-400 opacity-70" />
              <h4 className="text-sm font-bold text-slate-800">
                {activeTab === 'online' 
                  ? 'No other members online right this second' 
                  : otherMembers.length === 0
                  ? 'You are the first member active today!'
                  : 'No members match your search or filter'}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                {myPracticeTime ? (
                  `Your practice time is set to "${myPracticeTime}". Other learners who sign in will see your scheduled hours and connect with you!`
                ) : (
                  'Click "Set My Practice Time" above so other English learners know when you will be online for conversation!'
                )}
              </p>

              <div className="mt-5 flex items-center justify-center gap-3">
                {!myPracticeTime && (
                  <button
                    onClick={() => setIsTimeModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
                  >
                    + Add My Active Hours
                  </button>
                )}
                <button
                  onClick={() => {
                    setActiveTab('all');
                    setSelectedLevel('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium text-xs hover:bg-white transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          ) : (
            filteredMembers.map((member) => (
              <div
                key={member.user_id}
                className="p-5 rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between bg-white group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
                          {member.avatar_url ? (
                            <img
                              src={member.avatar_url}
                              alt={member.display_name}
                              className="w-full h-full rounded-2xl object-cover"
                            />
                          ) : (
                            member.display_name?.charAt(0).toUpperCase() || 'M'
                          )}
                        </div>
                        {/* Status indicator badge */}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                            member.is_online
                              ? 'bg-emerald-500 animate-pulse'
                              : 'bg-slate-300'
                          }`}
                          title={member.is_online ? 'Online now' : 'Currently offline'}
                        />
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {member.display_name}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3 text-slate-400" />
                            {member.country}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            <Award className="w-3 h-3" />
                            {member.english_level}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {member.is_online ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Online
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          Offline
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ACTIVE PRACTICE TIME DISPLAY */}
                  {member.practice_time ? (
                    <div className="mb-3.5 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/70 text-blue-900 flex items-center gap-2 text-xs">
                      <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 block">
                          Practice Hours
                        </span>
                        <span className="font-semibold text-xs text-blue-950">
                          {member.practice_time}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3.5 p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 flex items-center gap-1.5 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Availability: Flexible online practice</span>
                    </div>
                  )}

                  {member.bio && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 mb-4">
                      "{member.bio}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Real Learner
                  </span>

                  <button
                    onClick={() => handleStartCallWith(member)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      member.is_online
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-95'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    {member.is_online ? 'Practice Call' : 'Ring Partner'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* CUSTOM PRACTICE TIME MODAL */}
      {isTimeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Set When You'll Be Active
                  </h3>
                  <p className="text-xs text-slate-500">
                    Visible to other members so they know when to practice with you
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsTimeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick 1-Click Presets */}
            <div className="mt-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Quick 1-Click Presets:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUICK_TIME_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSavePracticeTime(preset)}
                    disabled={savingTime}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left text-xs font-semibold text-slate-700 transition-all flex items-center justify-between group"
                  >
                    <span>{preset}</span>
                    <Check className="w-3.5 h-3.5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400 font-medium">Or custom schedule</span>
              </div>
            </div>

            {/* Custom Time Form */}
            <form onSubmit={handleCustomFormSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Day / Period
                  </label>
                  <select
                    value={customDay}
                    onChange={(e) => setCustomDay(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
                  >
                    <option value="Today">Today</option>
                    <option value="Tonight">Tonight</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Weekends">Weekends</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Optional Topic / Note (e.g. IELTS, Job Interview, Casual Chat)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Practicing conversational fluency & travel topics"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Timezone: <strong>{userTimezone}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTimeModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingTime}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    {savingTime ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    Save Schedule
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
