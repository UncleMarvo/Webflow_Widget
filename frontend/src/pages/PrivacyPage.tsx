import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';

export function PrivacyPage() {
  return (
    <PublicLayout>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-text-secondary">Last Updated: March 23, 2026</p>

        <div className="mt-10 space-y-10 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">1. What Data We Collect</h2>
            <p className="mb-3">We collect only what we need to provide and improve the service.</p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Account data</strong> &mdash; your email address, name, and API keys generated within the platform.</li>
              <li><strong>Feedback data</strong> &mdash; feedback content, annotations, the page URL where feedback was submitted, and optional screenshots.</li>
              <li><strong>Device context</strong> &mdash; browser name and version, operating system, screen resolution, and device type (desktop, tablet, or mobile). This is collected automatically when feedback is submitted to help reproduce issues.</li>
              <li><strong>Automated data</strong> &mdash; IP address, user-agent string, and session cookies transmitted with each request.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">2. How We Use Your Data</h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Provide the service</strong> &mdash; store and display your feedback, manage projects, and power the embeddable widget.</li>
              <li><strong>Improve the product</strong> &mdash; aggregated analytics and feature-request trends help us prioritise development.</li>
              <li><strong>Security</strong> &mdash; fraud detection, abuse prevention, and protecting the integrity of our platform.</li>
              <li><strong>Communication</strong> &mdash; trial invitations, onboarding emails, and support responses. We will never sell your data to advertisers.</li>
              <li><strong>Legal compliance</strong> &mdash; meeting obligations under applicable laws and regulations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">3. Who Has Access</h2>
            <p className="mb-3 text-sm">Your data is accessible to our internal team on a need-to-know basis. We also share limited data with the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Stripe</strong> &mdash; payment processing. Stripe receives your billing details; we never store full card numbers.</li>
              <li><strong>Resend</strong> &mdash; transactional email delivery (e.g., trial invitations, password resets).</li>
              <li><strong>Railway</strong> &mdash; infrastructure hosting. Our backend and database run on Railway&rsquo;s platform.</li>
            </ul>
            <p className="mt-3 text-sm">We do not sell, rent, or trade your personal data to any other third party.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">4. User Rights</h2>
            <p className="mb-3 text-sm">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Access</strong> &mdash; request a copy of the personal data we hold about you.</li>
              <li><strong>Export</strong> &mdash; download your feedback data in a machine-readable format.</li>
              <li><strong>Delete</strong> &mdash; request deletion of your account and all associated data.</li>
              <li><strong>Correction</strong> &mdash; ask us to correct inaccurate personal data.</li>
            </ul>
            <p className="mt-3 text-sm">
              If you are located in the European Union, you also have rights under the General Data Protection Regulation (GDPR), including the right to restrict processing, the right to data portability, and the right to object to processing. To exercise any of these rights, contact us at <strong>privacy@webflowfeedback.com</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">5. Data Retention</h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Active accounts</strong> &mdash; your data is retained for as long as your account remains active.</li>
              <li><strong>Deleted accounts</strong> &mdash; all personal data is permanently deleted within <strong>30 days</strong> of account deletion.</li>
              <li><strong>Deleted feedback</strong> &mdash; individual feedback items are soft-deleted and retained for <strong>90 days</strong> (allowing recovery), then permanently removed.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">6. Cookies</h2>
            <p className="text-sm">We use a minimal number of cookies:</p>
            <ul className="list-disc pl-6 space-y-2 text-sm mt-3">
              <li><strong>Session cookie</strong> &mdash; required to keep you logged in.</li>
              <li><strong>Preference cookie</strong> (optional) &mdash; stores UI preferences such as theme settings.</li>
            </ul>
            <p className="mt-3 text-sm">We do <strong>not</strong> use tracking cookies, advertising cookies, or any third-party analytics cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">7. Contact</h2>
            <p className="text-sm">
              If you have questions or concerns about this Privacy Policy or your data, please contact us at:
            </p>
            <p className="mt-2 text-sm font-medium text-primary">privacy@webflowfeedback.com</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4 text-sm text-text-secondary">
          <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          <span>&middot;</span>
          <Link to="/" className="hover:text-primary transition-colors">Back to home</Link>
        </div>
      </main>
    </PublicLayout>
  );
}
