import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  GraduationCap, 
  ArrowLeft,
  Video,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { mentorService } from '../services/mentorService';
import { useAuth } from '../context/AuthContext';

export default function MentorApply() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [existingApp, setExistingApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile?.display_name || '',
    teachingExperience: '',
    skills: ['Spoken English'],
    englishProficiency: 'C1 Advanced',
    introduction: '',
    introVideoUrl: '',
    phoneOrWhatsapp: '',
  });

  useEffect(() => {
    const checkApp = async () => {
      if (user) {
        const app = await mentorService.getMyApplication(user.id);
        if (app) setExistingApp(app);
      }
      setLoading(false);
    };

    checkApp();
  }, [user]);

  const skillOptions = [
    'Spoken English',
    'American Accent Coaching',
    'IELTS Speaking & Cue Cards',
    'Business English & Tech Interviews',
    'Grammar & Pronunciation Foundations',
    'Public Speaking & Debates'
  ];

  const handleToggleSkill = (skill) => {
    setFormData((prev) => {
      const exists = prev.skills.includes(skill);
      return {
        ...prev,
        skills: exists ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const app = await mentorService.submitApplication({
        display_name: formData.displayName,
        teaching_experience: formData.teachingExperience,
        skills: formData.skills,
        english_proficiency: formData.englishProficiency,
        introduction: formData.introduction,
        intro_video_url: formData.introVideoUrl,
        phone_or_whatsapp: formData.phoneOrWhatsapp,
      }, user);

      setExistingApp(app);
      setSubmitted(true);
    } catch (err) {
      alert(err.message || 'Submission failed.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      <Link
        to="/mentors"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Mentors Directory
      </Link>

      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-10 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Earn on SpeakMate
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Apply to Become an Approved English Mentor
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Teach thousands of motivated English learners. Host paid live classes, sell your courses, and receive direct MFS payouts (bKash/Nagad/Rocket/Bank) with clear 20% platform commission.
        </p>
      </div>

      {/* If Application Already Submitted */}
      {existingApp && !submitted ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Application Under Review</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your mentor application is currently in <strong>{existingApp.status.toUpperCase()}</strong> status. Our moderation team reviews teaching credentials within 24-48 hours.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/mentor/dashboard"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md"
            >
              Go to Mentor Dashboard Preview
            </Link>
          </div>
        </div>
      ) : submitted ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Application Submitted Successfully!</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Thank you for applying. You can now access your Mentor Dashboard to prepare your courses and draft live classes.
          </p>
          <div className="pt-2">
            <Link
              to="/mentor/dashboard"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md inline-block"
            >
              Open Mentor Dashboard
            </Link>
          </div>
        </div>
      ) : (
        /* Application Form */
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Display Name / Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sarah Johnson, CELTA"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                English Proficiency Level *
              </label>
              <select
                value={formData.englishProficiency}
                onChange={(e) => setFormData({ ...formData, englishProficiency: e.target.value })}
                className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="Native">Native Speaker</option>
                <option value="C2 Proficient">C2 Proficient (CEFR)</option>
                <option value="C1 Advanced">C1 Advanced (CEFR)</option>
                <option value="B2 Upper-Intermediate">B2 Upper-Intermediate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Teaching Experience & Background *
            </label>
            <textarea
              required
              rows="3"
              placeholder="Describe your previous teaching experience, certificates (CELTA, TEFL, TESOL, IELTS), or corporate communication coaching..."
              value={formData.teachingExperience}
              onChange={(e) => setFormData({ ...formData, teachingExperience: e.target.value })}
              className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Specializations Checkboxes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Teaching Specializations (Select all that apply)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {skillOptions.map((sk) => (
                <button
                  type="button"
                  key={sk}
                  onClick={() => handleToggleSkill(sk)}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                    formData.skills.includes(sk)
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span>{sk}</span>
                  {formData.skills.includes(sk) && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Introduction & Student Promise (Bio) *
            </label>
            <textarea
              required
              rows="4"
              placeholder="Introduce yourself to prospective students. What is your teaching methodology? How will you help them achieve fluency?"
              value={formData.introduction}
              onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
              className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Video Introduction URL (Optional)
              </label>
              <input
                type="url"
                placeholder="YouTube, Vimeo, or Loom video link"
                value={formData.introVideoUrl}
                onChange={(e) => setFormData({ ...formData, introVideoUrl: e.target.value })}
                className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp or Phone Number (For Verification) *
              </label>
              <input
                type="tel"
                required
                placeholder="+880 1XXXXXXXXX"
                value={formData.phoneOrWhatsapp}
                onChange={(e) => setFormData({ ...formData, phoneOrWhatsapp: e.target.value })}
                className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Platform Commission: <strong>20%</strong> • Mentor keeps <strong>80%</strong>
            </span>

            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all shadow-blue-600/20"
            >
              Submit Application
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
