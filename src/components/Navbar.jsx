import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Video, 
  User, 
  LogOut, 
  Settings, 
  ShieldCheck, 
  Clock, 
  Menu, 
  X,
  Sparkles,
  Database,
  BookOpen,
  GraduationCap,
  DollarSign,
  Crown,
  Bell,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { saveSupabaseConfig, isSupabaseConfigured } from '../lib/supabase';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [learnDropdown, setLearnDropdown] = useState(false);
  const [earnDropdown, setEarnDropdown] = useState(false);

  const [supabaseUrlInput, setSupabaseUrlInput] = useState('');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');

  const notifications = [
    { id: 1, title: 'Welcome to SpeakMate!', text: 'Start with 15 minutes of free daily conversation practice.', time: 'Just now' },
    { id: 2, title: 'New Live Class Scheduled', text: 'Live Fluency Speed Jam starts in 2 hours with Sarah Johnson.', time: '1h ago' }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (!supabaseUrlInput || !supabaseKeyInput) return;
    saveSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
  };

  const isCallPage = location.pathname.startsWith('/call/') || location.pathname.startsWith('/classroom/');

  if (isCallPage) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Video className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  Speak<span className="text-blue-600">Mate</span>
                </span>
                <span className="text-[9px] -mt-1 font-semibold text-slate-400 uppercase tracking-widest">
                  Practice • Learn • Earn
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              
              {/* Practice */}
              <Link 
                to="/matching" 
                className={`text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 ${
                  location.pathname === '/matching' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                Practice
              </Link>

              {/* Learn Dropdown */}
              <div className="relative group">
                <button
                  onMouseEnter={() => setLearnDropdown(true)}
                  onClick={() => setLearnDropdown(!learnDropdown)}
                  className={`text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 py-2 ${
                    location.pathname.startsWith('/courses') || location.pathname.startsWith('/classes') || location.pathname === '/tools'
                      ? 'text-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  Learn
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {learnDropdown && (
                  <div
                    onMouseLeave={() => setLearnDropdown(false)}
                    className="absolute top-full left-0 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 space-y-1 animate-fade-in"
                  >
                    <Link
                      to="/courses"
                      onClick={() => setLearnDropdown(false)}
                      className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                    >
                      Course Marketplace
                    </Link>
                    <Link
                      to="/classes"
                      onClick={() => setLearnDropdown(false)}
                      className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                    >
                      Live Classes & Workshops
                    </Link>
                    <Link
                      to="/tools"
                      onClick={() => setLearnDropdown(false)}
                      className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                    >
                      Speaking Topics & Quiz
                    </Link>
                    {user && (
                      <>
                        <div className="border-t border-slate-100 my-1"></div>
                        <Link
                          to="/my-courses"
                          onClick={() => setLearnDropdown(false)}
                          className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                        >
                          My Enrolled Courses
                        </Link>
                        <Link
                          to="/my-classes"
                          onClick={() => setLearnDropdown(false)}
                          className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                        >
                          My Scheduled Classes
                        </Link>
                        <Link
                          to="/progress"
                          onClick={() => setLearnDropdown(false)}
                          className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                        >
                          Fluency Progress & XP
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Earn Dropdown */}
              <div className="relative group">
                <button
                  onMouseEnter={() => setEarnDropdown(true)}
                  onClick={() => setEarnDropdown(!earnDropdown)}
                  className={`text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 py-2 ${
                    location.pathname.startsWith('/mentor') || location.pathname === '/mentors'
                      ? 'text-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  Earn
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {earnDropdown && (
                  <div
                    onMouseLeave={() => setEarnDropdown(false)}
                    className="absolute top-full left-0 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 space-y-1 animate-fade-in"
                  >
                    <Link
                      to="/mentors"
                      onClick={() => setEarnDropdown(false)}
                      className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                    >
                      Mentor Directory
                    </Link>
                    <Link
                      to="/mentor/apply"
                      onClick={() => setEarnDropdown(false)}
                      className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                    >
                      Become a Mentor
                    </Link>
                    {user && (
                      <Link
                        to="/mentor/dashboard"
                        onClick={() => setEarnDropdown(false)}
                        className="block px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50/50 hover:bg-blue-50"
                      >
                        Mentor Studio & Earnings
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Pricing */}
              <Link 
                to="/pricing" 
                className={`text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 ${
                  location.pathname === '/pricing' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                Pricing
              </Link>

              {/* Admin Portal */}
              <Link 
                to="/admin" 
                className={`text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 ${
                  location.pathname === '/admin' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="hidden md:flex items-center gap-3">
              
              {!isSupabaseConfigured && (
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                  title="Configure Supabase Connection"
                >
                  <Database className="w-3.5 h-3.5 text-amber-600" />
                  Connect Database
                </button>
              )}

              {user ? (
                <div className="flex items-center gap-3">
                  
                  {/* Notifications Bell */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors relative"
                    >
                      <Bell className="w-4 h-4" />
                      <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5"></span>
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 space-y-3 z-50 animate-fade-in">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="font-bold text-xs text-slate-800">Notifications</span>
                          <span className="text-[10px] text-blue-600 font-semibold cursor-pointer">Mark all read</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          {notifications.map((n) => (
                            <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 transition-colors space-y-0.5">
                              <h5 className="font-bold text-slate-900">{n.title}</h5>
                              <p className="text-slate-500 text-[11px] leading-snug">{n.text}</p>
                              <span className="text-[10px] text-slate-400 block pt-1">{n.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Menu */}
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs border border-blue-200">
                      {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                      {profile?.display_name || user.email?.split('@')[0]}
                    </span>
                  </Link>

                  <Link
                    to="/dashboard"
                    className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Dashboard"
                  >
                    <Clock className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/settings"
                    className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Log out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
                  >
                    Join Free
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 text-xs font-semibold">
            <Link
              to="/matching"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 rounded-lg bg-blue-600 text-white text-center font-bold"
            >
              Start Practice Call
            </Link>
            <Link to="/courses" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 text-slate-700 hover:bg-slate-50">
              Courses Marketplace
            </Link>
            <Link to="/classes" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 text-slate-700 hover:bg-slate-50">
              Live Classes
            </Link>
            <Link to="/mentors" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 text-slate-700 hover:bg-slate-50">
              Mentors Directory
            </Link>
            <Link to="/tools" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 text-slate-700 hover:bg-slate-50">
              Speaking Topics & Quiz
            </Link>
            <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 text-slate-700 hover:bg-slate-50">
              Pricing & Plans
            </Link>
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 text-slate-700 hover:bg-slate-50">
              Admin Portal
            </Link>

            {user ? (
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 text-slate-700">
                  Dashboard
                </Link>
                <Link to="/my-courses" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 text-slate-700">
                  My Courses
                </Link>
                <Link to="/my-classes" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 text-slate-700">
                  My Classes
                </Link>
                <Link to="/mentor/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 text-blue-600 font-bold">
                  Mentor Studio
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full text-left py-2 px-3 text-rose-600 font-bold"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center border border-slate-300 rounded-lg text-slate-700"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center bg-blue-600 text-white rounded-lg font-bold"
                >
                  Join Free
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Supabase Connection Setup Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Connect Supabase</h3>
              </div>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-600">
              Enter your Supabase project credentials to enable authentication, real-time presence, and WebRTC video matching.
            </p>

            <form onSubmit={handleSaveConfig} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project URL (https://xxxx.supabase.co)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://xyzproject.supabase.co"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Anon / Public Key
                </label>
                <input
                  type="text"
                  required
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Save & Reload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
