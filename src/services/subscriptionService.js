/**
 * Subscription & Membership Service
 * Free vs Premium tiers, daily practice time limits, and plan management.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const MEMBERSHIP_PLANS = [
  {
    id: 'plan-free',
    slug: 'free',
    name: 'Free Member',
    price_bdt: 0,
    price_usd: 0,
    billing_cycle: 'free',
    daily_practice_minutes: 15,
    is_unlimited: false,
    priority_matching: false,
    badge: 'Free Tier',
    description: 'Great for casual learners building their daily English conversation habit.',
    features: [
      '15 minutes daily English speaking practice',
      'Instant partner matching with community members',
      'Access to open community live classes',
      'Free foundation courses and learning materials',
      'Standard matching queue'
    ]
  },
  {
    id: 'plan-premium-monthly',
    slug: 'premium-monthly',
    name: 'Premium Monthly',
    price_bdt: 599,
    price_usd: 5.99,
    billing_cycle: 'monthly',
    daily_practice_minutes: 0, // unlimited
    is_unlimited: true,
    priority_matching: true,
    badge: 'Most Flexible',
    description: 'Unlimited practice and priority queue for fast-track fluency.',
    features: [
      'Unlimited daily English speaking minutes',
      'Priority matching (pair 3x faster)',
      'Access to exclusive mentor masterclasses',
      'Course completion certificates with verification ID',
      'Speaking streak badges & VIP profile ring',
      'Zero ads & uninterrupted video/audio calls'
    ]
  },
  {
    id: 'plan-premium-quarterly',
    slug: 'premium-quarterly',
    name: 'Premium Quarterly',
    price_bdt: 1499,
    price_usd: 14.99,
    billing_cycle: 'quarterly',
    daily_practice_minutes: 0,
    is_unlimited: true,
    priority_matching: true,
    badge: 'Popular • Save 15%',
    popular: true,
    description: 'Recommended for IELTS aspirants and job interview candidates.',
    features: [
      'Everything in Premium Monthly',
      '15% discount on 3-month commitment',
      'Priority partner selection by English level',
      'Direct mentor Q&A in group conversation clubs',
      'Personalized vocabulary flashcards'
    ]
  },
  {
    id: 'plan-premium-yearly',
    slug: 'premium-yearly',
    name: 'Premium Annual',
    price_bdt: 4499,
    price_usd: 44.99,
    billing_cycle: 'yearly',
    daily_practice_minutes: 0,
    is_unlimited: true,
    priority_matching: true,
    badge: 'Best Value • Save 35%',
    description: '1 full year of fluency mastery with our highest discount.',
    features: [
      'Everything in Premium Quarterly',
      '35% annual savings (Only ~374 BDT/mo)',
      'Permanent VIP Fluency Badge',
      '1 Free 1-on-1 strategy session with a top mentor',
      'Lifetime progress and audio transcript history'
    ]
  }
];

const LOCAL_SUB_KEY = 'speakmate_user_subscription';
const PRACTICE_USAGE_KEY = 'speakmate_practice_usage';

export const subscriptionService = {
  getPlans() {
    return MEMBERSHIP_PLANS;
  },

  /**
   * Get user active subscription
   */
  async getUserSubscription(userId) {
    if (!userId) return { plan: MEMBERSHIP_PLANS[0], isPremium: false };

    try {
      const raw = localStorage.getItem(`${LOCAL_SUB_KEY}_${userId}`);
      if (raw) {
        const sub = JSON.parse(raw);
        // check expiry
        if (sub.expires_at && new Date(sub.expires_at) < new Date()) {
          return { plan: MEMBERSHIP_PLANS[0], isPremium: false, expired: true };
        }
        return sub;
      }
    } catch (_) {}

    return {
      plan: MEMBERSHIP_PLANS[0],
      isPremium: false,
      status: 'active',
      started_at: new Date().toISOString(),
    };
  },

  /**
   * Activate or upgrade subscription
   */
  async activateSubscription(userId, planSlug, paymentId) {
    const plan = MEMBERSHIP_PLANS.find((p) => p.slug === planSlug) || MEMBERSHIP_PLANS[1];
    const durationDays = plan.billing_cycle === 'yearly' ? 365 : plan.billing_cycle === 'quarterly' ? 90 : 30;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    const subscriptionData = {
      plan,
      isPremium: plan.slug !== 'free',
      status: 'active',
      payment_id: paymentId,
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    };

    localStorage.setItem(`${LOCAL_SUB_KEY}_${userId}`, JSON.stringify(subscriptionData));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('user_subscriptions').upsert({
          user_id: userId,
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          payment_id: paymentId,
        });
      } catch (_) {}
    }

    return subscriptionData;
  },

  /**
   * Check daily practice allowance (minutes used today vs allowance)
   */
  async checkPracticeAllowance(userId) {
    const sub = await this.getUserSubscription(userId);
    if (sub.isPremium) {
      return { allowed: true, remainingMinutes: 999999, isUnlimited: true };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const key = `${PRACTICE_USAGE_KEY}_${userId}_${todayStr}`;
    const usedMinutes = parseInt(localStorage.getItem(key) || '0', 10);
    const limit = sub.plan.daily_practice_minutes || 15;
    const remaining = Math.max(0, limit - usedMinutes);

    return {
      allowed: remaining > 0,
      remainingMinutes: remaining,
      usedMinutes,
      dailyLimit: limit,
      isUnlimited: false,
    };
  },

  /**
   * Record practice minutes
   */
  recordPracticeTime(userId, minutes) {
    if (!userId || !minutes) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const key = `${PRACTICE_USAGE_KEY}_${userId}_${todayStr}`;
    const usedMinutes = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, String(usedMinutes + minutes));
  }
};
