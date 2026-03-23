/**
 * CONTENT TESTING
 * Verifies pricing display, CTAs, and key content correctness.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { FeaturesPage } from '../pages/FeaturesPage';
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

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Pricing Display', () => {
  it('Landing page shows all 3 tier prices: €24, €49, €99', () => {
    const { container } = renderWithRouter(<LandingPage />);
    const text = container.textContent || '';
    expect(text).toContain('24');
    expect(text).toContain('49');
    expect(text).toContain('99');
  });

  it('Landing page shows tier names: Starter, Pro, Agency', () => {
    renderWithRouter(<LandingPage />);
    expect(screen.getByText('Starter')).toBeDefined();
    expect(screen.getByText('Pro')).toBeDefined();
    expect(screen.getByText('Agency')).toBeDefined();
  });
});

describe('CTAs', () => {
  it('Landing page has "Start free trial" CTA', () => {
    renderWithRouter(<LandingPage />);
    const ctas = screen.getAllByText(/start free trial/i);
    expect(ctas.length).toBeGreaterThan(0);
  });

  it('Features page has "Start free trial" CTA', () => {
    renderWithRouter(<FeaturesPage />);
    const ctas = screen.getAllByText(/start free trial/i);
    expect(ctas.length).toBeGreaterThan(0);
  });

  it('Landing page "Start free trial" links to /signup', () => {
    renderWithRouter(<LandingPage />);
    const ctas = screen.getAllByText(/start free trial/i);
    const link = ctas.find(el => el.closest('a'));
    expect(link?.closest('a')).toHaveAttribute('href', '/signup');
  });
});

describe('Key Content', () => {
  it('Landing page mentions Webflow', () => {
    renderWithRouter(<LandingPage />);
    expect(screen.getAllByText(/Webflow/i).length).toBeGreaterThan(0);
  });

  it('Features page describes core features', () => {
    renderWithRouter(<FeaturesPage />);
    expect(screen.getByText(/Rounds-Based Feedback/i)).toBeDefined();
    expect(screen.getByText(/Mobile-First Annotation/i)).toBeDefined();
    expect(screen.getByText(/Developer-Ready API/i)).toBeDefined();
  });

  it('Contact page shows email address', () => {
    renderWithRouter(<ContactPage />);
    expect(screen.getByText(/hello@webflowfeedback.com/i)).toBeDefined();
  });
});
