'use client';

import { useCart } from './CartProvider';

export function CartButton() {
  const { openCart, totalQuantity } = useCart();

  return (
    <button
      onClick={openCart}
      className="relative p-2 -mr-2 opacity-70 hover:opacity-100 transition-opacity"
      aria-label={`Shopping cart with ${totalQuantity} items`}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      {totalQuantity > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#f6eddd] text-[#202219] text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
          {totalQuantity > 99 ? '99+' : totalQuantity}
        </span>
      )}
    </button>
  );
}
