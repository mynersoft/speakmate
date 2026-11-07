import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Star, 
  CheckCircle, 
  GraduationCap, 
  Sparkles, 
  Award, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { mentorService } from '../services/mentorService';
import { useAuth } from '../context/AuthContext';

export default function Mentors() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('all');

  const skillsList = [
    'all',
    'Spoken English',
    'American Accent',
    'IELTS Speaking',
    'Grammar Precision',
    'Tech Job Interviews'
  ];

  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);
      try {
        const data = await mentorService.getMentors({ search, skill });
        setMentors(data);
      } catch (err) {
        console.error('Error fetching mentors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [search, skill]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-12 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Verified English Instructors
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Meet SpeakMate Mentors
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Connect with certified CELTA coaches, former IELTS examiners, and corporate communication experts dedicated to your fluency growth.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center space-y-3 shrink-0 max-w-xs">
          <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
          <h4 className="font-bold text-sm text-white">Are You an Experienced English Teacher?</h4>
          <p className="text-xs text-slate-300">
            Teach students, host workshops, sell courses, and earn money with transparent platform commissions.
          </p>
          <Link
            to="/mentor/apply"
            className="inline-block w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            Apply to Become a Mentor
          </Link>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by mentor name, background, or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {skillsList.map((s) => (
            <button
              key={s}
              onClick={() => setSkill(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                skill === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s === 'all' ? 'All Specializations' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Mentors Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-80 bg-slate-200/60 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : mentors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No mentors found</h3>
          <p className="text-xs text-slate-500 mt-1">Try searching for a different skill or topic.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mentors.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div className="p-5 text-center space-y-3">
                <div className="relative inline-block mx-auto">
                  <img
                    src={m.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'}
                    alt={m.display_name}
                    className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-blue-500 shadow-md"
                  />
                  <div className="absolute bottom-0 right-0 p-1 bg-emerald-500 rounded-full text-white" title="Verified Instructor">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-snug">
                    {m.display_name}
                  </h3>
                  <p className="text-xs text-blue-600 font-medium line-clamp-1 mt-0.5">
                    {m.headline}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{m.rating}</span>
                  <span className="text-slate-400 font-normal">({m.review_count})</span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {m.bio}
                </p>

                <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                  {(m.skills || []).slice(0, 3).map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-semibold"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs pt-3">
                  <span className="text-slate-500">Rate:</span>
                  <span className="font-bold text-slate-900">৳{m.hourly_rate_bdt || 600} / hr</span>
                </div>

                <Link
                  to={`/mentors/${m.id}`}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  View Profile & Classes
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
