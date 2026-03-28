'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { AuthButton } from './AuthButton';

interface NavLink {
  href: string;
  label: string;
  external?: boolean;
}

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!mobileMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const navLinks: NavLink[] = [
    { href: '/', label: 'Home' },
    { href: '/studio-locator', label: 'Studios' },
    { href: '/learn', label: 'Learn' },
    { href: '/track', label: 'Track' },
    { href: '/community', label: 'Community' },
    { href: 'https://pilareta.com', label: 'Shop', external: true },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#202219]" ref={menuRef}>
      <nav className="container">
        {/* Main Navigation Bar */}
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="https://pilareta.com/cdn/shop/files/image.png?v=1749118441&width=500"
              alt="Pilareta"
              width={140}
              height={48}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = !link.external && isActive(pathname, link.href);
              return link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm tracking-wide transition-all hover:opacity-100 opacity-60"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ paddingBottom: '2px', borderBottom: '2px solid transparent' }}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm tracking-wide transition-all hover:opacity-100 ${
                    active ? 'opacity-100 font-medium' : 'opacity-60'
                  }`}
                  style={{
                    paddingBottom: '2px',
                    borderBottom: active ? '2px solid #f6eddd' : '2px solid transparent',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Section - Auth & Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Auth Button - Desktop */}
            <div className="hidden md:block">
              <AuthButton />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -mr-2"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              style={{ transition: 'transform 0.2s' }}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className="md:hidden"
          style={{
            maxHeight: mobileMenuOpen ? '100vh' : '0',
            opacity: mobileMenuOpen ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.3s ease, opacity 0.2s ease',
          }}
        >
          <div
            className="border-t border-[rgba(246,237,221,0.1)] py-6"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const active = !link.external && isActive(pathname, link.href);
                return link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg tracking-normal py-3 transition-all hover:opacity-100 opacity-60"
                    style={{ fontFamily: '"Instrument Sans", sans-serif' }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-lg tracking-normal py-3 transition-all hover:opacity-100 ${
                      active ? 'opacity-100 font-medium' : 'opacity-60'
                    }`}
                    style={{
                      fontFamily: '"Instrument Sans", sans-serif',
                      borderLeft: active ? '3px solid #f6eddd' : '3px solid transparent',
                      paddingLeft: '0.75rem',
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-4 mt-2 border-t border-[rgba(246,237,221,0.1)]">
                <AuthButton />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom border */}
      <div className="h-px bg-[rgba(246,237,221,0.1)]" />
    </header>
  );
}
