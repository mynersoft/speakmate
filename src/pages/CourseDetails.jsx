import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  CheckCircle2, 
  PlayCircle, 
  Lock, 
  ShieldCheck, 
  GraduationCap, 
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';
import { courseService } from '../services/courseService';
import { useAuth } from '../context/AuthContext';
import CheckoutModal from '../components/CheckoutModal';

export default function CourseDetails() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const data = await courseService.getCourseById(courseId);
        setCourse(data);
        if (user && data) {
          const enrolled = await courseService.isUserEnrolled(user.id, data.id);
          setIsEnrolled(enrolled);
        }
      } catch (err) {
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, user]);

  const handleEnrollClick = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (course.is_free) {
      try {
        await courseService.enrollInCourse(user.id, course.id);
        setIsEnrolled(true);
        navigate(`/learn/courses/${course.id}`);
      } catch (err) {
        alert(err.message || 'Enrollment failed.');
      }
    } else {
      setShowCheckout(true);
    }
  };

  const handlePaymentSuccess = async (receipt) => {
    setShowCheckout(false);
    if (user && course) {
      await courseService.enrollInCourse(user.id, course.id, receipt.transactionId);
      setIsEnrolled(true);
      navigate(`/learn/courses/${course.id}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 mt-3">Loading curriculum details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Course Not Found</h2>
        <Link to="/courses" className="text-blue-600 font-semibold text-sm hover:underline">
          Browse All Available Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Top Breadcrumb & Hero */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {course.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                  {course.level}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{course.rating}</span>
                  <span className="text-slate-400 font-normal">({course.review_count} ratings)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{course.total_enrolled} students enrolled</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{course.duration_hours} hours total video</span>
                </div>
              </div>

              {/* Mentor Byline */}
              <div className="flex items-center gap-3 pt-4">
                <img
                  src={course.mentor_avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120'}
                  alt={course.mentor_name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-slate-700"
                />
                <div>
                  <span className="text-xs text-slate-400 block">Created by</span>
                  <span className="text-sm font-bold text-white hover:text-blue-400 cursor-pointer">
                    {course.mentor_name}
                  </span>
                </div>
              </div>
            </div>

            {/* Sticky Pricing / Enrollment Card */}
            <div className="bg-white rounded-2xl p-6 text-slate-900 border border-slate-200 shadow-xl space-y-5">
              <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-100">
                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 text-blue-600 flex items-center justify-center shadow-lg">
                    <PlayCircle className="w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">Admission Fee</span>
                <span className="text-2xl font-black text-slate-900">
                  {course.is_free ? 'FREE' : `৳${course.price_bdt} BDT`}
                </span>
              </div>

              {isEnrolled ? (
                <Link
                  to={`/learn/courses/${course.id}`}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl text-center shadow-md flex items-center justify-center gap-2 transition-colors"
                >
                  <GraduationCap className="w-5 h-5" />
                  Continue Learning
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleEnrollClick}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  {course.is_free ? 'Enroll for Free' : 'Buy Course & Start'}
                </button>
              )}

              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Full lifetime access to course lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified SpeakMate completion certificate</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Direct mentor discussion & assignments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          
          {/* Learning Outcomes */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">What You Will Learn</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(course.learning_outcomes || [
                'Express complex ideas smoothly in English',
                'Master accent reduction and vowel articulation',
                'Avoid mental translation before speaking',
                'Ace tech and business job interviews'
              ]).map((outcome, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{outcome}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum Accordion */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Course Curriculum</h3>
              <span className="text-xs text-slate-500">
                {(course.sections || []).length} Sections • 6 Lessons
              </span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {(course.sections || []).map((sec, secIdx) => (
                <div key={sec.id || secIdx} className="bg-white">
                  <button
                    onClick={() => setActiveSection(activeSection === secIdx ? -1 : secIdx)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left bg-slate-50/70 hover:bg-slate-100 transition-colors"
                  >
                    <span className="font-bold text-sm text-slate-900">{sec.title}</span>
                    {activeSection === secIdx ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </button>

                  {activeSection === secIdx && (
                    <div className="divide-y divide-slate-100 px-5 py-2">
                      {(sec.lessons || []).map((les) => (
                        <div key={les.id} className="py-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <PlayCircle className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-slate-800">{les.title}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400">{les.duration_minutes}m</span>
                            {les.is_preview ? (
                              <span className="px-2 py-0.5 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded">
                                Preview
                              </span>
                            ) : !isEnrolled ? (
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-slate-900">Certificate of Completion</h4>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-3">
              <Award className="w-8 h-8 text-blue-600 shrink-0" />
              <p className="text-xs text-blue-900 leading-snug">
                Receive an official, shareable SpeakMate completion certificate upon finishing 100% of the lessons and quiz.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          item={{
            id: course.id,
            title: course.title,
            price_bdt: course.price_bdt,
            purpose: 'course',
            mentorId: course.mentor_id,
          }}
          user={user}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
