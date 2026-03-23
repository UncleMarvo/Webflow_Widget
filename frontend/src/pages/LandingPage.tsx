import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';

/* --- Data --- */

const FEATURES = [
  {
    title: 'Rounds-Based Feedback',
    description:
      'Organize feedback by design phase. Freeze rounds to prevent changes during specific stages. Perfect for design sprints and revision cycles.',
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    title: 'Mobile-First Annotation',
    description:
      'Touch-native annotation. Swipe gestures. Responsive UI. Your clients can annotate feedback from their phones, not just desktops.',
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Developer-Ready API',
    description:
      'Full REST API. Webhooks. Integrate with Slack, Jira, or build custom workflows. Premium tiers unlock integration possibilities.',
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
];

const PRICING_TIERS = [
  {
    name: 'Starter',
    price: 24,
    features: ['Up to 10 projects', 'Rounds-based workflows', 'Mobile annotation', 'Device context capture'],
  },
  {
    name: 'Pro',
    price: 49,
    highlighted: true,
    features: ['Up to 50 projects', 'Everything in Starter', 'API access', 'Webhooks & integrations'],
  },
  {
    name: 'Agency',
    price: 99,
    features: ['50+ projects', 'Everything in Pro', 'Priority support', 'Dedicated account manager'],
  },
];

const FAQ_ITEMS = [
  {
    question: 'What is Webflow Feedback Tool?',
    answer:
      'A mobile-first feedback collection platform built specifically for Webflow sites. Organizes feedback by rounds (phases) and captures device context automatically.',
  },
  {
    question: "What's a 'round'?",
    answer:
      'A round is a feedback phase. Freeze rounds to prevent new feedback during certain stages of your design process.',
  },
  {
    question: 'Can I use this with Webflow?',
    answer:
      "Yes! We're built specifically for Webflow. Just add one line of embed code to your site.",
  },
  {
    question: 'What happens after my 14-day trial?',
    answer:
      "Choose your plan or cancel. No charges if you don't upgrade. Simple.",
  },
  {
    question: 'Is there a free plan?',
    answer:
      'We offer a 14-day free trial with full feature access. Paid plans start at \u20ac24/month for up to 10 projects.',
  },
];

/* --- Components --- */

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left text-text-primary font-medium hover:text-primary transition-colors"
        aria-expanded={open}
      >
        <span>{question}</span>
        <svg
          className={`w-5 h-5 shrink-0 ml-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="pb-5 text-text-secondary text-sm leading-relaxed">{answer}</div>
      )}
    </div>
  );
}

/* --- Landing Page --- */

export function LandingPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section>
        <div
          className="min-h-[600px] flex items-center"
          style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F0F7FF 100%)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Text */}
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary tracking-tight leading-tight">
                  Feedback workflow built for{' '}
                  <span className="text-primary">Webflow</span>
                </h1>
                <p className="mt-6 text-lg sm:text-xl text-neutral max-w-lg leading-relaxed">
                  Rounds-based phases. Mobile annotation. Affordable pricing.{' '}
                  <span className="text-gray-400">60% cheaper than Markup.io. Includes features Noted doesn't have.</span>
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    to="/signup"
                    className="bg-primary text-white font-semibold text-lg px-8 py-3.5 rounded-md hover:bg-primary-dark active:bg-primary-darker transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Start free trial
                  </Link>
                  <a
                    href="#features"
                    className="border-2 border-border text-text-primary font-semibold text-lg px-8 py-3.5 rounded-md hover:border-primary hover:text-primary transition-colors"
                  >
                    Watch demo
                  </a>
                </div>
                <p className="mt-4 text-sm text-gray-400">14-day free trial &middot; No credit card required</p>
              </div>

              {/* Hero illustration - phone mockup */}
              <div className="flex justify-center lg:justify-end" aria-hidden="true">
                <div className="relative w-[280px] sm:w-[320px]">
                  <div className="bg-text-primary rounded-[2.5rem] p-3 shadow-xl">
                    <div className="bg-white rounded-[2rem] overflow-hidden">
                      <div className="bg-surface px-6 py-3 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 font-medium">9:41</span>
                        <div className="flex gap-1">
                          <div className="w-3.5 h-2 bg-gray-300 rounded-sm"></div>
                          <div className="w-1.5 h-2 bg-gray-300 rounded-sm"></div>
                        </div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2z" />
                            </svg>
                          </div>
                          <span className="text-xs font-semibold text-text-primary">Feedback Tool</span>
                        </div>
                        <div className="relative bg-gray-100 rounded-lg h-40 mb-3">
                          <div className="absolute top-6 left-8">
                            <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                              <span className="text-white text-xs font-bold">1</span>
                            </div>
                          </div>
                          <div className="absolute top-16 right-10">
                            <div className="w-7 h-7 bg-secondary rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                              <span className="text-white text-xs font-bold">2</span>
                            </div>
                          </div>
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                            <div className="bg-white rounded-md shadow-md px-3 py-1.5 text-[10px] text-text-secondary">
                              Tap to annotate
                            </div>
                          </div>
                        </div>
                        <div className="bg-white border border-border rounded-lg p-2.5 mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold text-text-primary">Round 2 &middot; Mobile</span>
                            <span className="text-[9px] bg-blue-50 text-primary px-1.5 py-0.5 rounded font-medium">In Progress</span>
                          </div>
                          <p className="text-[10px] text-text-secondary leading-relaxed">Button overlaps on iPhone 14</p>
                        </div>
                        <div className="bg-white border border-border rounded-lg p-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold text-text-primary">Round 2 &middot; Desktop</span>
                            <span className="text-[9px] bg-green-50 text-success px-1.5 py-0.5 rounded font-medium">Done</span>
                          </div>
                          <p className="text-[10px] text-text-secondary leading-relaxed">Navbar spacing looks good now</p>
                        </div>
                      </div>
                      <div className="px-4 py-3 border-t border-gray-100">
                        <div className="w-24 h-1 bg-gray-200 rounded-full mx-auto"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
              Everything you need to collect feedback
            </h2>
            <p className="mt-4 text-lg text-neutral max-w-2xl mx-auto">
              Built for designers, developers, and agencies who work with Webflow.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">{f.title}</h3>
                <p className="text-neutral leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
              Choose your plan
            </h2>
            <p className="mt-4 text-lg text-neutral max-w-2xl mx-auto">
              All tiers include mobile annotation and rounds. Upgrade for API and webhooks.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PRICING_TIERS.map((t) => (
              <div
                key={t.name}
                className={`relative bg-white border rounded-lg p-8 flex flex-col transition-shadow hover:shadow-lg ${
                  t.highlighted
                    ? 'border-primary shadow-lg ring-2 ring-primary'
                    : 'border-border'
                }`}
              >
                {t.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-text-primary">{t.name}</h3>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold text-text-primary">&euro;{t.price}</span>
                  <span className="text-neutral ml-1">/month</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {t.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary">
                      <svg className="w-4 h-4 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`w-full py-3 text-sm font-semibold rounded-md text-center transition-colors block ${
                    t.highlighted
                      ? 'bg-primary text-white hover:bg-primary-dark'
                      : 'bg-text-primary text-white hover:bg-gray-800'
                  }`}
                >
                  Start free trial
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/pricing" className="text-primary font-medium hover:underline text-sm">
              Compare all features &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 lg:py-28 bg-surface">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary text-center tracking-tight mb-12">
            Frequently asked questions
          </h2>
          <div>
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
