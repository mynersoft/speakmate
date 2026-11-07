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
  Smartphone
} from 'lucide-react';
import { mentorService } from '../services/mentorService';
import { classService } from '../services/classService';
import { courseService } from '../services/courseService';
import { useAuth } from '../context/AuthContext';

export default function MentorDashboard() {
  const { user, profile } = useAuth();

  const [activeTab, setActiveTab] = useState('classes'); // 'classes' | 'courses' | 'payouts'
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

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
  };

  useEffect(() => {
    loadData();
  }, [user, profile]);

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
      <div className="border-b border-slate-200 flex items-center gap-6">
        <button
          onClick={() => setActiveTab('classes')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
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
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'courses'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          My Published Courses ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('payouts')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
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

      {/* TAB 3: PAYOUTS */}
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
    </div>
  );
}
