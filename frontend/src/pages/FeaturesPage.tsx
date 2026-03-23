import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';

const FEATURES = [
  {
    title: 'Rounds-Based Feedback',
    description:
      'Organize feedback by design phase. Create rounds for Discovery, Wireframes, Design, Revisions, and Final. Freeze rounds to prevent changes during specific stages. Perfect for design sprints and revision cycles.',
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    title: 'Mobile-First Annotation',
    description:
      'Touch-native annotation with swipe gestures and responsive UI. Your clients can annotate feedback from their phones, tablets, or desktops. Bottom sheet on mobile, floating panel on desktop.',
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Device Context Capture',
    description:
      'Automatically captures browser, OS, screen resolution, and device pixel ratio with every feedback submission. Reproduce issues accurately without asking clients for screenshots.',
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Developer-Ready API',
    description:
      'Full REST API with Bearer token authentication. List projects, create feedback, manage rounds, and register webhooks programmatically. Available on Pro and Agency tiers.',
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    title: 'Webhooks & Integrations',
    description:
      'Register webhook endpoints to receive real-time notifications when feedback is created, updated, or deleted. HMAC-SHA256 signed for security. Integrate with Slack, Jira, or custom tools.',
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    title: 'CSV Export',
    description:
      'Export all feedback with timestamps, device info, annotations, and metadata to CSV. Available on all tiers for easy reporting and offline analysis.',
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export function FeaturesPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#F0F7FF] to-white py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary tracking-tight">
            Features built for Webflow teams
          </h1>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
            Everything you need to collect, organize, and act on client feedback — from a single embed code.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-lg p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Ready to streamline your feedback?</h2>
          <p className="text-text-secondary mb-6">Start your 14-day free trial. No credit card required.</p>
          <Link
            to="/signup"
            className="inline-block bg-primary text-white font-semibold px-8 py-3 rounded-md hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Start free trial
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
