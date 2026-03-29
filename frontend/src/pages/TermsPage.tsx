import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';

export function TermsPage() {
  return (
    <PublicLayout>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-text-secondary">Last Updated: March 23, 2026</p>

        <div className="mt-10 space-y-10 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">1. Acceptance of Terms</h2>
            <p className="text-sm">
              By accessing or using Phasemark ("the Service"), you agree to be bound by these Terms of Service and our{' '}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              If you do not agree with any part of these terms, you may not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">2. Who Can Use This</h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>You must be at least <strong>18 years old</strong> to use the Service.</li>
              <li>If you are using the Service on behalf of an organisation, you confirm that you have the <strong>authority to bind</strong> that organisation to these terms.</li>
              <li>You may not use the Service if you are located in a jurisdiction subject to comprehensive sanctions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">3. Account Responsibility</h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>You are responsible for maintaining the <strong>security of your password</strong> and account credentials.</li>
              <li>You are responsible for <strong>all activity</strong> that occurs under your account.</li>
              <li>You must <strong>notify us immediately</strong> if you become aware of any unauthorised access to your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">4. Subscription & Billing</h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Free trial:</strong> 14 days with full feature access. No credit card required.</li>
              <li><strong>Auto-renewal:</strong> Paid subscriptions renew automatically at the end of each billing period unless cancelled.</li>
              <li><strong>Cancellation:</strong> You may cancel at any time. Cancellation takes effect at the end of the current billing period &mdash; you retain access until then.</li>
              <li><strong>Refund policy:</strong> Monthly plans are non-refundable. Annual plans include a <strong>30-day money-back guarantee</strong> from the date of purchase.</li>
              <li><strong>Payment retry:</strong> If a payment fails, we will retry up to <strong>3 times over 5 days</strong> before suspending the account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">5. Acceptable Use</h2>
            <p className="mb-3 text-sm">You agree <strong>not</strong> to use the Service to:</p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Engage in any <strong>illegal activity</strong>, including fraud, phishing, or harassment.</li>
              <li>Send spam or unsolicited communications through the platform.</li>
              <li><strong>Reverse-engineer</strong>, decompile, or disassemble any part of the Service.</li>
              <li>Scrape data from the Service outside of the provided API.</li>
              <li>Upload or distribute <strong>malware</strong>, viruses, or other harmful code.</li>
              <li>Attempt to gain unauthorised access to other users' accounts or our infrastructure.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">6. Content Ownership</h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Your content:</strong> You retain full ownership of all feedback, annotations, screenshots, and other data you submit through the Service.</li>
              <li><strong>Our service:</strong> The Service itself (code, design, branding) is owned by us and licensed to you for use &mdash; not sold.</li>
              <li><strong>Third-party content:</strong> Any third-party content accessed through the Service remains subject to its respective owners' terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">7. Limitation of Liability</h2>
            <p className="text-sm mb-3">
              To the maximum extent permitted by law, we are <strong>not liable</strong> for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
            </p>
            <p className="text-sm mb-3">
              Our total liability is capped at the <strong>amount you have paid us in the 12 months</strong> preceding the claim, or <strong>&euro;100</strong>, whichever is greater.
            </p>
            <p className="text-sm text-text-secondary">
              Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability. In such cases, our liability will be limited to the fullest extent permitted by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">8. Disclaimer of Warranties</h2>
            <p className="text-sm">
              The Service is provided <strong>"as is"</strong> and <strong>"as available"</strong> without warranties of any kind, whether express or implied. We do not guarantee:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm mt-3">
              <li>Uninterrupted or error-free operation.</li>
              <li>100% uptime or availability.</li>
              <li>That your data will never be lost (though we take reasonable precautions to prevent data loss).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">9. Indemnification</h2>
            <p className="text-sm">
              You agree to indemnify and hold us harmless from any claims, damages, losses, or expenses (including legal fees) arising from your use of the Service or your violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">10. Termination</h2>
            <p className="mb-3 text-sm">We may suspend or terminate your account if:</p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>You <strong>violate these terms</strong>.</li>
              <li>You engage in <strong>illegal activity</strong> using the Service.</li>
              <li>Your account has been <strong>inactive for 365 or more days</strong>.</li>
              <li>Payment remains outstanding after all <strong>retry attempts</strong> have been exhausted.</li>
            </ul>
            <p className="mt-3 text-sm">
              Upon termination, you may request an export of your data within 30 days. After that period, your data will be permanently deleted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">11. Dispute Resolution</h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Good faith negotiation:</strong> Both parties agree to attempt to resolve any dispute through good-faith negotiation for at least <strong>30 days</strong> before pursuing other remedies.</li>
              <li><strong>Binding arbitration:</strong> If negotiation fails, disputes will be resolved through binding arbitration rather than in court.</li>
              <li><strong>Small claims:</strong> Either party may bring a claim in small claims court if the dispute qualifies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">12. Third-Party Services</h2>
            <p className="text-sm mb-3">The Service integrates with the following third-party providers:</p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Stripe</strong> &mdash; payment processing</li>
              <li><strong>Resend</strong> &mdash; email delivery</li>
              <li><strong>Railway</strong> &mdash; infrastructure hosting</li>
            </ul>
            <p className="mt-3 text-sm">
              Your use of these services is subject to their respective terms and privacy policies. We are not liable for outages or issues caused by third-party providers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">13. Modifications</h2>
            <p className="text-sm">
              We may update these terms from time to time. When we make material changes, we will notify you via the email address associated with your account. <strong>Continued use of the Service after changes take effect constitutes acceptance</strong> of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">14. Entire Agreement</h2>
            <p className="text-sm">
              These Terms of Service, together with our{' '}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>,
              constitute the entire agreement between you and Phasemark regarding your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">15. Contact</h2>
            <p className="text-sm">
              If you have questions about these Terms of Service, please contact us at:
            </p>
            <p className="mt-2 text-sm font-medium text-primary">legal@webflowfeedback.com</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4 text-sm text-text-secondary">
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <span>&middot;</span>
          <Link to="/" className="hover:text-primary transition-colors">Back to home</Link>
        </div>
      </main>
    </PublicLayout>
  );
}
