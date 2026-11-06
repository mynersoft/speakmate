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
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="space-y-24 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 lg:pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-8 shadow-sm">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Instant Access • 1-on-1 English Practice Community</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
          Practice English With <span className="text-blue-600">Real People</span>.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Overcome spoken fluency hurdles through private, 1-on-1 audio and video conversations with learners and speakers around the world.
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

          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-base hover:bg-slate-50 transition-colors"
          >
            How SpeakMate Works
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Community Approved</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Zero Call Recording</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>End-to-End WebRTC P2P</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Instant Next Partner</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
            Structured Workflow
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How The Practice Engine Works
          </h3>
          <p className="mt-3 text-slate-600 text-sm">
            No public roulette, no stranger chaos. Every conversation is consented, verified, and automated.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold text-lg flex items-center justify-center mb-4 border border-blue-100">
              1
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">
              Create Free Account
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Register in seconds with your email and name. Get instant access to practice matching with zero waiting or approval delays.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold text-lg flex items-center justify-center mb-4 border border-blue-100">
              2
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">
              Start Matching
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Click Start Practicing. Our server-side engine atomically selects an available online partner and dispatches a call invitation.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold text-lg flex items-center justify-center mb-4 border border-blue-100">
              3
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">
              15s Consent & Connect
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Both members consent before connecting. If the recipient doesn't answer within 15 seconds, SpeakMate immediately rings the next partner.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold text-lg flex items-center justify-center mb-4 border border-blue-100">
              4
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">
              Next Partner / Skip
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ready for a new conversation? Click "Next Partner" to safely terminate the current stream and automatically connect with another speaker.
            </p>
          </div>

        </div>
      </section>

      {/* CORE FEATURES */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
              Built For Serious Learners
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              A Safer, Smarter Way To Speak
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-6">
                <Video className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold mb-2">True Browser WebRTC</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Direct peer-to-peer audio and video streaming. Video feeds never pass through intermediate recording servers, ensuring low latency and privacy.
              </p>
            </div>

            <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-6">
                <FastForward className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold mb-2">Automatic Skip Engine</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                No awkward disconnects or manual loops. One click cleanly tears down WebRTC tracks, excludes the recent partner, and dials the next learner.
              </p>
            </div>

            <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-6">
                <Headphones className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold mb-2">Audio-Only Option</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Feel camera shy today? Switch your camera off anytime and practice spoken conversation in clean audio-only mode with full microphone clarity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRIVACY & SAFETY SECTION */}
      <section id="safety" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                Community Safety First
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
                Zero Public Strangers. Strict Anti-Harassment.
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Unlike public anonymous chat sites, SpeakMate is an invite-only language exchange network. Every participant is a verified member who agreed to our educational code of conduct.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Zero Call Recording</h5>
                    <p className="text-xs text-slate-500">No media is recorded, saved, or analyzed. Your conversations remain strictly private between you and your partner.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Protected Profile Privacy</h5>
                    <p className="text-xs text-slate-500">Your email, credentials, and private details are never exposed. Only your chosen display name, country, and English level are shown.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Instant One-Click Block & Report</h5>
                    <p className="text-xs text-slate-500">If anyone violates community rules, block them immediately to permanently prevent future matching, and alert moderation.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-blue-600" />
                Community Code of Conduct
              </h4>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span><strong>English Only:</strong> Conversations must remain focused on English language practice and cultural exchange.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span><strong>Mutual Respect:</strong> Zero tolerance for harassment, discrimination, inappropriate gestures, or offensive speech.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span><strong>Educational Environment:</strong> Be supportive and patient with learners of differing proficiency levels.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span><strong>Privacy Protection:</strong> Never solicit personal phone numbers, passwords, financial info, or social handles.</span>
                </li>
              </ul>

              <div className="mt-6 pt-4 border-t border-slate-200 text-center">
                <Link
                  to="/terms"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Read Full Community Standards →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-10 sm:p-14 text-white shadow-xl">
          <h3 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Ready To Boost Your English Fluency?
          </h3>
          <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Connect with dedicated language learners worldwide. Real conversations, zero cost on our free tier, maximum privacy.
          </p>
          <Link
            to={user ? "/matching" : "/register"}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-blue-700 font-bold text-sm shadow-md hover:bg-blue-50 transition-colors"
          >
            {user ? "Enter Practice Lounge" : "Apply For Membership"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
