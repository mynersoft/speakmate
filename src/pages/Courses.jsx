import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Star, 
  Clock, 
  Users, 
  Sparkles, 
  CheckCircle, 
  GraduationCap,
  Filter
} from 'lucide-react';
import { courseService } from '../services/courseService';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');
  const [priceType, setPriceType] = useState('all');
  const [search, setSearch] = useState('');

  const categories = [
    'all',
    'Spoken English',
    'IELTS Preparation',
    'Business English',
    'Grammar & Vocabulary'
  ];

  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const data = await courseService.getCourses({ category, level, priceType, search });
        setCourses(data);
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [category, level, priceType, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-12 overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5" />
            Learn at Your Pace
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            English Course Marketplace
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Master natural conversation, IELTS Band 8+, and executive communication with structured curriculum from verified English mentors.
          </p>
        </div>

        {/* Decorative blur rings */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search topics, accent mastery, IELTS, or mentors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Price Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPriceType('all')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                priceType === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Prices
            </button>
            <button
              onClick={() => setPriceType('free')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                priceType === 'free' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Free Only
            </button>
            <button
              onClick={() => setPriceType('paid')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                priceType === 'paid' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Premium
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 bg-slate-200/60 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No courses match your filter</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or price filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-300 transition-all flex flex-col"
            >
              {/* Thumbnail */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-slate-900/80 text-white backdrop-blur-md">
                    {course.category}
                  </span>
                  {course.is_free && (
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-emerald-600 text-white">
                      FREE
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{course.rating}</span>
                    <span className="text-slate-400 font-normal">({course.review_count} reviews)</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                {/* Footer Info */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {course.mentor_avatar ? (
                      <img
                        src={course.mentor_avatar}
                        alt={course.mentor_name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                        {course.mentor_name.charAt(0)}
                      </div>
                    )}
                    <span className="text-xs font-medium text-slate-600 truncate max-w-[120px]">
                      {course.mentor_name}
                    </span>
                  </div>

                  <div className="text-right">
                    {course.is_free ? (
                      <span className="text-sm font-extrabold text-emerald-600">FREE</span>
                    ) : (
                      <span className="text-sm font-extrabold text-slate-900">৳{course.price_bdt} BDT</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
