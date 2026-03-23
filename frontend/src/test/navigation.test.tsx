/**
 * FUNCTIONAL TESTING: Links & Navigation
 * Verifies nav links, footer links, and internal links resolve to defined routes.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

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

// All routes defined in App.tsx
const DEFINED_ROUTES = [
  '/', '/features', '/how-to', '/privacy', '/terms',
  '/about', '/contact', '/faq', '/login', '/signup',
  '/projects', '/pricing', '/settings',
];

describe('Navbar Links', () => {
  it('all nav links point to defined routes', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>);
    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('/')) {
        expect(
          DEFINED_ROUTES.some(r => href === r || href.startsWith(r + '/')),
          `Nav link "${link.textContent}" points to "${href}" which is not a defined route`
        ).toBe(true);
      }
    });
  });

  it('has Sign In link pointing to /login', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>);
    const signIn = screen.getByText('Sign In');
    expect(signIn.closest('a')).toHaveAttribute('href', '/login');
  });

  it('has Start Free Trial button pointing to /signup', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>);
    const cta = screen.getAllByText('Start Free Trial');
    expect(cta[0].closest('a')).toHaveAttribute('href', '/signup');
  });

  it('has mobile menu toggle button with aria-label', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>);
    const toggle = screen.getByLabelText('Toggle menu');
    expect(toggle).toBeDefined();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Footer Links', () => {
  it('all internal footer links point to defined routes', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>);
    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('/')) {
        const basePath = href.split('#')[0];
        expect(
          DEFINED_ROUTES.some(r => basePath === r || basePath.startsWith(r + '/')),
          `Footer link "${link.textContent}" points to "${href}" which is not a defined route`
        ).toBe(true);
      }
    });
  });

  it('external links open in new tab with noopener', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>);
    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('http')) {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
      }
    });
  });

  it('has Privacy link in footer', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>);
    const privacyLinks = screen.getAllByText('Privacy');
    expect(privacyLinks.length).toBeGreaterThan(0);
  });

  it('has Terms link in footer', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>);
    const termsLinks = screen.getAllByText('Terms');
    expect(termsLinks.length).toBeGreaterThan(0);
  });
});

// Note: Router-level route testing is covered in route-completeness.test.tsx
// App contains its own BrowserRouter, so we can't wrap it in MemoryRouter.
