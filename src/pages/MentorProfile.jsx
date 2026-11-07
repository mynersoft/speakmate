import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Users, 
  Star, 
  Calendar, 
  BookOpen, 
  CheckCircle2, 
  Award, 
  ArrowLeft, 
  MessageSquare,
  ShieldCheck,
  Video
} from 'lucide-react';
import { mentorService } from '../services/mentorService';
import { classService } from '../services/classService';
import { courseService } from '../services/courseService';

export default function MentorProfile() {
  const { mentorId } = useParams();
  const [mentor, setMentor] = useState(null);
  const [mentorClasses, setMentorClasses] = useState([]);
  const [mentorCourses, setMentorCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await mentorService.getMentorById(mentorId);
        setMentor(data);

        // Fetch their classes & courses
        const [classes, courses] = await Promise.all([
          classService.getLiveClasses(),
          courseService.getCourses(),
        ]);

        setMentorClasses(classes.filter((c) => c.mentor_id === mentorId || c.mentor_name === data?.display_name));
        setMentorCourses(courses.filter((c) => c.mentor_id === mentorId || c.mentor_name === data?.display_name));
      } catch (err) {
        console.error('Error fetching mentor:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [mentorId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Mentor Profile Not Found</h2>
        <Link to="/mentors" className="text-blue-600 font-semibold text-xs hover:underline">
          Return to Mentors Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 animate-fade-in">
      
      {/* Mentor Hero Banner */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <Link
            to="/mentors"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </Link>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <img
              src={mentor.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'}
              alt={mentor.display_name}
              className="w-28 h-28 rounded-2xl object-cover border-4 border-slate-800 shadow-xl shrink-0"
            />

            <div className="space-y-3 text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {mentor.display_name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Mentor
                </span>
              </div>

              <p className="text-sm font-medium text-blue-400">
                {mentor.headline}
              </p>

              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {mentor.bio}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400 pt-2">
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{mentor.rating}</span>
                  <span className="text-slate-400 font-normal">({mentor.review_count} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{mentor.total_students} students taught</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>{mentor.teaching_experience}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Mentor Skills & Expertise */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Core Expertise & Skills</h3>
          <div className="flex flex-wrap gap-2">
            {(mentor.skills || []).map((sk, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100"
              >
                {sk}
              </span>
            ))}
          </div>
        </div>

        {/* Live Classes by Mentor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-600" />
              Live Classes by {mentor.display_name}
            </h3>
            <span className="text-xs text-slate-500">{mentorClasses.length} upcoming</span>
          </div>

          {mentorClasses.length === 0 ? (
            <p className="text-xs text-slate-500 italic bg-white p-6 rounded-2xl border border-slate-200">
              No live classes scheduled currently.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mentorClasses.map((cls) => (
                <div key={cls.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                    {cls.topic}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-2">{cls.title}</h4>
                  <div className="text-xs text-slate-500">
                    {new Date(cls.scheduled_at).toLocaleDateString()} at {new Date(cls.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <Link
                    to="/classes"
                    className="block text-center w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    View & Register
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Courses by Mentor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Courses by {mentor.display_name}
            </h3>
            <span className="text-xs text-slate-500">{mentorCourses.length} courses</span>
          </div>

          {mentorCourses.length === 0 ? (
            <p className="text-xs text-slate-500 italic bg-white p-6 rounded-2xl border border-slate-200">
              No published courses by this mentor yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mentorCourses.map((c) => (
                <Link
                  key={c.id}
                  to={`/courses/${c.id}`}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="h-36 bg-slate-100 overflow-hidden">
                    <img src={c.thumbnail_url} alt={c.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-2">{c.title}</h4>
                    <span className="font-extrabold text-blue-600 text-sm">
                      {c.is_free ? 'FREE' : `৳${c.price_bdt} BDT`}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
