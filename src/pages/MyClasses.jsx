import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Video, Radio, ArrowRight, X } from 'lucide-react';
import { classService } from '../services/classService';
import { useAuth } from '../context/AuthContext';

export default function MyClasses() {
  const { user } = useAuth();
  const [myClasses, setMyClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyClasses = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await classService.getMyClasses(user.id);
      setMyClasses(data);
    } catch (err) {
      console.error('Error fetching registered classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyClasses();
  }, [user]);

  const handleCancel = async (classId) => {
    if (!confirm('Are you sure you want to cancel this registration?')) return;
    await classService.cancelRegistration(user.id, classId);
    fetchMyClasses();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Live Classes & Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access your registered mentor live classes, interactive workshops, and group speaking jams.
          </p>
        </div>

        <Link
          to="/classes"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Calendar className="w-4 h-4" />
          Browse Live Schedule
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((n) => (
            <div key={n} className="h-56 bg-slate-200/60 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : myClasses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Radio className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Scheduled Classes Yet</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Register for upcoming free conversation jams or reserve a seat in mentor-led masterclasses.
          </p>
          <div className="pt-2">
            <Link
              to="/classes"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
            >
              Browse Classes
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myClasses.map((item) => {
            const scheduledDate = new Date(item.scheduled_at);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                      <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                      Admission Confirmed
                    </span>

                    <button
                      onClick={() => handleCancel(item.class_id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                      title="Cancel Registration"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 leading-snug">
                    {item.class_title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>
                        {scheduledDate.toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })} at {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{item.duration_minutes || 45} minutes duration</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/classroom/${item.class_id}`}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20"
                >
                  <Video className="w-4 h-4" />
                  Enter Live Classroom
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
