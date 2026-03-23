import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/how-to', label: 'Docs' },
  { to: '/blog', label: 'Blog', disabled: true },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (to: string) => location.pathname === to;

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 bg-white border-b border-border transition-shadow ${scrolled ? 'shadow-md' : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" aria-label="Webflow Feedback home">
            <svg className="w-7 h-7 text-primary" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
            </svg>
            <span className="font-bold text-text-primary text-lg hidden sm:inline">Webflow Feedback</span>
          </Link>

          {/* Center links - desktop */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) =>
              link.disabled ? (
                <span
                  key={link.label}
                  className="text-sm font-medium text-gray-300 cursor-default"
                >
                  {link.label}
                </span>
              ) : (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? 'text-primary'
                      : 'text-text-secondary hover:text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Right actions - desktop */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-text-secondary hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-primary-dark active:bg-primary-darker transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Start Free Trial
            </Link>
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
            {NAV_LINKS.map((link) =>
              link.disabled ? (
                <span
                  key={link.label}
                  className="text-sm font-medium text-gray-300 py-2 px-2"
                >
                  {link.label}
                </span>
              ) : (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`text-sm font-medium py-2 px-2 rounded-md transition-colors min-h-[44px] flex items-center ${
                    isActive(link.to)
                      ? 'text-primary bg-blue-50'
                      : 'text-text-secondary hover:text-primary hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
            <hr className="border-border my-2" />
            <Link
              to="/login"
              className="text-sm font-medium text-text-secondary py-2 px-2 rounded-md hover:bg-gray-50 min-h-[44px] flex items-center"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-md text-center hover:bg-primary-dark transition-colors mt-1"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
