import { useState } from 'react';
import { PublicLayout } from '../components/PublicLayout';

type FormData = {
  name: string;
  email: string;
  subject: string;
  priority: string;
  message: string;
};

const SUBJECTS = [
  'Bug Report',
  'Feature Request',
  'Billing Question',
  'Partnership',
  'General Question',
];

const PRIORITIES = ['Low', 'Medium', 'High'];

export function ContactPage() {
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    priority: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) next.name = 'Name is required.';
    if (!form.email.trim()) {
      next.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Please enter a valid email.';
    }
    if (!form.subject) next.subject = 'Please select a subject.';
    if (!form.message.trim()) {
      next.message = 'Message is required.';
    } else if (form.message.trim().length < 10) {
      next.message = 'Message must be at least 10 characters.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('sending');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to send');
      setStatus('success');
      setForm({ name: '', email: '', subject: '', priority: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <PublicLayout>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">Contact Us</h1>
          <p className="mt-2 text-text-secondary">Have a question or feedback? We'd love to hear from you.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Form */}
          <div className="lg:col-span-3">
            {status === 'success' ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
                <svg className="w-12 h-12 text-success mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-lg font-semibold text-green-800 mb-2">Thanks! We've received your message.</h2>
                <p className="text-sm text-green-700">We'll get back to you within 24 hours.</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-6 text-sm font-medium text-primary hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {status === 'error' && (
                  <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                    Oops! Something went wrong. Please try again.
                  </div>
                )}

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-error">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    className={`w-full rounded-md border px-4 py-3 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10 ${errors.name ? 'border-error' : 'border-border'}`}
                    placeholder="Your name"
                  />
                  {errors.name && <p className="mt-1 text-xs text-error">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-error">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className={`w-full rounded-md border px-4 py-3 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10 ${errors.email ? 'border-error' : 'border-border'}`}
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-error">{errors.email}</p>}
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject <span className="text-error">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className={`w-full rounded-md border px-4 py-3 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10 ${errors.subject ? 'border-error' : 'border-border'}`}
                  >
                    <option value="">Select a subject...</option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.subject && <p className="mt-1 text-xs text-error">{errors.subject}</p>}
                </div>

                {/* Priority */}
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority <span className="text-gray-400">(optional)</span>
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="w-full rounded-md border border-border px-4 py-3 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="">Select priority...</option>
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message <span className="text-error">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    className={`w-full rounded-md border px-4 py-3 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10 resize-y ${errors.message ? 'border-error' : 'border-border'}`}
                    placeholder="Tell us what's on your mind..."
                  />
                  {errors.message && <p className="mt-1 text-xs text-error">{errors.message}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-base font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  {status === 'sending' ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send message'
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-border bg-surface p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">Email</h3>
                <a href="mailto:hello@webflowfeedback.com" className="text-sm text-primary hover:underline">
                  hello@webflowfeedback.com
                </a>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">Response Time</h3>
                <p className="text-sm text-text-secondary">We aim to respond within <strong>24 hours</strong> on business days.</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">Other Ways to Reach Us</h3>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 001.88-2.38 8.59 8.59 0 01-2.72 1.04 4.28 4.28 0 00-7.32 3.91A12.16 12.16 0 013.16 4.86a4.28 4.28 0 001.33 5.71c-.69-.02-1.34-.21-1.9-.53v.05a4.28 4.28 0 003.43 4.19 4.28 4.28 0 01-1.93.07 4.29 4.29 0 004 2.98A8.6 8.6 0 012 19.54a12.13 12.13 0 006.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.37-.01-.56A8.72 8.72 0 0024 5.06a8.48 8.48 0 01-2.54.7z" /></svg>
                    Twitter
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" /></svg>
                    Discord
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-text-secondary">
                  For billing issues, include your account email so we can look you up quickly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PublicLayout>
  );
}
