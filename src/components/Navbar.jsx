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
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { saveSupabaseConfig, isSupabaseConfigured } from '../lib/supabase';

export default function Navbar() {
  const { user, profile, isApproved, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState('');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (!supabaseUrlInput || !supabaseKeyInput) return;
    saveSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
  };

  const isCallPage = location.pathname.startsWith('/call/');

  if (isCallPage) {
    // Keep minimal top bar during active full-screen video call
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Video className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  Speak<span className="text-blue-600">Mate</span>
                </span>
                <span className="text-[10px] -mt-1 font-medium text-slate-500 uppercase tracking-wider">
                  Invite-Only English
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to="/" 
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Home
              </Link>

              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === '/dashboard' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Dashboard
                  </Link>

                  <Link 
                    to="/matching" 
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-600/30 transition-all hover:shadow-md"
                  >
                    <Sparkles className="w-4 h-4" />
                    Start Practicing
                  </Link>
                </>
              ) : (
                <>
                  <a href="/#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                    How It Works
                  </a>
                  <a href="/#safety" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                    Safety & Rules
                  </a>
                </>
              )}
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
                  {/* Member Badge */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Member
                  </span>

                  {/* Profile Menu */}
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs border border-blue-200">
                      {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                      {profile?.display_name || user.email?.split('@')[0]}
                    </span>
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
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all"
                  >
                    Join Community
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-2">
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
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-700"
            >
              Home
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base font-medium text-slate-700"
                >
                  Dashboard
                </Link>
                <Link
                  to="/matching"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium text-center"
                >
                  Start Practicing
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base font-medium text-slate-700"
                >
                  My Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base font-medium text-slate-700"
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left py-2 text-base font-medium text-rose-600"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-medium text-slate-700 border border-slate-300 rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-semibold text-white bg-blue-600 rounded-lg"
                >
                  Join Community
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
                <h3 className="text-lg font-bold text-slate-900">Connect Supabase</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
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
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-xs"
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
