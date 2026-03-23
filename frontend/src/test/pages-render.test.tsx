/**
 * FUNCTIONAL TESTING: Pages Load
 * Verifies all public and auth pages render without throwing errors.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { FeaturesPage } from '../pages/FeaturesPage';
import HowToPage from '../pages/HowToPage';
import { AboutPage } from '../pages/AboutPage';
import { PrivacyPage } from '../pages/PrivacyPage';
import { TermsPage } from '../pages/TermsPage';
import { ContactPage } from '../pages/ContactPage';
import { FaqPage } from '../pages/FaqPage';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';

// Mock auth/subscription contexts so pages render without backend
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false, login: vi.fn(), signup: vi.fn(), logout: vi.fn() }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../contexts/SubscriptionContext', () => ({
  useSubscription: () => ({
    tier: null,
    usage: null,
    loading: false,
    refreshSubscription: vi.fn(),
    hasFeature: () => false,
  }),
  SubscriptionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../lib/api', () => ({
  billingApi: { createCheckout: vi.fn(), getPortalUrl: vi.fn() },
  authApi: { login: vi.fn(), signup: vi.fn(), me: vi.fn() },
  projectsApi: {},
  subscriptionApi: {},
  feedbackApi: {},
  roundsApi: {},
}));

function renderWithRouter(ui: React.ReactElement, path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      {ui}
    </MemoryRouter>
  );
}

describe('Pages Load Without Errors', () => {
  it('/ (home/landing) renders', () => {
    renderWithRouter(<LandingPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
  });

  it('/features renders', () => {
    renderWithRouter(<FeaturesPage />);
    expect(screen.getByText(/Features built for Webflow/i)).toBeDefined();
  });

  it('/how-to renders', () => {
    renderWithRouter(<HowToPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
  });

  it('/about renders', () => {
    renderWithRouter(<AboutPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
  });

  it('/privacy renders', () => {
    renderWithRouter(<PrivacyPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
  });

  it('/terms renders', () => {
    renderWithRouter(<TermsPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
  });

  it('/contact renders', () => {
    renderWithRouter(<ContactPage />);
    expect(screen.getByText(/Contact Us/i)).toBeDefined();
  });

  it('/faq renders', () => {
    renderWithRouter(<FaqPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
  });

  it('/login renders', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/password/i)).toBeDefined();
  });

  it('/signup renders', () => {
    renderWithRouter(<SignupPage />);
    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/password/i)).toBeDefined();
  });
});
