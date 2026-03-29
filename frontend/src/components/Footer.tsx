import { useState } from 'react';
import { Link } from 'react-router-dom';

const FOOTER_SECTIONS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', to: '/features' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Blog', to: '/blog', disabled: true },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'How To', to: '/how-to' },
      { label: 'FAQ', to: '/faq' },
      { label: 'API Docs', to: '/how-to', hash: '#api' },
      { label: 'Security', to: '/privacy' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Twitter', href: 'https://twitter.com' },
      { label: 'Discord', href: 'https://discord.gg' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', to: '/privacy' },
      { label: 'Terms', to: '/terms' },
      { label: 'Security', to: '/privacy' },
    ],
  },
];

function FooterLink({ link }: { link: { label: string; to?: string; href?: string; hash?: string; disabled?: boolean } }) {
  if (link.disabled) {
    return <span className="text-xs text-gray-500 cursor-default leading-[1.75]">{link.label}</span>;
  }
  if (link.href) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-[#F3F4F6] hover:text-white transition-colors leading-[1.75]"
      >
        {link.label}
      </a>
    );
  }
  return (
    <Link
      to={link.hash ? `${link.to}${link.hash}` : link.to!}
      className="text-xs text-[#F3F4F6] hover:text-white transition-colors leading-[1.75]"
    >
      {link.label}
    </Link>
  );
}

function MobileAccordionSection({ section }: { section: typeof FOOTER_SECTIONS[number] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-700 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-[#E5E7EB]">{section.title}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="flex flex-col gap-2 pb-3 pl-1">
          {section.links.map((link) => (
            <FooterLink key={link.label} link={link} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#1F2937] text-[#E5E7EB]" role="contentinfo">
      <div className="max-w-7xl mx-auto px-12 sm:px-12 lg:px-12 py-8">
        {/* Desktop: 4 columns */}
        <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-[#E5E7EB] mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile: accordion */}
        <div className="sm:hidden">
          {FOOTER_SECTIONS.map((section) => (
            <MobileAccordionSection key={section.title} section={section} />
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-500">
            &copy; 2026 Phasemark. All rights reserved.
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Made with ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}
