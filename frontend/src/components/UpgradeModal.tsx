interface UpgradeModalProps {
  feature: string;
  onClose: () => void;
}

const FEATURE_INFO: Record<string, { title: string; description: string; tier: string }> = {
  rounds: {
    title: 'Feedback Rounds',
    description: 'Organize feedback into structured rounds for review cycles. Group submissions by sprint, release, or design iteration.',
    tier: 'Pro',
  },
  api_access: {
    title: 'API Access',
    description: 'Access your feedback data programmatically via REST API. Build custom integrations and automate workflows.',
    tier: 'Pro',
  },
  webhooks: {
    title: 'Webhooks',
    description: 'Get real-time notifications when feedback is created or updated. Integrate with your existing workflow tools.',
    tier: 'Pro',
  },
  priority_support: {
    title: 'Priority Support',
    description: 'Get priority access to our support team with faster response times and dedicated assistance.',
    tier: 'Agency',
  },
};

export function UpgradeModal({ feature, onClose }: UpgradeModalProps) {
  const info = FEATURE_INFO[feature];
  if (!info) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">{info.title}</h2>
          <p className="text-sm text-gray-500 mt-2">{info.description}</p>
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-700">
            Available on {info.tier}+ plan
          </div>
          <p className="text-sm text-gray-400 mt-4">This feature is coming soon. Stay tuned for updates.</p>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
          <button
            disabled
            className="flex-1 px-4 py-2 text-sm bg-gray-200 text-gray-400 rounded-md cursor-not-allowed"
          >
            Upgrade — Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}
