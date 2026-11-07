import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Crown, 
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { subscriptionService, MEMBERSHIP_PLANS } from '../services/subscriptionService';
import { useAuth } from '../context/AuthContext';
import CheckoutModal from '../components/CheckoutModal';

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentSub, setCurrentSub] = useState(null);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);

  useEffect(() => {
    const fetchSub = async () => {
      if (user) {
        const sub = await subscriptionService.getUserSubscription(user.id);
        setCurrentSub(sub);
      }
    };

    fetchSub();
  }, [user]);

  const handlePlanSelect = (plan) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (plan.slug === 'free') {
      alert('You are already enjoying Free Community Membership.');
      return;
    }

    setSelectedPlanForCheckout(plan);
  };

  const handlePaymentSuccess = async (receipt) => {
    if (selectedPlanForCheckout && user) {
      await subscriptionService.activateSubscription(user.id, selectedPlanForCheckout.slug, receipt.transactionId);
      setSelectedPlanForCheckout(null);
      const updated = await subscriptionService.getUserSubscription(user.id);
      setCurrentSub(updated);
      alert(`Congratulations! You have upgraded to ${selectedPlanForCheckout.name} with unlimited daily practice.`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fade-in">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
          <Crown className="w-3.5 h-3.5 text-amber-500" />
          Simple, Transparent English Fluency Plans
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Invest in Your Speaking Fluency
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Start free with daily speaking practice, or unlock unlimited minutes, priority partner matching, and mentor masterclasses.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {MEMBERSHIP_PLANS.map((plan) => {
          const isCurrent = currentSub?.plan?.slug === plan.slug;

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative ${
                plan.popular
                  ? 'bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-900 text-white shadow-2xl ring-2 ring-blue-500 scale-105 z-10'
                  : 'bg-white text-slate-900 border border-slate-200 shadow-sm hover:shadow-lg'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md ${
                    plan.popular
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-blue-600 text-white'
                  }`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className={`text-lg font-bold ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-xs mt-1 leading-relaxed ${plan.popular ? 'text-slate-300' : 'text-slate-500'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="pt-2 pb-4 border-b border-slate-100/20">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black">
                      {plan.price_bdt === 0 ? 'FREE' : `৳${plan.price_bdt}`}
                    </span>
                    {plan.price_bdt > 0 && (
                      <span className={`text-xs font-semibold ${plan.popular ? 'text-slate-300' : 'text-slate-500'}`}>
                        BDT / {plan.billing_cycle === 'yearly' ? 'year' : plan.billing_cycle === 'quarterly' ? '3 mos' : 'month'}
                      </span>
                    )}
                  </div>
                  {plan.daily_practice_minutes > 0 ? (
                    <span className="text-[11px] text-amber-500 font-semibold block mt-1">
                      {plan.daily_practice_minutes} mins practice/day
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-400 font-bold block mt-1">
                      ✓ Unlimited Daily Speaking Practice
                    </span>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-2.5 text-xs">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.popular ? 'text-emerald-400' : 'text-blue-600'}`} />
                      <span className={plan.popular ? 'text-slate-200' : 'text-slate-600'}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl bg-emerald-600/30 text-emerald-300 font-bold text-xs border border-emerald-500/50 cursor-default"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handlePlanSelect(plan)}
                    className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
                      plan.popular
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
                        : plan.slug === 'free'
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                    }`}
                  >
                    {plan.slug === 'free' ? 'Included Free' : 'Upgrade Plan'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900 text-center">
          Compare Free vs Premium Membership
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Feature</th>
                <th className="py-3 px-4">Free Member</th>
                <th className="py-3 px-4 font-bold text-blue-600">Premium Member</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Daily Speaking Allowance</td>
                <td className="py-3 px-4 text-slate-600">15 minutes / day</td>
                <td className="py-3 px-4 font-bold text-emerald-600">Unlimited 24/7</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Partner Matching Priority</td>
                <td className="py-3 px-4 text-slate-600">Standard Queue</td>
                <td className="py-3 px-4 font-bold text-blue-600">Instant VIP Priority (3x faster)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Live Mentor Workshops</td>
                <td className="py-3 px-4 text-slate-600">Free open sessions only</td>
                <td className="py-3 px-4 font-bold text-slate-900">All free + discounted masterclasses</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Official Course Certificates</td>
                <td className="py-3 px-4 text-slate-600">Not included</td>
                <td className="py-3 px-4 font-bold text-slate-900">Verified digital certificate with ID</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Bangladesh Payment Gateways</td>
                <td className="py-3 px-4 text-slate-600">N/A</td>
                <td className="py-3 px-4 text-slate-900">bKash, Nagad, Rocket & Cards</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Checkout Modal */}
      {selectedPlanForCheckout && (
        <CheckoutModal
          isOpen={Boolean(selectedPlanForCheckout)}
          onClose={() => setSelectedPlanForCheckout(null)}
          item={{
            id: selectedPlanForCheckout.id,
            title: `${selectedPlanForCheckout.name} Membership`,
            price_bdt: selectedPlanForCheckout.price_bdt,
            purpose: 'subscription',
          }}
          user={user}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
