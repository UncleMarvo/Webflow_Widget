import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';

/* --- FAQ Data --- */

type FaqItem = { id: string; q: string; a: React.ReactNode };
type FaqSection = { title: string; items: FaqItem[] };

const FAQ_SECTIONS: FaqSection[] = [
  {
    title: 'General',
    items: [
      {
        id: 'what-is',
        q: 'What is Phasemark?',
        a: 'A mobile-first feedback collection and management platform built specifically for Webflow sites. Organize feedback by rounds (phases), capture device context automatically, and collaborate with your team.',
      },
      {
        id: 'who-is-it-for',
        q: 'Who is it for?',
        a: 'Freelancers, small agencies, and design teams building with Webflow who need a better way to collect and organize client feedback.',
      },
      {
        id: 'what-is-rounds',
        q: "Why is it called 'rounds'?",
        a: (
          <>
            A "round" is a feedback phase or cycle. Use it to organize feedback by design stage (e.g.,
            "Discovery", "Wireframes", "Design", "Revisions", "Final"). Freeze rounds to prevent new
            feedback during specific stages.
          </>
        ),
      },
      {
        id: 'how-different',
        q: 'How is this different from Markup.io / Superflow / Noteableapp?',
        a: (
          <>
            Rounds-based organization, mobile-first annotation, affordable pricing (&euro;24 for freelancers),
            and API access on all paid tiers. No enterprise lock-in.
          </>
        ),
      },
    ],
  },
  {
    title: 'Getting Started',
    items: [
      {
        id: 'first-project',
        q: 'How do I set up my first project?',
        a: (
          <>
            Click "Create Project", name it, copy the embed code, paste into Webflow Designer
            (Settings &gt; Custom Code &gt; Footer), and test by reloading your site. See our{' '}
            <Link to="/how-to" className="text-primary hover:underline">How-To guide</Link> for a
            step-by-step walkthrough.
          </>
        ),
      },
      {
        id: 'setup-time',
        q: 'How long does setup take?',
        a: '2\u20135 minutes. The embed code is one line, and you\'ll get immediate feedback.',
      },
      {
        id: 'invite-team',
        q: 'Can I invite my team?',
        a: 'Yes. Go to Settings > Team, click "Invite", enter their email, select a role (Admin or Member), and they\'ll get an invite.',
      },
      {
        id: 'training',
        q: 'Do you offer training?',
        a: (
          <>
            We have a detailed{' '}
            <Link to="/how-to" className="text-primary hover:underline">How-To guide</Link> and video
            tutorials. Email{' '}
            <a href="mailto:hello@webflowfeedback.com" className="text-primary hover:underline">
              hello@webflowfeedback.com
            </a>{' '}
            for custom onboarding.
          </>
        ),
      },
    ],
  },
  {
    title: 'Feedback & Features',
    items: [
      {
        id: 'data-captured',
        q: 'What data do you capture with each feedback submission?',
        a: 'Feedback content, screenshot (if taken), page URL, device info (browser, OS, resolution, device pixel ratio), and submission timestamp.',
      },
      {
        id: 'delete-feedback',
        q: 'Can I delete feedback?',
        a: 'Yes. Soft-delete feedback from the dashboard. Deleted feedback is retained for 90 days in case you need it, then permanently removed.',
      },
      {
        id: 'export-feedback',
        q: 'Can I export feedback?',
        a: 'Yes. CSV export is included at all tiers. Also available via API (Pro/Agency only).',
      },
      {
        id: 'device-context',
        q: "What does 'device context' mean?",
        a: 'We automatically capture the browser, OS, screen resolution, and device pixel ratio with each feedback submission. This helps you understand the environment where issues occur.',
      },
      {
        id: 'organize-by-phase',
        q: 'How do I organize feedback by phase?',
        a: 'Use rounds. Create a round for each design phase (e.g., "Round 1: Initial Design"). New feedback auto-assigns to the active round. Freeze rounds to prevent new feedback during other phases.',
      },
    ],
  },
  {
    title: 'Billing & Account',
    items: [
      {
        id: 'pricing',
        q: 'How much does it cost?',
        a: (
          <>
            Starter &euro;24/mo (1\u201310 projects), Pro &euro;49/mo (11\u201350 projects), Agency
            &euro;99/mo (50+ projects). 14-day free trial, no credit card required. See{' '}
            <Link to="/pricing" className="text-primary hover:underline">Pricing</Link>.
          </>
        ),
      },
      {
        id: 'free-trial',
        q: "What's included in the free trial?",
        a: "Full access to all features (rounds, mobile, device context, CSV export, email). After 14 days, choose a plan or cancel. No charges if you don't upgrade.",
      },
      {
        id: 'change-plan',
        q: 'Can I change my plan?',
        a: 'Yes. Upgrade or downgrade anytime. Changes take effect on your next billing cycle.',
      },
      {
        id: 'refund-policy',
        q: "What's your refund policy?",
        a: 'Monthly subscriptions: no refunds (but the 14-day trial lets you test risk-free). Annual subscriptions: 30-day money-back guarantee.',
      },
      {
        id: 'cancel',
        q: 'How do I cancel?',
        a: 'Go to Settings > Billing > Subscription. Click "Cancel Subscription". Cancellation takes effect at the end of your current billing period.',
      },
      {
        id: 'annual-billing',
        q: 'Do you offer annual billing?',
        a: 'Yes. Annual billing saves 15% vs monthly. Available at checkout.',
      },
      {
        id: 'payment-methods',
        q: 'What payment methods do you accept?',
        a: 'All major credit cards (Visa, Mastercard, Amex) via Stripe.',
      },
    ],
  },
  {
    title: 'API & Integrations',
    items: [
      {
        id: 'api-for',
        q: "What's the API for?",
        a: 'Programmatic access to your feedback data. Create feedback, list/filter feedback, manage rounds, register webhooks, and integrate with Slack, Jira, or custom tools. Available on Pro/Agency tiers.',
      },
      {
        id: 'api-key',
        q: 'How do I generate an API key?',
        a: 'Go to Settings > API Keys. Click "Generate New Key". Copy it immediately (it\'s only shown once). Store securely.',
      },
      {
        id: 'integrations',
        q: 'What integrations do you support?',
        a: 'API and webhooks are available on Pro/Agency. Official integrations (Slack, Jira, Zapier) are coming soon.',
      },
      {
        id: 'custom-integration',
        q: 'Can you build a custom integration for me?',
        a: (
          <>
            Email{' '}
            <a href="mailto:hello@webflowfeedback.com" className="text-primary hover:underline">
              hello@webflowfeedback.com
            </a>
            . We may be able to help, depending on complexity.
          </>
        ),
      },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        id: 'response-time',
        q: "What's your support response time?",
        a: 'Starter/Pro: email support, 24-hour response target. Agency: email + Slack support, 2-hour response target.',
      },
      {
        id: 'live-chat',
        q: 'Do you have live chat?',
        a: (
          <>
            Not yet. Email{' '}
            <a href="mailto:hello@webflowfeedback.com" className="text-primary hover:underline">
              hello@webflowfeedback.com
            </a>{' '}
            or fill out the{' '}
            <Link to="/contact" className="text-primary hover:underline">contact form</Link>.
          </>
        ),
      },
      {
        id: 'report-bug',
        q: 'How do I report a bug?',
        a: (
          <>
            Use the{' '}
            <Link to="/contact" className="text-primary hover:underline">Contact form</Link> and
            select "Bug Report". Include steps to reproduce and any error messages.
          </>
        ),
      },
      {
        id: 'roadmap',
        q: "Where's your roadmap?",
        a: (
          <>
            We're building in public. Email{' '}
            <a href="mailto:hello@webflowfeedback.com" className="text-primary hover:underline">
              hello@webflowfeedback.com
            </a>{' '}
            with feature requests.
          </>
        ),
      },
    ],
  },
];

