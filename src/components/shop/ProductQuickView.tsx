'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import type { ShopifyProduct, ShopifyProductVariant } from '@/lib/shopify/types';
import { useCart } from './CartProvider';

interface ProductQuickViewProps {
  product: ShopifyProduct;
  isOpen: boolean;
  onClose: () => void;
}

function formatPrice(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount));
}

export function ProductQuickView({ product, isOpen, onClose }: ProductQuickViewProps) {
  const { addToCart, isLoading } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState(false);

  // Extract unique options (Color, Size, etc.)
  const options = useMemo(() => {
    const optionMap: Record<string, Set<string>> = {};

    product.variants.forEach(variant => {
      variant.selectedOptions.forEach(opt => {
        if (!optionMap[opt.name]) {
          optionMap[opt.name] = new Set();
        }
        optionMap[opt.name].add(opt.value);
      });
    });

    return Object.entries(optionMap).map(([name, values]) => ({
      name,
      values: Array.from(values),
    }));
  }, [product.variants]);

  // Set default options on mount
  useEffect(() => {
    if (options.length > 0 && Object.keys(selectedOptions).length === 0) {
      const defaults: Record<string, string> = {};
      options.forEach(opt => {
        defaults[opt.name] = opt.values[0];
      });
      setSelectedOptions(defaults);
    }
  }, [options, selectedOptions]);

  // Find matching variant based on selected options
  const selectedVariant = useMemo(() => {
    return product.variants.find(variant => {
      return variant.selectedOptions.every(opt =>
        selectedOptions[opt.name] === opt.value
      );
    });
  }, [product.variants, selectedOptions]);

  // Check if a specific option value is available
  const isOptionAvailable = (optionName: string, optionValue: string) => {
    return product.variants.some(variant => {
      const hasOption = variant.selectedOptions.some(
        opt => opt.name === optionName && opt.value === optionValue
      );
      if (!hasOption) return false;

      const otherOptionsMatch = variant.selectedOptions.every(opt => {
        if (opt.name === optionName) return true;
        return selectedOptions[opt.name] === opt.value || !selectedOptions[opt.name];
      });

      return otherOptionsMatch && variant.availableForSale;
    });
  };

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleAddToCart = async () => {
    if (!selectedVariant || !selectedVariant.availableForSale) return;

    setIsAdding(true);
    try {
      await addToCart(product, selectedVariant, 1);
      onClose();
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen) return null;

  const images = product.images.length > 0 ? product.images : (product.featuredImage ? [product.featuredImage] : []);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
        <div
          className="bg-[#202219] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-[rgba(246,237,221,0.1)] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center bg-[rgba(32,34,25,0.9)] rounded-full opacity-70 hover:opacity-100 transition-opacity border border-[rgba(246,237,221,0.1)]"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex flex-col md:flex-row max-h-[90vh] overflow-auto">
            {/* Image Gallery */}
            <div className="md:w-1/2 p-6 md:p-8">
              {/* Main Image */}
              <div className="relative aspect-square bg-[rgba(246,237,221,0.03)] rounded-xl overflow-hidden mb-4">
                {images[selectedImage] ? (
                  <Image
                    src={images[selectedImage].url}
                    alt={images[selectedImage].altText || product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-20">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === idx
                          ? 'border-[#f6eddd] opacity-100'
                          : 'border-transparent opacity-50 hover:opacity-80'
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={img.altText || `${product.title} ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="md:w-1/2 p-6 md:p-8 md:border-l border-[rgba(246,237,221,0.1)] flex flex-col">
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-medium mb-3 leading-tight">{product.title}</h2>

                <p className="text-xl opacity-70 mb-8">
                  {selectedVariant
                    ? formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode)
                    : formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)
                  }
                </p>

                {/* Options */}
                <div className="space-y-6 mb-8">
                  {options.map(option => (
                    <div key={option.name}>
                      <label className="block text-sm opacity-50 mb-3 uppercase tracking-wider">
                        {option.name}
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {option.values.map(value => {
                          const isSelected = selectedOptions[option.name] === value;
                          const isAvailable = isOptionAvailable(option.name, value);
                          const isColor = option.name.toLowerCase() === 'color' || option.name.toLowerCase() === 'colour';

                          if (isColor) {
                            return (
                              <button
                                key={value}
                                onClick={() => setSelectedOptions(prev => ({ ...prev, [option.name]: value }))}
                                disabled={!isAvailable}
                                className={`
                                  w-10 h-10 rounded-full border-2 transition-all
                                  ${isSelected ? 'border-[#f6eddd] scale-110' : 'border-[rgba(246,237,221,0.2)]'}
                                  ${!isAvailable ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105'}
                                `}
                                style={{ backgroundColor: getColorCode(value) }}
                                title={value}
                              />
                            );
                          }

                          return (
                            <button
                              key={value}
                              onClick={() => setSelectedOptions(prev => ({ ...prev, [option.name]: value }))}
                              disabled={!isAvailable}
                              className={`
                                px-5 py-2.5 text-sm border rounded-lg transition-all
                                ${isSelected
                                  ? 'border-[#f6eddd] bg-[rgba(246,237,221,0.1)]'
                                  : 'border-[rgba(246,237,221,0.2)] hover:border-[rgba(246,237,221,0.4)]'
                                }
                                ${!isAvailable ? 'opacity-30 cursor-not-allowed line-through' : ''}
                              `}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Description */}
                {product.description && (
                  <div className="mb-8">
                    <h3 className="text-sm opacity-50 mb-3 uppercase tracking-wider">Description</h3>
                    <p className="text-sm opacity-70 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={isLoading || isAdding || !selectedVariant?.availableForSale}
                className="w-full py-4 px-8 bg-[#f6eddd] text-[#202219] font-medium rounded-full hover:bg-[#e3dccb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {!selectedVariant?.availableForSale
                  ? 'Sold Out'
                  : isAdding
                    ? 'Adding to Cart...'
                    : 'Add to Cart'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper to convert color names to hex codes
function getColorCode(colorName: string): string {
  const colors: Record<string, string> = {
    'black': '#1a1a1a',
    'white': '#f5f5f5',
    'red': '#dc2626',
    'blue': '#2563eb',
    'navy': '#1e3a5f',
    'green': '#16a34a',
    'olive': '#6b7f3a',
    'grey': '#6b7280',
    'gray': '#6b7280',
    'pink': '#ec4899',
    'purple': '#9333ea',
    'brown': '#78350f',
    'beige': '#d4c4a8',
    'cream': '#f6eddd',
    'tan': '#d2b48c',
    'maroon': '#7f1d1d',
    'orange': '#ea580c',
    'yellow': '#eab308',
    'coral': '#f87171',
    'teal': '#0d9488',
    'turquoise': '#06b6d4',
    'lavender': '#a78bfa',
    'mint': '#6ee7b7',
    'nude': '#e8c4a0',
    'burgundy': '#722f37',
    'charcoal': '#374151',
    'ivory': '#fffff0',
    'khaki': '#c3b091',
    'mauve': '#e0b0ff',
    'peach': '#ffcba4',
    'plum': '#8e4585',
    'rose': '#ff007f',
    'rust': '#b7410e',
    'sage': '#9caf88',
    'salmon': '#fa8072',
    'sand': '#c2b280',
    'silver': '#c0c0c0',
    'slate': '#708090',
    'wine': '#722f37',
  };

  const normalized = colorName.toLowerCase().trim();
  return colors[normalized] || '#6b7280';
}
