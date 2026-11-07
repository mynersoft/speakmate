import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Radio, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { classService } from '../services/classService';
import { useAuth } from '../context/AuthContext';
import CheckoutModal from '../components/CheckoutModal';

export default function LiveClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('all'); // 'all' | 'free' | 'paid'
  const [level, setLevel] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedClassForCheckout, setSelectedClassForCheckout] = useState(null);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await classService.getLiveClasses({ type, level, search });
      setClasses(data);
    } catch (err) {
      console.error('Error fetching live classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [type, level, search]);

  const handleRegisterClick = async (cls) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (cls.is_free) {
      try {
        await classService.registerForClass(user.id, cls.id);
        fetchClasses();
        alert('You have registered successfully! The class will appear in My Classes.');
      } catch (err) {
        alert(err.message || 'Registration failed.');
      }
    } else {
      setSelectedClassForCheckout(cls);
    }
  };

  const handlePaymentSuccess = async (receipt) => {
    if (selectedClassForCheckout && user) {
      await classService.registerForClass(user.id, selectedClassForCheckout.id, receipt.transactionId);
      setSelectedClassForCheckout(null);
      fetchClasses();
      alert('Admission purchased and verified! See you in class.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Hero Header */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-12 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-semibold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
            Interactive Mentor Sessions
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Live English Classes & Workshops
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Practice in real-time small groups led by approved mentors. Join free community jam sessions or premium intensive speaking masterclasses.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search topic or mentor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setType('all')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              type === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Classes
          </button>
          <button
            onClick={() => setType('free')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              type === 'free' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Free Workshops
          </button>
          <button
            onClick={() => setType('paid')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              type === 'paid' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Paid Masterclasses
          </button>
        </div>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-72 bg-slate-200/60 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No scheduled classes found</h3>
          <p className="text-xs text-slate-500 mt-1">Check back soon for newly published mentor sessions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => {
            const isRegistered = user ? classService.isUserRegistered(user.id, cls.id) : false;
            const scheduledDate = new Date(cls.scheduled_at);
            const isFull = cls.enrolled_count >= cls.max_capacity;

            return (
              <div
                key={cls.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img src={cls.thumbnail_url} alt={cls.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-slate-900/80 text-white backdrop-blur-md">
                        {cls.topic}
                      </span>
                      {cls.is_free ? (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-emerald-600 text-white">
                          FREE
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-blue-600 text-white">
                          ৳{cls.price_bdt} BDT
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        {scheduledDate.toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })} at {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
                      {cls.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {cls.description}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-600 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{cls.duration_minutes} mins</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{cls.enrolled_count} / {cls.max_capacity} seats</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  {isRegistered ? (
                    <Link
                      to={`/classroom/${cls.id}`}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
                    >
                      <Radio className="w-4 h-4 animate-pulse" />
                      Enter Live Classroom
                    </Link>
                  ) : isFull ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed"
                    >
                      Class is Full
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegisterClick(cls)}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      {cls.is_free ? 'Register for Free' : `Buy Admission (৳${cls.price_bdt})`}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Checkout Modal */}
      {selectedClassForCheckout && (
        <CheckoutModal
          isOpen={Boolean(selectedClassForCheckout)}
          onClose={() => setSelectedClassForCheckout(null)}
          item={{
            id: selectedClassForCheckout.id,
            title: selectedClassForCheckout.title,
            price_bdt: selectedClassForCheckout.price_bdt,
            purpose: 'class',
            mentorId: selectedClassForCheckout.mentor_id,
          }}
          user={user}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
