import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  PlayCircle, 
  CheckCircle2, 
  ArrowLeft, 
  Award, 
  BookOpen, 
  FileText, 
  Check, 
  HelpCircle,
  Download,
  Share2
} from 'lucide-react';
import { courseService } from '../services/courseService';
import { useAuth } from '../context/AuthContext';

export default function CoursePlayer() {
  const { courseId } = useParams();
  const { user, profile } = useAuth();

  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [certificateId, setCertificateId] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    const loadCourseData = async () => {
      const data = await courseService.getCourseById(courseId);
      if (data) {
        setCourse(data);
        const firstLesson = data.sections?.[0]?.lessons?.[0];
        if (firstLesson) setCurrentLesson(firstLesson);
      }

      if (user) {
        const myCourses = await courseService.getMyCourses(user.id);
        const enrolled = myCourses.find((c) => c.course_id === courseId);
        if (enrolled) {
          setCompletedLessons(enrolled.completed_lessons || []);
          setProgress(enrolled.progress_percentage || 0);
          setIsCompleted(enrolled.is_completed || false);
          setCertificateId(enrolled.certificate_id || '');
        }
      }
    };

    loadCourseData();
  }, [courseId, user]);

  const allLessons = course?.sections?.flatMap((s) => s.lessons) || [];

  const handleMarkLessonComplete = async (lessonId) => {
    if (!user || !course) return;
    const updated = await courseService.updateProgress(user.id, course.id, lessonId, allLessons.length || 5);
    setCompletedLessons(updated.completed_lessons);
    setProgress(updated.progress_percentage);
    setIsCompleted(updated.is_completed);
    if (updated.certificate_id) {
      setCertificateId(updated.certificate_id);
    }
  };

  if (!course) {
    return (
      <div className="p-16 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      
      {/* Top Navbar */}
      <header className="h-14 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between bg-slate-950">
        <div className="flex items-center gap-3">
          <Link
            to={`/courses/${course.id}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col">
            <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">{course.category}</span>
            <span className="text-sm font-bold truncate max-w-sm sm:max-w-md">{course.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-slate-400">Progress:</span>
            <div className="w-28 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-xs font-bold text-emerald-400">{progress}%</span>
          </div>

          {isCompleted && (
            <button
              onClick={() => setShowCertificate(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow-md shadow-amber-500/20"
            >
              <Award className="w-4 h-4" />
              View Certificate
            </button>
          )}
        </div>
      </header>

      {/* Main Player Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
        
        {/* Video Stage & Lesson Notes */}
        <div className="lg:col-span-3 flex flex-col bg-slate-950 overflow-y-auto">
          
          {/* Responsive HTML5 Player */}
          <div className="relative aspect-video bg-black flex items-center justify-center">
            <video
              key={currentLesson?.id}
              controls
              autoPlay={false}
              className="w-full h-full object-contain"
              poster={course.thumbnail_url}
            >
              <source src={currentLesson?.video_url || 'https://www.w3schools.com/html/mov_bbb.mp4'} type="video/mp4" />
              Your browser does not support HTML5 video.
            </video>
          </div>

          {/* Lesson Content Bar */}
          <div className="p-6 space-y-6 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  {currentLesson?.title || 'Interactive Lesson'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Duration: {currentLesson?.duration_minutes || 15} minutes • Taught by {course.mentor_name}
                </p>
              </div>

              {currentLesson && (
                <button
                  onClick={() => handleMarkLessonComplete(currentLesson.id)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                    completedLessons.includes(currentLesson.id)
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  {completedLessons.includes(currentLesson.id) ? 'Completed' : 'Mark as Complete'}
                </button>
              )}
            </div>

            {/* Speaking Lesson Guide */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4 text-xs text-slate-300 leading-relaxed">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                Lesson Practice Homework & Transcript
              </h3>
              <p>
                In this video lesson, pay close attention to native intonation and sentence stress. Listen carefully, pause the player, and shadow each sentence out loud 3 times.
              </p>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-blue-400 block uppercase tracking-wider text-[11px]">
                  Key Sentence Pattern:
                </span>
                <p className="italic text-slate-200">
                  "I was under the impression that we had reached a consensus, but upon further review..."
                </p>
              </div>
            </div>

            {/* Quick Practice Quiz */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Quick Knowledge Check
              </h3>
              <p className="text-xs text-slate-300">
                When speaking in English, what helps you sound most natural?
              </p>
              
              <div className="space-y-2">
                {[
                  'Speaking at 200 words per minute without stopping',
                  'Linking consonants to following vowels and stressing key content words',
                  'Translating word-for-word from your mother tongue',
                  'Using only 10-syllable obscure academic words'
                ].map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuizAnswer(idx)}
                    className={`w-full p-3 rounded-xl text-left text-xs font-medium border transition-all ${
                      quizAnswer === idx
                        ? 'border-blue-500 bg-blue-600/20 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {quizAnswer !== null && (
                <div className="pt-2">
                  {quizAnswer === 1 ? (
                    <div className="p-3 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold">
                      ✓ Correct! Connected speech and content word stress are the secrets of natural fluency.
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs">
                      Try again! Focus on linking words and stress patterns.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Curriculum Lesson Index */}
        <div className="lg:col-span-1 bg-slate-900 border-l border-slate-800 overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white">Course Curriculum</h3>
            <span className="text-xs text-slate-400">
              {completedLessons.length} of {allLessons.length} lessons finished
            </span>
          </div>

          <div className="flex-1 divide-y divide-slate-800/60">
            {(course.sections || []).map((sec, sIdx) => (
              <div key={sec.id || sIdx} className="p-3 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2">
                  {sec.title}
                </span>

                <div className="space-y-1">
                  {(sec.lessons || []).map((les) => {
                    const isSelected = currentLesson?.id === les.id;
                    const isDone = completedLessons.includes(les.id);

                    return (
                      <button
                        key={les.id}
                        onClick={() => setCurrentLesson(les)}
                        className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          {isDone ? (
                            <CheckCircle2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-400'}`} />
                          ) : (
                            <PlayCircle className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                          )}
                          <span className="truncate">{les.title}</span>
                        </div>
                        <span className={`text-[10px] shrink-0 ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                          {les.duration_minutes}m
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-8 shadow-2xl border-4 border-amber-400 space-y-6 relative">
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold text-sm"
            >
              ✕ Close
            </button>

            {/* Certificate Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
                Official Certificate of Fluency Mastery
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
                SpeakMate Academy
              </h2>
            </div>

            <div className="text-center space-y-3 py-4 border-y border-slate-200">
              <p className="text-xs text-slate-500">This certifies that</p>
              <h3 className="text-xl sm:text-2xl font-bold text-blue-900 underline decoration-amber-400 underline-offset-4">
                {profile?.display_name || user?.email?.split('@')[0] || 'English Scholar'}
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                has successfully completed all lectures, conversational assignments, and assessments for
              </p>
              <h4 className="font-bold text-base text-slate-800">
                "{course.title}"
              </h4>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
              <div>
                <span className="block font-semibold text-slate-700">Verification ID:</span>
                <span className="font-mono text-slate-500">{certificateId || 'CERT-SPEAKMATE-2026'}</span>
              </div>
              <div className="text-right">
                <span className="block font-semibold text-slate-700">Instructor:</span>
                <span>{course.mentor_name}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
