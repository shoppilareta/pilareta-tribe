'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface WishlistContextType {
  wishlistedHandles: Set<string>;
  isAuthenticated: boolean;
  toggleWishlist: (handle: string) => Promise<void>;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistedHandles, setWishlistedHandles] = useState<Set<string>>(new Set());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check auth and fetch wishlist on mount
  useEffect(() => {
    async function init() {
      try {
        const userRes = await fetch('/api/user');
        if (!userRes.ok) return;
        const userData = await userRes.json();
        if (!userData.user) return;

        setIsAuthenticated(true);

        const wishlistRes = await fetch('/api/wishlist');
        if (wishlistRes.ok) {
          const data = await wishlistRes.json();
          setWishlistedHandles(new Set(data.handles || []));
        }
      } catch {
        // Not authenticated or error — silently ignore
      }
    }
    init();
  }, []);

  const toggleWishlist = useCallback(async (handle: string) => {
    if (!isAuthenticated) return;

    const wasWishlisted = wishlistedHandles.has(handle);

    // Optimistic update
    setWishlistedHandles(prev => {
      const next = new Set(prev);
      if (wasWishlisted) {
        next.delete(handle);
      } else {
        next.add(handle);
      }
      return next;
    });

    setIsLoading(true);
    try {
      if (wasWishlisted) {
        await fetch(`/api/wishlist/${encodeURIComponent(handle)}`, { method: 'DELETE' });
      } else {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ handle }),
        });
      }
    } catch {
      // Revert on failure
      setWishlistedHandles(prev => {
        const next = new Set(prev);
        if (wasWishlisted) {
          next.add(handle);
        } else {
          next.delete(handle);
        }
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, wishlistedHandles]);

  return (
    <WishlistContext.Provider value={{ wishlistedHandles, isAuthenticated, toggleWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
