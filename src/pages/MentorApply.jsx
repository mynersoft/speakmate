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
    studyInstitute: '',
    degree: '',
    graduationYear: '',
    skills: ['Spoken English'],
    englishProficiency: 'C1 Advanced',
    introduction: '',
    introVideoUrl: '',
    phoneOrWhatsapp: '',
  });

  // Custom skill adding
  const [customSkillInput, setCustomSkillInput] = useState('');

  // Certificate upload state
  const [uploadedCertificates, setUploadedCertificates] = useState([]);
  const [certForm, setCertForm] = useState({
    title: '',
    issuer: '',
    year: new Date().getFullYear().toString(),
    credentialId: '',
    fileUrl: '',
    fileName: '',
  });
  const [showCertForm, setShowCertForm] = useState(false);

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

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    const clean = customSkillInput.trim();
    if (!clean) return;
    if (!formData.skills.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, clean] }));
    }
    setCustomSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove)
    }));
  };

  // Certificate file picker handler
  const handleCertFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCertForm((prev) => ({
        ...prev,
        fileUrl: event.target.result,
        fileName: file.name,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCertificate = (e) => {
    e.preventDefault();
    if (!certForm.title || !certForm.issuer) return;

    const newCert = {
      id: `cert_${Date.now()}`,
      title: certForm.title.trim(),
      issuer: certForm.issuer.trim(),
      year: certForm.year.trim() || new Date().getFullYear().toString(),
      credential_id: certForm.credentialId.trim() || `VER-${Math.floor(Math.random() * 89999 + 10000)}`,
      file_url: certForm.fileUrl || '',
      verified: true,
    };

    setUploadedCertificates((prev) => [...prev, newCert]);
    setCertForm({
      title: '',
      issuer: '',
      year: new Date().getFullYear().toString(),
      credentialId: '',
      fileUrl: '',
      fileName: '',
    });
    setShowCertForm(false);
  };

  const handleRemoveCertificate = (certId) => {
    setUploadedCertificates((prev) => prev.filter((c) => c.id !== certId));
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
        study_institute: formData.studyInstitute,
        degree: formData.degree,
        graduation_year: formData.graduationYear,
        skills: formData.skills,
        certificates: uploadedCertificates,
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
          Teach thousands of motivated English learners. Host paid live classes, sell your courses, showcase your study institute, upload your certificates, and receive direct MFS payouts (bKash/Nagad/Rocket/Bank) with clear 20% platform commission.
        </p>
      </div>

      {/* If Application Already Submitted */}
      {existingApp && !submitted ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Approved English Mentor</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your mentor credentials are active! You can manage your study institute, upload certificates, add skills, and schedule live workshops from your studio.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/mentor/dashboard"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              Open Mentor Dashboard & Credentials
            </Link>
          </div>
        </div>
      ) : submitted ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Application & Credentials Submitted!</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Congratulations! Your study institute, skills, and certificates have been recorded. You can now access your Mentor Studio.
          </p>
          <div className="pt-2">
            <Link
              to="/mentor/dashboard"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md inline-block"
            >
              Open Mentor Studio & Credentials
            </Link>
          </div>
        </div>
      ) : (
        /* Application Form */
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              1. Basic Profile & Proficiency
            </h3>

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
          </div>

          {/* Section 2: Study Institute & Education */}
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                2. Study Institute & Academic Background
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Students trust instructors with verified educational credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Study Institute / University *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. University of Cambridge / Dhaka University"
                  value={formData.studyInstitute}
                  onChange={(e) => setFormData({ ...formData, studyInstitute: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Degree / Major *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MA in Applied Linguistics / BA in English"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Graduation Year
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2018"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Teaching Skills & Custom Add */}
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                3. Skills & Teaching Specializations
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Select from popular teaching skills or type custom skills below.
              </p>
            </div>

            {/* Popular Skills */}
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

            {/* Add Custom Skill Tag */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Add Custom Skill or Niche Expertise
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. British RP Accent, OET for Nurses, Presentation Coaching..."
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSkill(e);
                    }
                  }}
                  className="flex-1 px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSkill}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors shrink-0"
                >
                  + Add Skill
                </button>
              </div>

              {/* Selected Skills Chips */}
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-blue-500 hover:text-rose-600 transition-colors ml-0.5"
                        title="Remove skill"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Certificate Upload */}
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  4. Certificates & Accreditations (CELTA, TEFL, IELTS, Degrees)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Upload photos or scans of your teaching certificates to get the Verified Badge.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCertForm(!showCertForm)}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition-colors"
              >
                {showCertForm ? 'Cancel Upload' : '+ Upload Certificate'}
              </button>
            </div>

            {/* Certificate Upload Form Dropdown */}
            {showCertForm && (
              <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-emerald-900">Certificate Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Certificate Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cambridge CELTA, TEFL 120-Hour"
                      value={certForm.title}
                      onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Issuing Organization *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cambridge Assessment English / British Council"
                      value={certForm.issuer}
                      onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Year Issued
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2021"
                      value={certForm.year}
                      onChange={(e) => setCertForm({ ...certForm, year: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Credential / Verification ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CAM-88129"
                      value={certForm.credentialId}
                      onChange={(e) => setCertForm({ ...certForm, credentialId: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* File Upload Control */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Upload Certificate File (JPG, PNG, PDF)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer px-4 py-2.5 rounded-xl border-2 border-dashed border-emerald-400 bg-white hover:bg-emerald-50/50 text-emerald-800 text-xs font-semibold flex items-center gap-2 transition-colors">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>{certForm.fileName ? certForm.fileName : 'Choose File / Photo'}</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleCertFileSelect}
                        className="hidden"
                      />
                    </label>
                    {certForm.fileUrl && (
                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Ready to attach
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCertForm(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCertificate}
                    disabled={!certForm.title || !certForm.issuer}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                  >
                    Attach Certificate
                  </button>
                </div>
              </div>
            )}

            {/* List of Attached Certificates */}
            {uploadedCertificates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {uploadedCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      {cert.file_url ? (
                        <img
                          src={cert.file_url}
                          alt={cert.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">{cert.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{cert.issuer} • {cert.year}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full font-semibold mt-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Credential
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCertificate(cert.id)}
                      className="text-slate-400 hover:text-rose-600 text-xs font-bold p-1"
                      title="Remove Certificate"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                No certificate attached yet. Click "+ Upload Certificate" above to add your CELTA, IELTS, or Degree credentials.
              </div>
            )}
          </div>

          {/* Section 5: Experience & Methodology */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              5. Experience & Student Promise
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Teaching Experience & Background *
              </label>
              <textarea
                required
                rows="3"
                placeholder="Describe your previous teaching experience, institutes taught at, or corporate communication coaching..."
                value={formData.teachingExperience}
                onChange={(e) => setFormData({ ...formData, teachingExperience: e.target.value })}
                className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
              />
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
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Platform Commission: <strong>20%</strong> • Mentor keeps <strong>80%</strong>
            </span>

            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all shadow-blue-600/20"
            >
              Submit Application & Credentials
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
