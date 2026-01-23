import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { CartProvider, CartDrawer } from '@/components/shop';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pilareta Tribe',
  description: 'Your Pilates community - Find studios, learn techniques, share your journey',
  keywords: ['pilates', 'fitness', 'wellness', 'studio locator', 'community'],
  openGraph: {
    title: 'Pilareta Tribe',
    description: 'Your Pilates community',
    url: 'https://tribe.pilareta.com',
    siteName: 'Pilareta Tribe',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
