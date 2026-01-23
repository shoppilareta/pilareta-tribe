'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useCart } from './CartProvider';

function formatPrice(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat('en-IN', {
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

  const totalItems = cart?.lines.reduce((sum, line) => sum + line.quantity, 0) || 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#1a1c16] z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[rgba(246,237,221,0.1)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[rgba(246,237,221,0.08)] flex items-center justify-center">
                <svg className="w-6 h-6 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-medium text-[#f6eddd]">Your Cart</h2>
                <p className="text-sm text-[#f6eddd]/50 mt-0.5">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[rgba(246,237,221,0.08)] transition-colors"
              aria-label="Close cart"
            >
              <svg className="w-5 h-5 text-[#f6eddd]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {!cart || cart.lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
              <div className="w-24 h-24 rounded-full bg-[rgba(246,237,221,0.05)] flex items-center justify-center mb-8">
                <svg className="w-12 h-12 text-[#f6eddd]/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#f6eddd] mb-2">Your cart is empty</h3>
              <p className="text-[#f6eddd]/50 mb-8 text-sm max-w-[260px] leading-relaxed">
                Discover our curated collection of Pilates apparel designed for your practice.
              </p>
              <button
                onClick={closeCart}
                className="px-8 py-3 bg-[#f6eddd] text-[#1a1c16] font-medium rounded-full text-sm hover:bg-[#e8dfcc] transition-colors"
              >
                Browse Collection
              </button>
            </div>
          ) : (
            <div className="px-6 py-6 space-y-4">
              {cart.lines.map((line) => (
                <div
                  key={line.id}
                  className="bg-[rgba(246,237,221,0.04)] rounded-2xl p-5 border border-[rgba(246,237,221,0.08)]"
                >
                  <div className="flex gap-5">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 flex-shrink-0 bg-[rgba(246,237,221,0.05)] rounded-xl overflow-hidden">
                      {line.merchandise.image ? (
                        <Image
                          src={line.merchandise.image.url}
                          alt={line.merchandise.image.altText || line.merchandise.product.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-[#f6eddd]/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[#f6eddd] text-[15px] leading-snug mb-2 line-clamp-2">
                        {line.merchandise.product.title}
                      </h3>

                      {line.merchandise.title !== 'Default Title' && (
                        <p className="text-xs text-[#f6eddd]/50 mb-3">
                          {line.merchandise.title}
                        </p>
                      )}

                      <p className="text-base font-semibold text-[#f6eddd]">
                        {formatPrice(line.merchandise.price.amount, line.merchandise.price.currencyCode)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(line.id)}
                      disabled={isLoading}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[rgba(246,237,221,0.08)] transition-colors self-start"
                      aria-label="Remove item"
                    >
                      <svg className="w-4 h-4 text-[#f6eddd]/40 hover:text-[#f6eddd]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-[rgba(246,237,221,0.08)]">
                    <span className="text-xs text-[#f6eddd]/50 uppercase tracking-wide">Quantity</span>
                    <div className="flex items-center gap-1 bg-[rgba(246,237,221,0.06)] rounded-full p-1">
                      <button
                        onClick={() => updateQuantity(line.id, line.quantity - 1)}
                        disabled={isLoading}
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[rgba(246,237,221,0.1)] transition-colors disabled:opacity-30"
                        aria-label="Decrease quantity"
                      >
                        <svg className="w-4 h-4 text-[#f6eddd]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="text-sm font-medium text-[#f6eddd] w-10 text-center">{line.quantity}</span>
                      <button
                        onClick={() => updateQuantity(line.id, line.quantity + 1)}
                        disabled={isLoading}
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[rgba(246,237,221,0.1)] transition-colors disabled:opacity-30"
                        aria-label="Increase quantity"
                      >
                        <svg className="w-4 h-4 text-[#f6eddd]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart && cart.lines.length > 0 && (
          <div className="border-t border-[rgba(246,237,221,0.1)] bg-[rgba(246,237,221,0.02)]">
            {/* Order Summary */}
            <div className="px-6 py-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#f6eddd]/50">Subtotal</span>
                <span className="text-[#f6eddd]/70">
                  {formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#f6eddd]/50">Shipping</span>
                <span className="text-[#f6eddd]/50 text-xs">Calculated at checkout</span>
              </div>
            </div>

            {/* Total */}
            <div className="px-6 py-4 border-t border-[rgba(246,237,221,0.08)]">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#f6eddd]">Total</span>
                <span className="text-2xl font-semibold text-[#f6eddd]">
                  {formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <div className="px-6 pb-6 pt-2 space-y-3">
              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full py-4 bg-[#f6eddd] text-[#1a1c16] font-semibold rounded-full hover:bg-[#e8dfcc] transition-colors disabled:opacity-50 text-[15px]"
              >
                {isLoading ? 'Processing...' : 'Proceed to Checkout'}
              </button>

              <button
                onClick={closeCart}
                className="w-full py-3 text-sm text-[#f6eddd]/50 hover:text-[#f6eddd]/70 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
