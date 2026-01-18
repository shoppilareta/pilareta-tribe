'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthButton } from './AuthButton';

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/studio-locator', label: 'Studios' },
    { href: '/learn', label: 'Learn' },
    { href: '/ugc', label: 'Community' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(246,237,221,0.1)] bg-[#202219]/95 backdrop-blur-sm">
      <nav className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">
            PILARETA TRIBE
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-opacity ${
                pathname === link.href
                  ? 'opacity-100'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Button */}
        <AuthButton />
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-[rgba(246,237,221,0.1)]">
        <div className="container flex items-center justify-center gap-6 py-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs transition-opacity ${
                pathname === link.href
                  ? 'opacity-100'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
