'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { AuthButton } from './AuthButton';
import { CartButton } from './shop/CartButton';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/studio-locator', label: 'Studios' },
    { href: '/learn', label: 'Learn' },
    { href: '/ugc', label: 'Community' },
    { href: '/shop', label: 'Shop' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#202219]">
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
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm tracking-wide transition-opacity hover:opacity-100 ${
                  pathname === link.href
                    ? 'opacity-100'
                    : 'opacity-70'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section - Cart, Auth & Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Cart Button */}
            <CartButton />

            {/* Auth Button - Desktop */}
            <div className="hidden md:block">
              <AuthButton />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -mr-2"
              aria-label="Toggle menu"
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
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[rgba(246,237,221,0.1)] py-4">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm tracking-wide py-2 transition-opacity ${
                    pathname === link.href
                      ? 'opacity-100'
                      : 'opacity-70'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-[rgba(246,237,221,0.1)]">
                <AuthButton />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom border */}
      <div className="h-px bg-[rgba(246,237,221,0.1)]" />
    </header>
  );
}
