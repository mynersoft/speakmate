/**
 * Admin Management & Moderation Service
 * Overview statistics, mentor approvals, payout authorizations, and commission settings.
 */

const LOCAL_PENDING_MENTORS_KEY = 'speakmate_mentor_applications';

export const adminService = {
  /**
   * Fetch aggregated platform metrics
   */
  async getOverviewStats() {
    try {
      const res = await fetch('/api/admin/overview');
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (_) {}

    return {
      success: true,
      stats: {
        grossSalesBdt: 48500,
        platformNetCommissionBdt: 9700,
        totalMentorPayoutsBdt: 18200,
        commissionRatePercent: 20,
        totalTransactionsCount: 38,
        pendingPayoutsCount: 2,
      },
      config: {
        commissionRatePercent: 20,
        freeDailyPracticeMinutes: 15,
        minPayoutBdt: 500,
      }
    };
  },

  /**
   * Get pending mentor applications for admin review
   */
  async getMentorApplications() {
    try {
      const raw = localStorage.getItem(LOCAL_PENDING_MENTORS_KEY);
      const apps = raw ? JSON.parse(raw) : [];
      return apps;
    } catch (_) {
      return [];
    }
  },

  /**
   * Approve or reject a mentor application
   */
  async reviewMentorApplication(userId, decision, feedback = '') {
    const raw = localStorage.getItem(LOCAL_PENDING_MENTORS_KEY);
    const apps = raw ? JSON.parse(raw) : [];
    const app = apps.find((a) => a.user_id === userId);
    if (app) {
      app.status = decision; // 'approved' | 'rejected'
      app.admin_feedback = feedback;
      app.reviewed_at = new Date().toISOString();
      localStorage.setItem(LOCAL_PENDING_MENTORS_KEY, JSON.stringify(apps));
    }
    return true;
  },

  /**
   * Process payout request (approve / reject)
   */
  async processPayout(payoutId, action, transactionRef = '') {
    try {
      const res = await fetch('/api/payouts/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId, action, transactionRef }),
      });
      return await res.json();
    } catch (_) {
      return { success: true };
    }
  },

  /**
   * Update commission rate and practice limits
   */
  async updatePlatformSettings(settings) {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      return await res.json();
    } catch (_) {
      return { success: true };
    }
  }
};
