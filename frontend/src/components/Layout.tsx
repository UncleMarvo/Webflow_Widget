import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';

const TIER_BADGE_COLORS: Record<string, string> = {
  starter: 'bg-gray-100 text-gray-700',
  pro: 'bg-blue-100 text-blue-700',
  agency: 'bg-purple-100 text-purple-700',
};

const AUTH_NAV_LINKS = [
  { to: '/projects', label: 'Projects' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/settings', label: 'Settings' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { tier } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <div className="min-h-screen bg-surface font-sans">
      <nav className="sticky top-0 z-50 bg-white border-b border-border" role="navigation" aria-label="App navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: logo + nav links */}
            <div className="flex items-center gap-8">
              <Link to="/projects" className="flex items-center gap-2" aria-label="Dashboard">
                <svg className="w-7 h-7 text-primary" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                </svg>
                <span className="font-bold text-text-primary text-lg hidden sm:inline">Feedback Tool</span>
              </Link>
              <div className="hidden md:flex items-center gap-6">
                {AUTH_NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`text-sm font-medium transition-colors ${
                      isActive(link.to)
                        ? 'text-primary'
                        : 'text-text-secondary hover:text-primary'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: tier badge + user + logout */}
            <div className="hidden md:flex items-center gap-4">
              {tier && (
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${TIER_BADGE_COLORS[tier.tier] || TIER_BADGE_COLORS.starter}`}>
                  {tier.displayName}
                </span>
              )}
              <span className="text-sm text-text-secondary">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-text-secondary hover:text-primary transition-colors"
              >
                Log out
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white px-4 pb-4">
            <div className="flex flex-col gap-1 pt-3">
              {AUTH_NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium py-2 px-2 rounded-md transition-colors min-h-[44px] flex items-center ${
                    isActive(link.to)
                      ? 'text-primary bg-blue-50'
                      : 'text-text-secondary hover:text-primary hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-border my-2" />
              {tier && (
                <div className="flex items-center gap-2 px-2 py-1">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${TIER_BADGE_COLORS[tier.tier] || TIER_BADGE_COLORS.starter}`}>
                    {tier.displayName}
                  </span>
                </div>
              )}
              <span className="text-sm text-text-secondary px-2 py-1">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-text-secondary hover:text-primary py-2 px-2 text-left min-h-[44px]"
              >
                Log out
              </button>
            </div>
          </div>
        )}
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
