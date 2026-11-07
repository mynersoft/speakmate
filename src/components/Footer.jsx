import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Video, ShieldCheck, Lock, Heart, GraduationCap, DollarSign, Crown } from 'lucide-react';

export default function Footer() {
  const location = useLocation();

  // Hide footer on active video call or live classroom
  if (location.pathname.startsWith('/call/') || location.pathname.startsWith('/classroom/')) {
    return null;
  }

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Brand info */}
          <div className="space-y-4 md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Video className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Speak<span className="text-blue-500">Mate</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The complete English learning platform. Practice conversations with community members, join mentor live classes, and earn through teaching.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
              <span className="inline-flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                Zero Recording
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified Community
              </span>
            </div>
          </div>

          {/* Practice */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Practice
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/matching" className="hover:text-white transition-colors">
                  Start Practice Call
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Speaking Lounge
                </Link>
              </li>
              <li>
                <Link to="/members" className="hover:text-white transition-colors">
                  Active Members
                </Link>
              </li>
              <li>
                <Link to="/tools" className="hover:text-white transition-colors">
                  Daily Speaking Topics
                </Link>
              </li>
            </ul>
          </div>

          {/* Learn & Earn */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Learn & Earn
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">
                  Course Marketplace
                </Link>
              </li>
              <li>
                <Link to="/classes" className="hover:text-white transition-colors">
                  Live Workshops
                </Link>
              </li>
              <li>
                <Link to="/mentors" className="hover:text-white transition-colors">
                  Find a Mentor
                </Link>
              </li>
              <li>
                <Link to="/mentor/apply" className="hover:text-white transition-colors text-amber-400 font-semibold">
                  Become a Mentor
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors">
                  Membership Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Legal */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Community & Safety
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="/#how-it-works" className="hover:text-white transition-colors">
                  How Matching Works
                </a>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors text-slate-500">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SpeakMate. All rights reserved. Practice • Learn • Earn.</p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-slate-400">Terms</Link>
            <Link to="/privacy" className="hover:text-slate-400">Privacy</Link>
            <span className="inline-flex items-center gap-1 text-slate-600">
              Built for English learners <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
