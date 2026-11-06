import React, { useState } from 'react';
import { Globe, Award, ShieldAlert, Ban, Flag, CheckCircle2 } from 'lucide-react';
import { callService } from '../services/callService';
import { useAuth } from '../context/AuthContext';

export default function PartnerCard({ partner, onBlock, onReport }) {
  const { user } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate conduct');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

  if (!partner) return null;

  const handleBlockUser = async () => {
    if (!user || isBlocking) return;
    if (window.confirm(`Are you sure you want to block ${partner.display_name}? You will never be matched with them again.`)) {
      setIsBlocking(true);
      try {
        await callService.blockUser(user.id, partner.partner_id || partner.id);
        if (onBlock) onBlock(partner.partner_id || partner.id);
      } catch (err) {
        console.error('Error blocking user:', err);
      } finally {
        setIsBlocking(false);
      }
    }
  };

  const handleSendReport = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      await callService.reportUser(
        user.id,
        partner.partner_id || partner.id,
        reportReason,
        reportDetails
      );
      setReportSubmitted(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSubmitted(false);
        if (onReport) onReport();
      }, 1500);
    } catch (err) {
      console.error('Report error:', err);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
              {partner.avatar_url ? (
                <img 
                  src={partner.avatar_url} 
                  alt={partner.display_name} 
                  className="w-full h-full rounded-2xl object-cover" 
                />
              ) : (
                partner.display_name?.charAt(0).toUpperCase() || 'M'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {partner.display_name || 'English Partner'}
                </h3>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Online Member" />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  {partner.country || 'Global'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  <Award className="w-3 h-3 text-blue-500" />
                  {partner.english_level || 'Intermediate'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowReportModal(true)}
              className="p-2 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-50 transition-colors"
              title="Report User"
            >
              <Flag className="w-4 h-4" />
            </button>
            <button
              onClick={handleBlockUser}
              disabled={isBlocking}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              title="Block User"
            >
              <Ban className="w-4 h-4" />
            </button>
          </div>
        </div>

        {partner.bio && (
          <p className="mt-4 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            "{partner.bio}"
          </p>
        )}
      </div>

      {/* Safety Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-900">Report Member</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Help keep SpeakMate safe. All reports are immediately reviewed by our moderation team.
            </p>

            {reportSubmitted ? (
              <div className="p-6 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">Report Submitted</p>
                <p className="text-xs text-slate-500 mt-1">Thank you for helping keep our community respectful.</p>
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reason
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Inappropriate conduct">Inappropriate / Disrespectful Conduct</option>
                    <option value="Not speaking English">Refusal to practice English</option>
                    <option value="Harassment or Hate speech">Harassment or Hate Speech</option>
                    <option value="Commercial advertising/spam">Spam / Commercial Advertising</option>
                    <option value="Suspicious behavior">Suspicious / Impersonation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Additional Context (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Briefly describe what happened..."
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
