import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, PlayCircle, Award, ArrowRight } from 'lucide-react';
import { courseService } from '../services/courseService';
import { useAuth } from '../context/AuthContext';

export default function MyCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const enrolled = await courseService.getMyCourses(user.id);
        setCourses(enrolled);
      } catch (err) {
        console.error('Error fetching student courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Enrolled Courses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pick up right where you left off and earn your verifiable speaking certificates.
          </p>
        </div>

        <Link
          to="/courses"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <BookOpen className="w-4 h-4" />
          Explore More Courses
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((n) => (
            <div key={n} className="h-64 bg-slate-200/60 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Courses Enrolled Yet</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Browse our curated English course marketplace. Enroll in free foundation classes or join mentor-led masterclasses to boost your fluency.
          </p>
          <div className="pt-2">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
            >
              Browse Courses
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={c.thumbnail_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600'}
                    alt={c.course_title}
                    className="w-full h-full object-cover"
                  />
                  {c.is_completed && (
                    <div className="absolute top-3 right-3 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Award className="w-3.5 h-3.5" />
                      Completed
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-2">
                    {c.course_title}
                  </h3>
                  <p className="text-xs text-slate-500">Taught by {c.mentor_name}</p>

                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-bold text-blue-600">{c.progress_percentage || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${c.progress_percentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  to={`/learn/courses/${c.course_id}`}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <PlayCircle className="w-4 h-4" />
                  {c.progress_percentage > 0 ? 'Resume Course' : 'Start Course'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
