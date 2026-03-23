import { Link } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Layout } from '../components/Layout';
import { BillingPortalLink } from '../components/BillingPortalLink';

const FEATURE_LABELS: Record<string, string> = {
  feedback: 'Feedback Collection',
  email: 'Email Notifications',
  csv_export: 'CSV Export',
  mobile_widget: 'Mobile-Optimized Widget',
  rounds: 'Feedback Rounds',
  api_access: 'API Access',
  webhooks: 'Webhooks',
  priority_support: 'Priority Support',
};

const GATED_FEATURES = [
  { key: 'rounds', tier: 'Pro', description: 'Organize feedback into rounds for structured review cycles.' },
  { key: 'api_access', tier: 'Pro', description: 'Programmatic access to feedback data via REST API.' },
  { key: 'webhooks', tier: 'Pro', description: 'Real-time notifications when feedback is created or updated.' },
  { key: 'priority_support', tier: 'Agency', description: 'Priority access to our support team with faster response times.' },
];

function UsageStat({ label, count, limit }: { label: string; count: number; limit: number | null }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-1">
        {count.toLocaleString()}
        {limit !== null && (
          <span className="text-sm font-normal text-gray-400"> / {limit.toLocaleString()}</span>
        )}
      </p>
      {limit === null && <p className="text-xs text-gray-400 mt-1">Unlimited</p>}
    </div>
  );
}

export function SettingsPage() {
  const { tier, usage, loading, hasFeature } = useSubscription();

  if (loading || !tier || !usage) {
    return (
      <Layout>
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

      {/* Current Plan */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-black text-white">
                {tier.displayName}
              </span>
              <span className="text-gray-600">{tier.price}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Status: <span className="capitalize font-medium text-gray-700">{tier.status}</span>
              {tier.startedAt && (
                <> &middot; Since {new Date(tier.startedAt).toLocaleDateString()}</>
              )}
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Link
              to="/pricing"
              className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800"
            >
              Change Plan
            </Link>
            <BillingPortalLink />
          </div>
        </div>

        {/* Included Features */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Included Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(tier.features)
              .filter(([, enabled]) => enabled)
              .map(([feature]) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {FEATURE_LABELS[feature] || feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <UsageStat label="Projects" count={usage.projects.count} limit={usage.projects.limit} />
          <UsageStat label="Team Members" count={usage.teamMembers.count} limit={usage.teamMembers.limit} />
          <UsageStat label="Total Feedback" count={usage.feedbackTotal} limit={null} />
          <UsageStat
            label="Feedback This Month"
            count={usage.feedbackThisMonth.count}
            limit={usage.feedbackThisMonth.limit}
          />
        </div>
      </div>

      {/* Gated Features — Upgrade Prompts */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Premium Features</h2>
        <div className="space-y-4">
          {GATED_FEATURES.map(({ key, tier: requiredTier, description }) => {
            const unlocked = hasFeature(key);
            return (
              <div
                key={key}
                className={`border rounded-lg p-4 ${unlocked ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{FEATURE_LABELS[key]}</h3>
                      {!unlocked && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          {requiredTier}+ plan
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                  </div>
                  {!unlocked && (
                    <Link
                      to="/pricing"
                      className="shrink-0 px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                    >
                      Upgrade
                    </Link>
                  )}
                  {unlocked && (
                    <span className="shrink-0 text-sm text-green-600 font-medium">Included</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
