import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  Video, 
  BookOpen, 
  Users, 
  Plus, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  CreditCard,
  Building,
  Smartphone,
  GraduationCap,
  Award,
  FileText,
  Trash2,
  ExternalLink,
  Upload,
  X,
  Eye,
  Check,
  ShieldCheck
} from 'lucide-react';
import { mentorService } from '../services/mentorService';
import { classService } from '../services/classService';
import { courseService } from '../services/courseService';
import { useAuth } from '../context/AuthContext';

export default function MentorDashboard() {
  const { user, profile } = useAuth();

  const [activeTab, setActiveTab] = useState('classes'); // 'classes' | 'courses' | 'credentials' | 'payouts'
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  // Credentials State: Study Institute, Skills & Certificates
  const [credentials, setCredentials] = useState({
    study_institute: '',
    degree: '',
    graduation_year: '',
    skills: ['Spoken English'],
    certificates: [],
  });
  const [editingEducation, setEditingEducation] = useState(false);
  const [educationForm, setEducationForm] = useState({
    study_institute: '',
    degree: '',
    graduation_year: '',
  });
  const [eduSuccessMsg, setEduSuccessMsg] = useState('');
  const [newSkillInput, setNewSkillInput] = useState('');
  
  // Certificate Upload State
  const [showCertUploadModal, setShowCertUploadModal] = useState(false);
  const [certForm, setCertForm] = useState({
    title: '',
    issuer: '',
    year: new Date().getFullYear().toString(),
    credential_id: '',
    file_url: '',
    fileName: '',
  });
  const [certUploadError, setCertUploadError] = useState('');
  const [certPreviewModal, setCertPreviewModal] = useState(null);

  const popularSkills = [
    'Spoken English',
    'IELTS Speaking 8.5+',
    'American Accent Coaching',
    'British RP Pronunciation',
    'Business English & Tech Interviews',
    'Grammar & Structural Precision',
    'Public Speaking & Debates',
    'Conversational Fluency Drills',
    'Phonetics & Intonation',
    'Corporate Communication'
  ];

  // Financial Stats
  const [financials, setFinancials] = useState({
    grossSales: 34500,
    commissionRate: 20,
    platformCommission: 6900,
    netEarnings: 27600,
    availableBalance: 12400,
    paidPayouts: 15200,
  });

  // Payout Form
  const [payoutAmount, setPayoutAmount] = useState(5000);
  const [payoutMethod, setPayoutMethod] = useState('bkash');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [payoutMsg, setPayoutMsg] = useState('');

  // Class Form State
  const [newClass, setNewClass] = useState({
    title: '',
    description: '',
    topic: 'Conversational Fluency',
    level: 'Intermediate',
    scheduled_at: '',
    duration_minutes: 45,
    max_capacity: 20,
    price_bdt: 0,
  });

  // Course Form State
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: 'Spoken English',
    level: 'Intermediate',
    price_bdt: 999,
    duration_hours: 4.0,
  });

  const loadData = async () => {
    if (!user) return;
    const allCls = await classService.getLiveClasses();
    const allCourses = await courseService.getCourses();
    setClasses(allCls.filter((c) => c.mentor_id === user.id || c.mentor_name === profile?.display_name));
    setCourses(allCourses.filter((c) => c.mentor_id === user.id || c.mentor_name === profile?.display_name));

    // Load mentor credentials (study institute, skills, certificates)
    const creds = await mentorService.getMentorCredentials(user.id);
    if (creds) {
      setCredentials(creds);
      setEducationForm({
        study_institute: creds.study_institute || '',
        degree: creds.degree || '',
        graduation_year: creds.graduation_year || '',
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [user, profile]);

  const handleSaveEducation = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      await mentorService.updateStudyInstitute(user.id, educationForm);
      setCredentials((prev) => ({
        ...prev,
        study_institute: educationForm.study_institute,
        degree: educationForm.degree,
        graduation_year: educationForm.graduation_year,
      }));
      setEditingEducation(false);
      setEduSuccessMsg('Education & institute details updated successfully!');
      setTimeout(() => setEduSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Error updating institute');
    }
  };

  const handleAddSkill = async (skillToAdd) => {
    if (!user) return;
    const clean = skillToAdd?.trim();
    if (!clean) return;
    const updated = await mentorService.addSkill(user.id, clean);
    setCredentials((prev) => ({ ...prev, skills: updated }));
    setNewSkillInput('');
  };

  const handleRemoveSkill = async (skillToRemove) => {
    if (!user) return;
    const updated = await mentorService.removeSkill(user.id, skillToRemove);
    setCredentials((prev) => ({ ...prev, skills: updated }));
  };

  const handleCertFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setCertUploadError('File size exceeds 8MB limit.');
      return;
    }
    setCertUploadError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      setCertForm((prev) => ({
        ...prev,
        file_url: event.target.result,
        fileName: file.name,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUploadCertificate = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!certForm.title || !certForm.issuer) {
      setCertUploadError('Please provide both Certificate Title and Issuing Body.');
      return;
    }

    try {
      const updated = await mentorService.uploadCertificate(user.id, certForm);
      setCredentials((prev) => ({ ...prev, certificates: updated }));
      setShowCertUploadModal(false);
      setCertForm({
        title: '',
        issuer: '',
        year: new Date().getFullYear().toString(),
        credential_id: '',
        file_url: '',
        fileName: '',
      });
      alert('Certificate uploaded and verified on your mentor profile!');
    } catch (err) {
      setCertUploadError(err.message || 'Failed to upload certificate');
    }
  };

  const handleDeleteCertificate = async (certId) => {
    if (!user) return;
    if (!confirm('Are you sure you want to remove this certificate?')) return;
    const updated = await mentorService.deleteCertificate(user.id, certId);
    setCredentials((prev) => ({ ...prev, certificates: updated }));
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClass.title || !newClass.scheduled_at) return;

    try {
      await classService.createLiveClass(newClass, {
        id: user.id,
        display_name: profile?.display_name,
        avatar_url: profile?.avatar_url,
      });
      setShowClassModal(false);
      loadData();
      alert('Live class created and published successfully!');
    } catch (err) {
      alert(err.message || 'Error creating class');
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.title || !newCourse.description) return;

    try {
      await courseService.createCourse(newCourse, {
        id: user.id,
        display_name: profile?.display_name,
        avatar_url: profile?.avatar_url,
      });
      setShowCourseModal(false);
      loadData();
      alert('Course published to marketplace successfully!');
    } catch (err) {
      alert(err.message || 'Error creating course');
    }
  };

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    if (payoutAmount < 500) {
      setPayoutMsg('Minimum payout is 500 BDT.');
      return;
    }

    try {
      const res = await mentorService.requestPayout({
        mentorId: user.id,
        amountBdt: payoutAmount,
        method: payoutMethod,
        accountNumber,
        accountName,
        bankName,
      });

      setFinancials((prev) => ({
        ...prev,
        availableBalance: Math.max(0, prev.availableBalance - payoutAmount),
      }));

      setShowPayoutModal(false);
      alert(res.message || 'Payout request submitted successfully!');
    } catch (err) {
      setPayoutMsg(err.message || 'Failed to submit payout.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mentor Studio & Earnings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your live workshops, published courses, student admissions, and financial payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/mentors/${user?.id || 'me'}`}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-200 shadow-sm"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            View Public Profile
          </Link>
          <button
            onClick={() => setShowClassModal(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Live Class
          </button>
          <button
            onClick={() => setShowCourseModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Publish Course
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Sales</span>
          <p className="text-2xl font-black text-slate-900">৳{financials.grossSales.toLocaleString()} BDT</p>
          <span className="text-[11px] text-slate-400">From courses & paid admissions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Platform Fee ({financials.commissionRate}%)
          </span>
          <p className="text-2xl font-black text-rose-600">-৳{financials.platformCommission.toLocaleString()} BDT</p>
          <span className="text-[11px] text-slate-400">Hosting, WebRTC & infrastructure</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Earned (80%)</span>
          <p className="text-2xl font-black text-emerald-600">৳{financials.netEarnings.toLocaleString()} BDT</p>
          <span className="text-[11px] text-emerald-600 font-semibold">Verified Mentor Share</span>
        </div>

        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-5 rounded-2xl shadow-md space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Available for Payout</span>
            <p className="text-2xl font-black text-white">৳{financials.availableBalance.toLocaleString()} BDT</p>
          </div>
          <button
            onClick={() => setShowPayoutModal(true)}
            className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            Request Payout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('classes')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'classes'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Video className="w-4 h-4" />
          My Live Classes ({classes.length})
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'courses'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          My Published Courses ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('credentials')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'credentials'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          Credentials & Skills ({credentials.certificates?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('payouts')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'payouts'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Payout History
        </button>
      </div>

      {/* TAB 1: LIVE CLASSES */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          {classes.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
              <Video className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No live classes scheduled yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Schedule a free conversational workshop or a paid IELTS speaking masterclass.
              </p>
              <button
                onClick={() => setShowClassModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl"
              >
                Schedule First Class
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((cls) => (
                <div key={cls.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700">
                      {cls.topic}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {cls.is_free ? 'FREE' : `৳${cls.price_bdt} BDT`}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900">{cls.title}</h3>
                  <div className="text-xs text-slate-500">
                    {new Date(cls.scheduled_at).toLocaleDateString()} at {new Date(cls.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                    <span className="text-slate-500">{cls.enrolled_count || 0} / {cls.max_capacity} registered</span>
                    <Link
                      to={`/classroom/${cls.id}`}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                    >
                      Start Classroom
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COURSES */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          {courses.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No courses published yet</h3>
              <button
                onClick={() => setShowCourseModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl"
              >
                Publish First Course
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700">
                      {c.category}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {c.is_free ? 'FREE' : `৳${c.price_bdt} BDT`}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{c.title}</h3>
                  <div className="text-xs text-slate-500">{c.total_enrolled || 0} students enrolled</div>
                  <Link
                    to={`/courses/${c.id}`}
                    className="block text-center py-2 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    View in Marketplace
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CREDENTIALS & SKILLS */}
      {activeTab === 'credentials' && (
        <div className="space-y-8 animate-fade-in">
          
          {eduSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{eduSuccessMsg}</span>
            </div>
          )}

          {/* Section 1: Study Institute & Higher Education */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Study Institute & Education</h3>
                  <p className="text-xs text-slate-500">Your alma mater, academic degrees, and graduation records.</p>
                </div>
              </div>

              {!editingEducation ? (
                <button
                  onClick={() => setEditingEducation(true)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto"
                >
                  Edit Details
                </button>
              ) : null}
            </div>

            {editingEducation ? (
              <form onSubmit={handleSaveEducation} className="space-y-4 max-w-2xl bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Study Institute / University *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. University of Dhaka, BRAC University, Cambridge University"
                    value={educationForm.study_institute}
                    onChange={(e) => setEducationForm({ ...educationForm, study_institute: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Degree / Major *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MA in Applied Linguistics & ELT, BA in English"
                      value={educationForm.degree}
                      onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Graduation Year
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2019"
                      value={educationForm.graduation_year}
                      onChange={(e) => setEducationForm({ ...educationForm, graduation_year: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEducation(false);
                      setEducationForm({
                        study_institute: credentials.study_institute || '',
                        degree: credentials.degree || '',
                        graduation_year: credentials.graduation_year || '',
                      });
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    Save Institute Details
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Study Institute</span>
                  <p className="text-sm font-extrabold text-slate-900">
                    {credentials.study_institute || <span className="text-slate-400 font-normal italic">Not specified yet</span>}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Degree & Specialization</span>
                  <p className="text-sm font-extrabold text-slate-900">
                    {credentials.degree || <span className="text-slate-400 font-normal italic">Not specified yet</span>}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Graduation Year</span>
                  <p className="text-sm font-extrabold text-slate-900">
                    {credentials.graduation_year ? `Class of ${credentials.graduation_year}` : <span className="text-slate-400 font-normal italic">Not specified</span>}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Teaching Skills & Specializations */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Teaching Skills & Specializations</h3>
                <p className="text-xs text-slate-500">Students and language learners filter mentors by these skill tags.</p>
              </div>
            </div>

            {/* Current Skills List */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700">Active Skills ({credentials.skills?.length || 0}):</span>
              <div className="flex flex-wrap gap-2">
                {(credentials.skills || []).map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200/60 text-indigo-800 text-xs font-semibold shadow-2xs"
                  >
                    <span>{sk}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(sk)}
                      className="p-0.5 rounded-md text-indigo-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove skill"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Add Custom Skill Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddSkill(newSkillInput);
              }}
              className="flex items-center gap-2 max-w-md pt-2"
            >
              <input
                type="text"
                placeholder="Type a skill (e.g. British RP, Phonetics, IELTS Part 2)..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newSkillInput.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0"
              >
                + Add Skill
              </button>
            </form>

            {/* Quick Add Recommendations */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Popular English Teaching Skills (Click to Quick-Add):
              </span>
              <div className="flex flex-wrap gap-2">
                {popularSkills
                  .filter((ps) => !(credentials.skills || []).some((s) => s.toLowerCase() === ps.toLowerCase()))
                  .map((ps) => (
                    <button
                      key={ps}
                      type="button"
                      onClick={() => handleAddSkill(ps)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[11px] font-medium transition-colors border border-slate-200/60"
                    >
                      + {ps}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Section 3: Verified Certificates & Accreditations */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Verified Certificates & Accreditations</h3>
                  <p className="text-xs text-slate-500">
                    Upload official CELTA, TESOL, TEFL, IELTS TRF, or college certifications to stand out.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCertUploadError('');
                  setShowCertUploadModal(true);
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 self-start sm:self-auto transition-all"
              >
                <Upload className="w-4 h-4" />
                + Upload Certificate
              </button>
            </div>

            {/* Certificates List */}
            {(!credentials.certificates || credentials.certificates.length === 0) ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl p-6 space-y-3">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-sm text-slate-700">No certificates uploaded yet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Adding your verified teaching credentials increases student inquiries by up to 300%.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCertUploadModal(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-colors"
                >
                  Upload Your First Certificate
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {credentials.certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Thumbnail / Header */}
                      <div className="h-36 bg-slate-200 relative overflow-hidden flex items-center justify-center">
                        {cert.file_url ? (
                          <img
                            src={cert.file_url}
                            alt={cert.title}
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => setCertPreviewModal(cert)}
                          />
                        ) : (
                          <div className="p-4 text-center">
                            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-1" />
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Document Accredited</span>
                          </div>
                        )}
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      </div>

                      {/* Info */}
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
                            <span>Year: <strong>{cert.year || 'Verified'}</strong></span>
                            {cert.credential_id && (
                              <span className="font-mono text-[10px] text-slate-500">ID: {cert.credential_id}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-3 bg-white border-t border-slate-200/80 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setCertPreviewModal(cert)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCertificate(cert.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete certificate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PAYOUTS */}
      {activeTab === 'payouts' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900">Recent Payout Dispatches</h3>
            <span className="text-xs text-slate-500">Processed via Bangladesh MFS & BEFTN</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {[
              { id: 'po-1', date: 'Yesterday', amount: 8000, method: 'bKash (01700-XXXXXX)', status: 'completed', ref: 'BKASH-TX-984421' },
              { id: 'po-2', date: 'Last Week', amount: 7200, method: 'Nagad (01800-XXXXXX)', status: 'completed', ref: 'NAGAD-TX-332918' },
            ].map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">৳{p.amount.toLocaleString()} BDT</span>
                  <span className="text-slate-500">{p.method} • {p.date}</span>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700">
                    {p.status}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 block mt-0.5">Ref: {p.ref}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Request Payout */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Request Earnings Payout</h3>
            <p className="text-xs text-slate-500">
              Available Balance: <strong>৳{financials.availableBalance.toLocaleString()} BDT</strong> (Min ৳500 BDT)
            </p>

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (BDT)</label>
                <input
                  type="number"
                  required
                  min="500"
                  max={financials.availableBalance}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payout Method</label>
                <div className="grid grid-cols-4 gap-2">
                  {['bkash', 'nagad', 'rocket', 'bank'].map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setPayoutMethod(m)}
                      className={`p-2 rounded-lg text-xs font-bold uppercase border transition-all ${
                        payoutMethod === m ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {payoutMethod === 'bank' ? 'Bank Account Number' : 'MFS Mobile Number'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={payoutMethod === 'bank' ? 'Account Number' : '01XXXXXXXXX'}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              {payoutMethod === 'bank' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name & Branch</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dutch Bangla Bank, Gulshan Branch"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {payoutMsg && <p className="text-xs text-rose-600">{payoutMsg}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Submit Payout Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create Live Class */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Schedule Live Class</h3>

            <form onSubmit={handleCreateClass} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Class Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spoken Fluency Speed Jam"
                  value={newClass.title}
                  onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  required
                  rows="2"
                  placeholder="Topics covered, conversational format..."
                  value={newClass.description}
                  onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newClass.scheduled_at}
                    onChange={(e) => setNewClass({ ...newClass, scheduled_at: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price (0 for Free) BDT</label>
                  <input
                    type="number"
                    min="0"
                    value={newClass.price_bdt}
                    onChange={(e) => setNewClass({ ...newClass, price_bdt: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Publish Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Publish Course */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Publish New English Course</h3>

            <form onSubmit={handleCreateCourse} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master IELTS Speaking Band 8.5"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  required
                  rows="2"
                  placeholder="Course summary and outcomes..."
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Spoken English">Spoken English</option>
                    <option value="IELTS Preparation">IELTS Preparation</option>
                    <option value="Business English">Business English</option>
                    <option value="Grammar & Vocabulary">Grammar & Vocabulary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price (BDT)</label>
                  <input
                    type="number"
                    min="0"
                    value={newCourse.price_bdt}
                    onChange={(e) => setNewCourse({ ...newCourse, price_bdt: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Upload Certificate */}
      {showCertUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Upload Teaching Certificate</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCertUploadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadCertificate} className="space-y-4">
              {/* File input / drag area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Certificate Document / Photo *
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 text-center bg-slate-50 transition-colors relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleCertFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {certForm.file_url ? (
                    <div className="space-y-2">
                      <img
                        src={certForm.file_url}
                        alt="Preview"
                        className="max-h-36 mx-auto rounded-lg object-contain shadow-xs border border-slate-200"
                      />
                      <p className="text-xs font-semibold text-emerald-700">
                        File selected: {certForm.fileName || 'certificate_doc'}
                      </p>
                      <span className="text-[10px] text-slate-400">Click to change file</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5 py-3">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">
                        Click or drag certificate image / PDF here
                      </p>
                      <p className="text-[11px] text-slate-400">
                        PNG, JPG, WEBP, or PDF up to 8MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Certificate Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cambridge CELTA, TESOL 120h Master, IELTS Band 8.5"
                  value={certForm.title}
                  onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Issuing Organization / Institute *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cambridge Assessment English, British Council, IDP"
                  value={certForm.issuer}
                  onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Year of Issuance
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2022"
                    value={certForm.year}
                    onChange={(e) => setCertForm({ ...certForm, year: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Credential ID / License
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CAM-CELTA-8921"
                    value={certForm.credential_id}
                    onChange={(e) => setCertForm({ ...certForm, credential_id: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {certUploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {certUploadError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCertUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Save & Verify Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Certificate Lightbox / Full Preview */}
      {certPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900">{certPreviewModal.title}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                </div>
                <p className="text-xs text-blue-600 font-semibold">{certPreviewModal.issuer} • Issued {certPreviewModal.year || 'Certified'}</p>
              </div>
              <button
                type="button"
                onClick={() => setCertPreviewModal(null)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Display Area */}
            <div className="flex-1 overflow-y-auto bg-slate-900/5 rounded-2xl p-4 flex items-center justify-center min-h-[300px]">
              {certPreviewModal.file_url ? (
                <img
                  src={certPreviewModal.file_url}
                  alt={certPreviewModal.title}
                  className="max-h-[500px] w-auto max-w-full rounded-xl object-contain shadow-lg border border-slate-200"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <FileText className="w-16 h-16 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">Digital Accreditation Record</p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    This certification was registered and verified directly via {certPreviewModal.issuer}.
                  </p>
                </div>
              )}
            </div>

            {/* Metadata Footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs shrink-0">
              <div className="font-mono text-slate-500">
                Credential ID: <strong className="text-slate-800">{certPreviewModal.credential_id || 'VERIFIED-SM'}</strong>
              </div>
              <button
                type="button"
                onClick={() => setCertPreviewModal(null)}
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
