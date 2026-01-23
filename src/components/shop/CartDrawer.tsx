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
      <div className="fixed top-0 right-0 h-full w-[90vw] max-w-[440px] bg-[#202219] z-50 shadow-2xl flex flex-col border-l border-[rgba(246,237,221,0.15)]">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[rgba(246,237,221,0.1)] bg-[rgba(246,237,221,0.02)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[rgba(246,237,221,0.08)] flex items-center justify-center">
              <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-medium">Your Cart</h2>
              {cart && cart.lines.length > 0 && (
                <p className="text-xs opacity-50">{cart.lines.length} {cart.lines.length === 1 ? 'item' : 'items'}</p>
              )}
            </div>
          </div>
          <button
            onClick={closeCart}
            className="w-10 h-10 flex items-center justify-center rounded-full opacity-50 hover:opacity-100 hover:bg-[rgba(246,237,221,0.08)] transition-all"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {!cart || cart.lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-24 h-24 rounded-full bg-[rgba(246,237,221,0.05)] flex items-center justify-center mb-8">
                <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
              <p className="opacity-50 mb-8 text-sm max-w-[240px]">
                Discover our curated collection of Pilates apparel
              </p>
              <button
                onClick={closeCart}
                className="px-8 py-3.5 bg-[#f6eddd] text-[#202219] font-medium rounded-full text-sm hover:bg-[#e3dccb] transition-colors"
              >
                Browse Collection
              </button>
            </div>
          ) : (
            <ul className="space-y-5">
              {cart.lines.map((line) => (
                <li
                  key={line.id}
                  className="flex gap-5 p-5 bg-[rgba(246,237,221,0.03)] rounded-2xl border border-[rgba(246,237,221,0.08)] hover:border-[rgba(246,237,221,0.12)] transition-colors"
                >
                  {/* Product Image */}
                  <div className="relative w-28 h-28 flex-shrink-0 bg-[rgba(246,237,221,0.05)] rounded-xl overflow-hidden">
                    {line.merchandise.image ? (
                      <Image
                        src={line.merchandise.image.url}
                        alt={line.merchandise.image.altText || line.merchandise.product.title}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-20">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0 flex flex-col py-1">
                    <h3 className="font-medium text-[15px] leading-snug mb-1.5 line-clamp-2">
                      {line.merchandise.product.title}
                    </h3>
                    {line.merchandise.title !== 'Default Title' && (
                      <p className="text-xs opacity-50 mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
                        {line.merchandise.title}
                      </p>
                    )}
                    <p className="text-base font-medium opacity-80 mb-4">
                      {formatPrice(line.merchandise.price.amount, line.merchandise.price.currencyCode)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4 mt-auto">
                      <div className="flex items-center bg-[rgba(246,237,221,0.05)] rounded-full">
                        <button
                          onClick={() => updateQuantity(line.id, line.quantity - 1)}
                          disabled={isLoading}
                          className="w-10 h-10 flex items-center justify-center hover:bg-[rgba(246,237,221,0.08)] transition-colors disabled:opacity-30 rounded-full"
                          aria-label="Decrease quantity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{line.quantity}</span>
                        <button
                          onClick={() => updateQuantity(line.id, line.quantity + 1)}
                          disabled={isLoading}
                          className="w-10 h-10 flex items-center justify-center hover:bg-[rgba(246,237,221,0.08)] transition-colors disabled:opacity-30 rounded-full"
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
                        className="ml-auto w-10 h-10 flex items-center justify-center rounded-full opacity-40 hover:opacity-100 hover:bg-[rgba(246,237,221,0.05)] transition-all disabled:opacity-20"
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
          <div className="border-t border-[rgba(246,237,221,0.1)] px-8 py-6 space-y-6 bg-[rgba(246,237,221,0.02)]">
            {/* Order Summary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-50">Subtotal</span>
                <span className="opacity-70">
                  {formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-50">Shipping</span>
                <span className="opacity-50 text-xs">Calculated at checkout</span>
              </div>
              <div className="h-px bg-[rgba(246,237,221,0.1)] my-2"></div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Total</span>
                <span className="text-xl font-medium">
                  {formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full py-4 bg-[#f6eddd] text-[#202219] font-semibold rounded-full hover:bg-[#e3dccb] transition-colors disabled:opacity-50 text-[15px]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Proceed to Checkout'
              )}
            </button>

            {/* Continue Shopping */}
            <button
              onClick={closeCart}
              className="w-full py-3 text-sm opacity-40 hover:opacity-70 transition-opacity flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
