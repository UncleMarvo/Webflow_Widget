import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useSubscription } from '../contexts/SubscriptionContext';
import { billingApi } from '../lib/api';

const TIERS = [
  {
    name: 'starter',
    displayName: 'Starter',
    price: 24,
    features: [
      '1–10 projects',
      'Rounds-based workflows',
      'Mobile annotation',
      'Device context capture',
      'Email notifications',
    ],
  },
  {
    name: 'pro',
    displayName: 'Pro',
    price: 49,
    features: [
      '11–50 projects',
      'Everything in Starter',
      'API access',
      'Webhooks',
      'Team integrations',
      'CSV export',
    ],
    highlighted: true,
  },
  {
    name: 'agency',
    displayName: 'Agency',
    price: 99,
    features: [
      '50+ projects',
      'Everything in Pro',
      'Priority support',
      'Dedicated account manager',
      'Custom onboarding',
    ],
  },
];

const COMPARISON_ROWS: { label: string; starter: string; pro: string; agency: string }[] = [
  { label: 'Projects', starter: '1–10', pro: '11–50', agency: '50+' },
  { label: 'Feedback rounds', starter: '✓', pro: '✓', agency: '✓' },
  { label: 'Mobile annotation', starter: '✓', pro: '✓', agency: '✓' },
  { label: 'Device context', starter: '✓', pro: '✓', agency: '✓' },
  { label: 'CSV export', starter: '–', pro: '✓', agency: '✓' },
  { label: 'Email notifications', starter: '✓', pro: '✓', agency: '✓' },
  { label: 'API access', starter: '–', pro: '✓', agency: '✓' },
  { label: 'Webhooks', starter: '–', pro: '✓', agency: '✓' },
  { label: 'Priority support', starter: '–', pro: '–', agency: '✓' },
];

const FAQ_ITEMS = [
  {
    question: "What's a 'round'?",
    answer:
      "A round is a feedback phase. Freeze rounds to prevent new feedback during certain stages of your design process.",
  },
  {
    question: 'Can I change my plan later?',
    answer:
      'Yes. Upgrade or downgrade anytime. Changes take effect on your next billing cycle.',
  },
  {
    question: 'What happens after my trial?',
    answer:
      "Choose your plan. If you don't, we don't charge you. Simple as that.",
  },
  {
    question: 'Do you offer annual billing?',
    answer:
      'Yes. Annual billing (15% discount) available at checkout.',
  },
  {
    question: 'Can I use multiple projects on Starter?',
    answer:
      'Yes, up to 10 projects. Need more? Upgrade to Pro (11–50 projects) or Agency (50+).',
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left text-[#111827] font-medium hover:text-[#3B82F6] transition-colors"
      >
        <span>{question}</span>
        <svg
          className={`w-5 h-5 shrink-0 ml-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="pb-5 text-gray-600 text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export function PricingPage() {
  const { tier: currentTier, refreshSubscription } = useSubscription();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setToast({ type: 'success', message: 'Subscription activated! Your plan has been updated.' });
      refreshSubscription();
    } else if (searchParams.get('canceled') === 'true') {
      setToast({ type: 'error', message: 'Checkout canceled. No changes were made.' });
    }
  }, [searchParams, refreshSubscription]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleSubscribe = async (tierName: string) => {
    setLoading(tierName);
    try {
      const { data } = await billingApi.createCheckout(tierName);
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to start checkout';
      setToast({ type: 'error', message });
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data } = await billingApi.getPortalUrl();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to open billing portal' });
    }
  };

  const isCurrentTier = (tierName: string) => currentTier?.tier === tierName;

  return (
    <Layout>
      {/* Toast */}
      {toast && (
        <div
          className={`mb-6 p-4 rounded-lg text-sm ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Hero */}
      <div className="text-center pt-8 pb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[#111827] tracking-tight">
          Simple pricing. No hidden fees.
        </h1>
        <p className="text-gray-500 mt-4 text-lg max-w-md mx-auto">
          Scale from freelancer to agency.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {TIERS.map((t) => {
          const isCurrent = isCurrentTier(t.name);
          return (
            <div
              key={t.name}
              className={`relative bg-white border rounded-xl p-6 flex flex-col transition-shadow hover:shadow-xl ${
                t.highlighted
                  ? 'border-[#3B82F6] shadow-lg ring-2 ring-[#3B82F6]'
                  : 'border-[#E5E7EB] hover:border-[#3B82F6]'
              }`}
            >
              {t.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#3B82F6] text-white text-xs font-semibold px-4 py-1 rounded-full">
                  Recommended
                </span>
              )}

              <h2 className="text-xl font-semibold text-[#111827]">{t.displayName}</h2>

              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-[#111827]">&euro;{t.price}</span>
                <span className="text-gray-500 ml-1">per month</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {t.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="space-y-2">
                  <div className="w-full py-2.5 text-center text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg">
                    Current Plan
                  </div>
                  <button
                    onClick={handleManageSubscription}
                    className="w-full py-2 text-sm text-gray-600 hover:text-[#3B82F6] underline transition-colors"
                  >
                    Manage Subscription
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleSubscribe(t.name)}
                  disabled={loading === t.name}
                  className={`w-full py-3 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                    t.highlighted
                      ? 'bg-[#3B82F6] text-white hover:bg-[#2563EB]'
                      : 'bg-[#3B82F6] text-white hover:bg-[#2563EB]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === t.name ? 'Redirecting...' : 'Start free trial'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="max-w-5xl mx-auto mt-20">
        <h2 className="text-2xl font-bold text-[#111827] text-center mb-8">
          Compare plans
        </h2>
        <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-[#E5E7EB]">
                <th className="text-left py-4 px-5 font-semibold text-[#111827]">Feature</th>
                <th className="text-center py-4 px-5 font-semibold text-[#111827]">Starter</th>
                <th className="text-center py-4 px-5 font-semibold text-[#3B82F6]">Pro</th>
                <th className="text-center py-4 px-5 font-semibold text-[#111827]">Agency</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr
                  key={row.label}
                  className={`border-b border-[#E5E7EB] last:border-b-0 ${
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="py-3.5 px-5 text-[#111827] font-medium">{row.label}</td>
                  <td className="py-3.5 px-5 text-center text-gray-600">{row.starter}</td>
                  <td className="py-3.5 px-5 text-center text-gray-600">{row.pro}</td>
                  <td className="py-3.5 px-5 text-center text-gray-600">{row.agency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto mt-20">
        <h2 className="text-2xl font-bold text-[#111827] text-center mb-8">
          Frequently asked questions
        </h2>
        <div>
          {FAQ_ITEMS.map((item) => (
            <FaqItem key={item.question} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="text-center mt-20 mb-12 py-12 bg-gray-50 rounded-2xl max-w-3xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-[#111827]">Ready to streamline your feedback?</h2>
        <p className="text-gray-500 mt-2 mb-6">
          Start your 14-day free trial. No credit card required.
        </p>
        <Link
          to="/signup"
          className="inline-block bg-[#3B82F6] text-white font-semibold px-8 py-3 rounded-lg hover:bg-[#2563EB] transition-colors"
        >
          Start free trial
        </Link>
      </div>
    </Layout>
  );
}
