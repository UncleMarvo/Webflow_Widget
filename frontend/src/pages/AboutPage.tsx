import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';

const TIMELINE = [
  { date: 'March 2026', label: 'Launched with rounds + mobile-first feedback' },
  { date: 'Q2 2026', label: 'First 10 paying customers' },
  { date: 'Q3 2026', label: 'Public API launch' },
];

const DIFFERENTIATORS = [
  {
    title: 'Rounds',
    description: 'Organize feedback by phase — discovery, wireframes, design, revisions, final.',
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    title: 'Mobile-First',
    description: 'Clients annotate from their phones, not just desktops.',
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Affordable',
    description: 'From \u20ac24/mo for freelancers to \u20ac49/mo for small teams. No enterprise-only pricing.',
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Transparent',
    description: 'No hidden features, no enterprise-only BS. What you see is what you get.',
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
];

export function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#F0F7FF] to-white py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary tracking-tight">
            About Phasemark
          </h1>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
            Professional feedback workflows that are affordable and accessible to everyone.
          </p>
        </div>
      </section>

      {/* Why I Built This */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-2xl font-bold text-text-primary mb-6">Why I Built This</h2>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            I'm a developer and Webflow enthusiast. I built this because Markup.io's
            price hike (&euro;25 &rarr; &euro;79) left freelancers and small agencies
            paying enterprise prices. There had to be a better way.
          </p>
          <p>I noticed three problems:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Existing tools were desktop-biased &mdash; clients review on phones, not desktops.</li>
            <li>Feedback lived in a flat list forever &mdash; no way to organize by phase or revision.</li>
            <li>Pricing was broken &mdash; why should a solo freelancer with 1 project pay the same as a 50-person agency?</li>
          </ol>
          <p>So I built <strong>Phasemark</strong>.</p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-surface py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-3">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed">
                Make professional feedback workflows affordable and accessible to
                everyone &mdash; from solo freelancers to large agencies.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-3">Our Vision</h2>
              <p className="text-gray-700 leading-relaxed">
                In 2 years, we want to be the default feedback tool for Webflow professionals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Different */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-2xl font-bold text-text-primary mb-8 text-center">What Makes Us Different</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {DIFFERENTIATORS.map((item) => (
            <div key={item.title} className="flex gap-4 p-5 rounded-lg border border-border bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                {item.icon}
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">{item.title}</h3>
                <p className="mt-1 text-sm text-text-secondary">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="bg-surface py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">The Team</h2>
          <p className="text-gray-700 leading-relaxed max-w-xl mx-auto">
            Currently it's just me. If this grows, I'll bring on collaborators
            who care about quality and the Webflow community.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-2xl font-bold text-text-primary mb-8 text-center">Timeline</h2>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border sm:left-1/2 sm:-translate-x-px" />
          <div className="space-y-8">
            {TIMELINE.map((item, i) => (
              <div key={i} className="relative flex items-start gap-4 sm:justify-center">
                <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center sm:order-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                </div>
                <div className="sm:w-5/12 sm:order-1 sm:text-right">
                  <span className="text-sm font-semibold text-primary">{item.date}</span>
                  <p className="text-gray-700 text-sm mt-1">{item.label}</p>
                </div>
                <div className="hidden sm:block sm:w-5/12 sm:order-3" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Community */}
      <section className="bg-[#F0F7FF] py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Get in Touch</h2>
          <p className="text-gray-700 mb-6">Got feedback? We'd love to hear from you.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="mailto:hello@webflowfeedback.com" className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-white text-sm text-gray-700 hover:border-primary hover:text-primary transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              hello@webflowfeedback.com
            </a>
            <Link to="/contact" className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-primary text-sm font-medium text-white hover:bg-primary-dark transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
