import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Video, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Headphones, 
  FastForward, 
  Globe2, 
  Clock,
  BookOpen,
  DollarSign,
  Crown,
  GraduationCap,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="space-y-24 pb-20 animate-fade-in">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 lg:pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-8 shadow-sm">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Practice • Learn • Earn • The Complete English Platform</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
          Practice English. <br className="hidden sm:block" />
          Connect with Mentors. <span className="text-blue-600">Master Fluency.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The hybrid platform where members practice 1-on-1 conversations, learn through mentor-led masterclasses and courses, and approved mentors earn income teaching students.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={user ? "/matching" : "/register"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Sparkles className="w-5 h-5" />
            {user ? "Start Practicing Now" : "Start Practicing Free"}
          </Link>

          <Link
            to="/courses"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-base hover:bg-slate-50 transition-colors"
          >
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Explore Courses & Classes
          </Link>

          <Link
            to="/mentor/apply"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-md transition-all"
          >
            <DollarSign className="w-4 h-4" />
            Teach & Earn
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>15m Daily Free Speaking</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Zero Call Recording</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>bKash, Nagad & Rocket</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Certified Mentors</span>
          </div>
        </div>
      </section>

      {/* THREE PILLARS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            A Complete Learning Ecosystem
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built On Three Pillars
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Pillar 1: Practice */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4 hover:shadow-xl transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
                Pillar 1
              </span>
              <h4 className="text-2xl font-bold text-slate-900">PRACTICE</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Automated 1-on-1 audio & video conversations with approved language learners. Skip unanswering partners seamlessly, view prompt cards, and speak without fear.
              </p>
            </div>
            <Link
              to="/matching"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              Start Practicing <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Pillar 2: Learn */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4 hover:shadow-xl transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block">
                Pillar 2
              </span>
              <h4 className="text-2xl font-bold text-slate-900">LEARN</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Explore recorded courses, attend scheduled live workshops, master IELTS cue cards, and unlock verifiable digital completion certificates.
              </p>
            </div>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              Browse Course Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Pillar 3: Earn */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4 hover:shadow-xl transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">
                Pillar 3
              </span>
              <h4 className="text-2xl font-bold text-slate-900">EARN</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Qualified English teachers can apply as approved mentors. Host paid workshops, sell video courses, and receive direct MFS payouts (bKash/Nagad/Bank).
              </p>
            </div>
            <Link
              to="/mentor/apply"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              Mentor Application <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* BANGLADESH PAYMENT GATEWAYS HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Frictionless Local Payments
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Pay Easily via bKash, Nagad, Rocket & Cards
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              No international credit card hurdles. Purchase course enrollments, book live workshop seats, or upgrade to Premium membership using your everyday Bangladesh mobile wallet.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full sm:w-auto shrink-0">
            {['bKash', 'Nagad', 'Rocket', 'Visa / MC'].map((gw, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-center font-bold text-xs text-white">
                {gw}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="bg-blue-600 text-white rounded-3xl p-10 sm:p-14 shadow-2xl space-y-4 max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Speak Fluent English with Confidence?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto">
            Join thousands of active English learners. Practice free today with zero upfront payment.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-block px-8 py-4 rounded-xl bg-white text-blue-700 font-bold text-sm shadow-md hover:bg-blue-50 transition-all hover:scale-105 active:scale-95"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
