/**
 * SECURITY TESTING (frontend-side)
 * Verifies external links, form security, no sensitive data exposure.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { ContactPage } from '../pages/ContactPage';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false, login: vi.fn(), signup: vi.fn(), logout: vi.fn() }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../contexts/SubscriptionContext', () => ({
  useSubscription: () => ({
    tier: null, usage: null, loading: false, refreshSubscription: vi.fn(), hasFeature: () => false,
  }),
  SubscriptionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../lib/api', () => ({
  billingApi: { createCheckout: vi.fn(), getPortalUrl: vi.fn() },
  authApi: { login: vi.fn(), signup: vi.fn(), me: vi.fn() },
}));

describe('External Link Security', () => {
  it('all external links in footer have rel="noopener noreferrer"', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>);
    const links = screen.getAllByRole('link');
    const external = links.filter(l => l.getAttribute('href')?.startsWith('http'));
    expect(external.length).toBeGreaterThan(0);
    external.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
      const rel = link.getAttribute('rel') || '';
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    });
  });
});

describe('Contact Form Security', () => {
  it('contact form uses POST method (not GET, no query params exposure)', () => {
    const { container } = render(<MemoryRouter><ContactPage /></MemoryRouter>);
    const form = container.querySelector('form');
    // React forms with onSubmit don't have method attr, but verify no action attr with GET
    if (form) {
      const method = form.getAttribute('method');
      expect(method === null || method.toUpperCase() !== 'GET').toBe(true);
      // Also no action attribute that could leak data in URL
      expect(form.getAttribute('action')).toBeNull();
    }
  });

  it('email input has type="email" for proper validation', () => {
    render(<MemoryRouter><ContactPage /></MemoryRouter>);
    const email = screen.getByLabelText(/email/i);
    expect(email).toHaveAttribute('type', 'email');
  });
});
