import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';

export function SecurityPage() {
  return (
    <PublicLayout>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">Security &amp; Compliance</h1>
        <p className="mt-2 text-sm text-text-secondary">We take your data seriously.</p>

        <div className="mt-10 space-y-10 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">1. Data Encryption</h2>
            <p className="text-sm">
              All data encrypted in transit (HTTPS) and at rest (AES-256). API keys are hashed using SHA-256, never logged.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">2. API Security</h2>
            <p className="text-sm">
              API keys are hashed and never logged. Bearer token authentication. Rate limiting: 100 requests per minute per API key.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">3. Webhook Security</h2>
            <p className="text-sm">
              All webhooks are signed with HMAC-SHA256 using a per-webhook secret. Verify signatures client-side to ensure requests are authentically from us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">4. GDPR Compliance</h2>
            <p className="text-sm">
              We&rsquo;re GDPR-ready. Users can request data export, deletion, and portability at any time. See our{' '}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for full details on user rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">5. Incident Response</h2>
            <p className="text-sm">
              Security incidents are reported within 24 hours. Have a security concern? Contact:{' '}
              <strong className="text-text-primary">security@webflowfeedback.com</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">6. Third-Party Services</h2>
            <p className="text-sm">
              We use trusted third parties: Stripe (payments), Resend (email), and Railway (hosting). Each provider maintains their own security practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">7. Uptime SLA</h2>
            <p className="text-sm">
              99.9% uptime target. Status page coming soon.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4 text-sm text-text-secondary">
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <span>&middot;</span>
          <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          <span>&middot;</span>
          <Link to="/" className="hover:text-primary transition-colors">Back to home</Link>
        </div>
      </main>
    </PublicLayout>
  );
}