/* --- Component --- */

export function FaqPage() {
  const location = useLocation();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && itemRefs.current[hash]) {
      setOpenItems(new Set([hash]));
      setTimeout(() => {
        itemRefs.current[hash]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [location.hash]);

  const toggle = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredSections = search.trim()
    ? FAQ_SECTIONS.map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.q.toLowerCase().includes(search.toLowerCase()) ||
            (typeof item.a === 'string' && item.a.toLowerCase().includes(search.toLowerCase()))
        ),
      })).filter((s) => s.items.length > 0)
    : FAQ_SECTIONS;

  return (
    <PublicLayout>
      {/* Header */}
      <section className="bg-gradient-to-b from-[#F0F7FF] to-white py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-text-secondary">
            Can't find the answer?{' '}
            <a href="mailto:hello@webflowfeedback.com" className="text-primary hover:underline">
              Email hello@webflowfeedback.com
            </a>
          </p>

          {/* Search */}
          <div className="mt-6 max-w-md mx-auto relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <label htmlFor="faq-search" className="sr-only">Search questions</label>
            <input
              id="faq-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full rounded-md border border-border pl-10 pr-4 py-3 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {filteredSections.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <p>No questions match your search.</p>
            <button onClick={() => setSearch('')} className="mt-2 text-sm text-primary hover:underline">
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {filteredSections.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border">
                  {section.title}
                </h2>
                <div className="divide-y divide-gray-100">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      id={item.id}
                      ref={(el) => { itemRefs.current[item.id] = el; }}
                    >
                      <button
                        onClick={() => toggle(item.id)}
                        className="w-full flex items-start justify-between gap-4 py-4 text-left group"
                        aria-expanded={openItems.has(item.id)}
                      >
                        <span className="font-medium text-text-primary group-hover:text-primary transition-colors text-sm sm:text-base">
                          {item.q}
                        </span>
                        <svg
                          className={`w-5 h-5 flex-shrink-0 text-gray-400 transition-transform mt-0.5 ${openItems.has(item.id) ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {openItems.has(item.id) && (
                        <div className="pb-4 pr-8 text-sm text-text-secondary leading-relaxed">
                          {item.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </PublicLayout>
  );
}
