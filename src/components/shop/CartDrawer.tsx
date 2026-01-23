'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useCart } from './CartProvider';

function formatPrice(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount));
}

export function CartDrawer() {
  const { cart, isOpen, closeCart, isLoading, updateQuantity, removeItem } = useCart();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeCart]);

  if (!isOpen) return null;

  const handleCheckout = () => {
    if (cart?.checkoutUrl) {
      window.location.href = cart.checkoutUrl;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[90vw] max-w-[420px] bg-[#202219] z-50 shadow-2xl flex flex-col border-l border-[rgba(246,237,221,0.1)]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(246,237,221,0.1)]">
          <h2 className="text-xl font-medium">Your Cart</h2>
          <button
            onClick={closeCart}
            className="w-10 h-10 flex items-center justify-center rounded-full opacity-60 hover:opacity-100 hover:bg-[rgba(246,237,221,0.05)] transition-all"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {!cart || cart.lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-20 h-20 rounded-full bg-[rgba(246,237,221,0.05)] flex items-center justify-center mb-6">
                <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="opacity-60 mb-6 text-base">Your cart is empty</p>
              <button
                onClick={closeCart}
                className="px-6 py-3 border border-[rgba(246,237,221,0.3)] rounded-full text-sm hover:bg-[rgba(246,237,221,0.05)] transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.lines.map((line) => (
                <li
                  key={line.id}
                  className="flex gap-4 p-4 bg-[rgba(246,237,221,0.03)] rounded-xl border border-[rgba(246,237,221,0.08)]"
                >
                  {/* Product Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 bg-[rgba(246,237,221,0.05)] rounded-lg overflow-hidden">
                    {line.merchandise.image ? (
                      <Image
                        src={line.merchandise.image.url}
                        alt={line.merchandise.image.altText || line.merchandise.product.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-20">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <h3 className="font-medium text-sm leading-snug mb-1">
                      {line.merchandise.product.title}
                    </h3>
                    {line.merchandise.title !== 'Default Title' && (
                      <p className="text-xs opacity-50 mb-2">{line.merchandise.title}</p>
                    )}
                    <p className="text-sm opacity-70 mb-3">
                      {formatPrice(line.merchandise.price.amount, line.merchandise.price.currencyCode)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="flex items-center border border-[rgba(246,237,221,0.15)] rounded-lg">
                        <button
                          onClick={() => updateQuantity(line.id, line.quantity - 1)}
                          disabled={isLoading}
                          className="w-9 h-9 flex items-center justify-center hover:bg-[rgba(246,237,221,0.05)] transition-colors disabled:opacity-30 rounded-l-lg"
                          aria-label="Decrease quantity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="text-sm w-10 text-center">{line.quantity}</span>
                        <button
                          onClick={() => updateQuantity(line.id, line.quantity + 1)}
                          disabled={isLoading}
                          className="w-9 h-9 flex items-center justify-center hover:bg-[rgba(246,237,221,0.05)] transition-colors disabled:opacity-30 rounded-r-lg"
                          aria-label="Increase quantity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(line.id)}
                        disabled={isLoading}
                        className="ml-auto p-2 opacity-40 hover:opacity-100 transition-opacity disabled:opacity-20"
                        aria-label="Remove item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart && cart.lines.length > 0 && (
          <div className="border-t border-[rgba(246,237,221,0.1)] p-6 space-y-5">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="opacity-60">Subtotal</span>
              <span className="text-lg font-medium">
                {formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}
              </span>
            </div>
            <p className="text-xs opacity-40">
              Shipping and taxes calculated at checkout
            </p>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full py-4 bg-[#f6eddd] text-[#202219] font-medium rounded-full hover:bg-[#e3dccb] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Checkout'}
            </button>

            {/* Continue Shopping */}
            <button
              onClick={closeCart}
              className="w-full py-3 text-sm opacity-50 hover:opacity-80 transition-opacity"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
