/**
 * ACCESSIBILITY TESTING
 * Verifies semantic HTML, ARIA attributes, form labels, keyboard navigation support.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { LandingPage } from '../pages/LandingPage';
import { ContactPage } from '../pages/ContactPage';
import { FaqPage } from '../pages/FaqPage';
import { FeaturesPage } from '../pages/FeaturesPage';
import { PrivacyPage } from '../pages/PrivacyPage';
import { TermsPage } from '../pages/TermsPage';
import { AboutPage } from '../pages/AboutPage';
import HowToPage from '../pages/HowToPage';

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

describe('Semantic HTML: Navigation', () => {
  it('Navbar uses <nav> element with role and aria-label', () => {
    renderWithRouter(<Navbar />);
    const nav = screen.getByRole('navigation');
    expect(nav).toBeDefined();
    expect(nav).toHaveAttribute('aria-label');
  });

  it('Footer uses <footer> element with role', () => {
    renderWithRouter(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeDefined();
  });
});

describe('Semantic HTML: Headings', () => {
  it('Landing page has exactly one h1', () => {
    renderWithRouter(<LandingPage />);
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s.length).toBe(1);
  });

  it('Features page has exactly one h1', () => {
    renderWithRouter(<FeaturesPage />);
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s.length).toBe(1);
  });

  it('About page has exactly one h1', () => {
    renderWithRouter(<AboutPage />);
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s.length).toBe(1);
  });

  it('Privacy page has exactly one h1', () => {
    renderWithRouter(<PrivacyPage />);
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s.length).toBe(1);
  });

  it('Terms page has exactly one h1', () => {
    renderWithRouter(<TermsPage />);
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s.length).toBe(1);
  });

  it('Contact page has exactly one h1', () => {
    renderWithRouter(<ContactPage />);
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s.length).toBe(1);
  });

  it('FAQ page has exactly one h1', () => {
    renderWithRouter(<FaqPage />);
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s.length).toBe(1);
  });

  it('How-To page has exactly one h1', () => {
    renderWithRouter(<HowToPage />);
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s.length).toBe(1);
  });
});

describe('Form Accessibility', () => {
  it('Contact form: all inputs have associated labels', () => {
    renderWithRouter(<ContactPage />);
    // Each input should be reachable via getByLabelText
    expect(screen.getByLabelText(/^name/i)).toBeDefined();
    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/subject/i)).toBeDefined();
    expect(screen.getByLabelText(/priority/i)).toBeDefined();
    expect(screen.getByLabelText(/message/i)).toBeDefined();
  });
});

describe('Interactive Elements: ARIA', () => {
  it('Navbar mobile menu button has aria-expanded', () => {
    renderWithRouter(<Navbar />);
    const btn = screen.getByLabelText('Toggle menu');
    expect(btn).toHaveAttribute('aria-expanded');
  });

  it('FAQ items have aria-expanded on toggle buttons', () => {
    renderWithRouter(<FaqPage />);
    const buttons = screen.getAllByRole('button');
    const faqButtons = buttons.filter(b => b.hasAttribute('aria-expanded'));
    expect(faqButtons.length).toBeGreaterThan(0);
  });

  it('Footer accordion buttons have aria-expanded', () => {
    // Footer accordion is visible only on mobile (sm:hidden), but buttons exist in DOM
    renderWithRouter(<Footer />);
    const buttons = screen.getAllByRole('button');
    const accordionBtns = buttons.filter(b => b.hasAttribute('aria-expanded'));
    expect(accordionBtns.length).toBeGreaterThan(0);
  });
});

describe('SVG Icons: aria-hidden', () => {
  it('decorative SVGs in Navbar are aria-hidden', () => {
    const { container } = renderWithRouter(<Navbar />);
    const svgs = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('decorative SVGs in Footer are aria-hidden', () => {
    const { container } = renderWithRouter(<Footer />);
    const svgs = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(svgs.length).toBeGreaterThan(0);
  });
});
