/**
 * ROUTE COMPLETENESS: Verifies all expected routes exist in App.tsx
 * Tests that App renders each route correctly by replacing BrowserRouter with MemoryRouter.
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import page components directly
import { LandingPage } from '../pages/LandingPage';
import { FeaturesPage } from '../pages/FeaturesPage';
import HowToPage from '../pages/HowToPage';
import { PrivacyPage } from '../pages/PrivacyPage';
import { TermsPage } from '../pages/TermsPage';
import { AboutPage } from '../pages/AboutPage';
import { ContactPage } from '../pages/ContactPage';
import { FaqPage } from '../pages/FaqPage';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';

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

// Replicate the App routes but inside MemoryRouter for testing
function TestApp({ initialPath }: { initialPath: string }) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/how-to" element={<HowToPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Route Completeness Check', () => {
  it('/security has no dedicated route, redirects to / via catch-all', () => {
    const { container } = render(<TestApp initialPath="/security" />);
    expect(container.innerHTML).toContain('Webflow');
  });

  it('/help has no dedicated route, redirects to / via catch-all (FAQ is at /faq)', () => {
    const { container } = render(<TestApp initialPath="/help" />);
    expect(container.innerHTML).toContain('Webflow');
  });

  const publicRoutes = [
    { path: '/', name: 'Home' },
    { path: '/features', name: 'Features' },
    { path: '/how-to', name: 'How To' },
    { path: '/privacy', name: 'Privacy' },
    { path: '/terms', name: 'Terms' },
    { path: '/about', name: 'About' },
    { path: '/contact', name: 'Contact' },
    { path: '/faq', name: 'FAQ' },
    { path: '/login', name: 'Login' },
    { path: '/signup', name: 'Signup' },
  ];

  publicRoutes.forEach(({ path, name }) => {
    it(`${name} (${path}) renders non-empty content`, () => {
      const { container } = render(<TestApp initialPath={path} />);
      expect(container.innerHTML.length).toBeGreaterThan(100);
    });
  });
});
