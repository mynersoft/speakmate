import React, { useState, useEffect } from 'react';
import { 
  User, 
  Globe, 
  Award, 
  ShieldCheck, 
  Clock, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';
import { validateDisplayName } from '../utils/validation';

export default function Profile() {
  const { user, profile, isApproved, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    displayName: '',
    avatarUrl: '',
    country: 'United States',
    englishLevel: 'Intermediate',
    bio: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.display_name || '',
        avatarUrl: profile.avatar_url || '',
        country: profile.country || 'Global',
        englishLevel: profile.english_level || 'Intermediate',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nameErr = validateDisplayName(formData.displayName);
    if (nameErr) {
      setError(nameErr);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await profileService.updateProfile(user.id, formData);
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-slate-100">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-3xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            {formData.avatarUrl ? (
              <img 
                src={formData.avatarUrl} 
                alt="Avatar" 
                className="w-full h-full rounded-3xl object-cover" 
              />
            ) : (
              formData.displayName?.charAt(0).toUpperCase() || 'U'
            )}
          </div>

          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-slate-900">
              {formData.displayName || 'Member Profile'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Member ID: <span className="font-mono text-slate-400">{user?.id?.substring(0, 16)}...</span>
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Active Member • Ready to Practice
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Profile successfully updated!</span>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Display Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Display Name
              </label>
              <input
                type="text"
                name="displayName"
                required
                value={formData.displayName}
                onChange={handleChange}
                placeholder="Your preferred name or nickname"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Visible to your English conversation partners.
              </p>
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="e.g. Germany, Colombia, South Korea"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* English Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                English Proficiency Level
              </label>
              <select
                name="englishLevel"
                value={formData.englishLevel}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Beginner">Beginner (A1-A2)</option>
                <option value="Intermediate">Intermediate (B1-B2)</option>
                <option value="Advanced">Advanced (C1)</option>
                <option value="Fluent">Fluent / Native (C2)</option>
              </select>
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Avatar Image URL (Optional)
              </label>
              <input
                type="url"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Bio / Interests */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Conversation Interests & Bio
            </label>
            <textarea
              rows={3}
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell partners what you like discussing (e.g. Technology, literature, traveling, culinary arts)..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
