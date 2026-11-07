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
  Video,
  GraduationCap,
  Building,
  FileText,
  Eye,
  X,
  Edit3
} from 'lucide-react';
import { mentorService } from '../services/mentorService';
import { classService } from '../services/classService';
import { courseService } from '../services/courseService';
import { useAuth } from '../context/AuthContext';

export default function MentorProfile() {
  const { mentorId } = useParams();
  const { user } = useAuth();
  const [mentor, setMentor] = useState(null);
  const [mentorClasses, setMentorClasses] = useState([]);
  const [mentorCourses, setMentorCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const targetId = mentorId === 'me' ? user?.id : mentorId;
        if (!targetId) return;

        const data = await mentorService.getMentorById(targetId);
        setMentor(data);

        // Fetch their classes & courses
        const [classes, courses] = await Promise.all([
          classService.getLiveClasses(),
          courseService.getCourses(),
        ]);

        setMentorClasses(classes.filter((c) => c.mentor_id === targetId || c.mentor_name === data?.display_name));
        setMentorCourses(courses.filter((c) => c.mentor_id === targetId || c.mentor_name === data?.display_name));
      } catch (err) {
        console.error('Error fetching mentor:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [mentorId, user]);

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

  const isOwnProfile = user && (user.id === mentor.id || user.id === mentor.user_id);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 animate-fade-in">
      
      {/* Mentor Hero Banner */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/mentors"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Mentors Directory
            </Link>

            {isOwnProfile && (
              <Link
                to="/mentor/studio"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit in Mentor Studio
              </Link>
            )}
          </div>

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
                {mentor.certificates?.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    {mentor.certificates.length} Accredited Certificates
                  </span>
                )}
              </div>

              <p className="text-sm font-medium text-blue-400">
                {mentor.headline}
              </p>

              {/* Study Institute in Hero */}
              {mentor.study_institute && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs text-slate-200">
                  <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Studied at <strong>{mentor.study_institute}</strong>
                    {mentor.degree && ` • ${mentor.degree}`}
                    {mentor.graduation_year && ` (${mentor.graduation_year})`}
                  </span>
                </div>
              )}

              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed pt-1">
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
        
        {/* Study Institute & Higher Education Section */}
        {mentor.study_institute && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Education & Academic Background</h3>
                <p className="text-xs text-slate-500">Verified higher education credentials and alma mater</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Study Institute</span>
                <p className="text-sm font-extrabold text-slate-900">{mentor.study_institute}</p>
              </div>

              {mentor.degree && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Degree & Major</span>
                  <p className="text-sm font-extrabold text-slate-900">{mentor.degree}</p>
                </div>
              )}

              {mentor.graduation_year && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Graduation Year</span>
                  <p className="text-sm font-extrabold text-slate-900">Class of {mentor.graduation_year}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mentor Skills & Expertise */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Core Expertise & Teaching Skills</h3>
              <p className="text-xs text-slate-500">Specializations and English communication competencies</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {(mentor.skills || []).map((sk, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100 shadow-2xs"
              >
                {sk}
              </span>
            ))}
          </div>
        </div>

        {/* Verified Certificates & Accreditations */}
        {mentor.certificates && mentor.certificates.length > 0 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Verified Certificates & Accreditations</h3>
                  <p className="text-xs text-slate-500">Official diplomas, CELTA, IELTS and professional credentials</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                {mentor.certificates.length} Verified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
              {mentor.certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail */}
                    <div
                      className="h-40 bg-slate-200 relative overflow-hidden flex items-center justify-center cursor-pointer group"
                      onClick={() => setSelectedCert(cert)}
                    >
                      {cert.file_url ? (
                        <>
                          <img
                            src={cert.file_url}
                            alt={cert.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                            <Eye className="w-4 h-4" />
                            View Certificate
                          </div>
                        </>
                      ) : (
                        <div className="p-4 text-center">
                          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-1" />
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Accredited Credential</span>
                        </div>
                      )}
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                        {cert.title}
                      </h4>
                      <div className="text-xs text-slate-600 space-y-1">
                        <p className="font-semibold text-blue-700 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="truncate">{cert.issuer}</span>
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <span>Year: <strong>{cert.year || 'Certified'}</strong></span>
                          {cert.credential_id && (
                            <span className="font-mono text-[10px] text-slate-500">ID: {cert.credential_id}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white border-t border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => setSelectedCert(cert)}
                      className="w-full py-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Inspect Certificate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

      {/* LIGHTBOX MODAL: Inspect Certificate */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900">{selectedCert.title}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified Accreditation
                  </span>
                </div>
                <p className="text-xs text-blue-600 font-semibold">{selectedCert.issuer} • Issued {selectedCert.year || 'Certified'}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCert(null)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Display Area */}
            <div className="flex-1 overflow-y-auto bg-slate-900/5 rounded-2xl p-4 flex items-center justify-center min-h-[300px]">
              {selectedCert.file_url ? (
                <img
                  src={selectedCert.file_url}
                  alt={selectedCert.title}
                  className="max-h-[500px] w-auto max-w-full rounded-xl object-contain shadow-lg border border-slate-200"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <FileText className="w-16 h-16 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">Digital Accreditation Record</p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    This certification was registered and verified directly via {selectedCert.issuer}.
                  </p>
                </div>
              )}
            </div>

            {/* Metadata Footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs shrink-0">
              <div className="font-mono text-slate-500">
                Credential ID: <strong className="text-slate-800">{selectedCert.credential_id || 'VERIFIED-SM'}</strong>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCert(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
