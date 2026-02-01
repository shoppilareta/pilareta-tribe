'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import type { ShopifyProduct } from '@/lib/shopify/types';
import { getColorCode } from '@/lib/colorCode';
import { useCart } from './CartProvider';

interface ProductQuickViewProps {
  product: ShopifyProduct;
  isOpen: boolean;
  onClose: () => void;
}

function formatPrice(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat('en-IN', {
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

  // When variant changes and has an image, switch to it in the gallery
  useEffect(() => {
    if (!selectedVariant?.image) return;
    const images = product.images.length > 0 ? product.images : (product.featuredImage ? [product.featuredImage] : []);
    const variantUrl = selectedVariant.image.url.split('?')[0];
    const idx = images.findIndex((img) => img.url.split('?')[0] === variantUrl);
    if (idx >= 0 && idx !== selectedImage) {
      setSelectedImage(idx);
    }
  }, [selectedVariant, product.images, product.featuredImage, selectedImage]);

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

  // Helper to get a short label for size options
  const getShortLabel = (value: string) => {
    // Extract just the size part before any parentheses
    const match = value.match(/^([A-Z0-9]+)/i);
    return match ? match[1] : value;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 lg:p-8">
        <div
          className="bg-[#1a1c16] rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl border border-[rgba(246,237,221,0.1)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 z-20 w-11 h-11 flex items-center justify-center bg-[#1a1c16]/90 backdrop-blur-sm rounded-full border border-[rgba(246,237,221,0.15)] hover:bg-[rgba(246,237,221,0.1)] transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-[#f6eddd]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex flex-col md:flex-row max-h-[90vh] overflow-auto">
            {/* Image Gallery - Left Side */}
            <div className="md:w-1/2 bg-[rgba(246,237,221,0.03)]">
              {/* Main Image */}
              <div className="relative aspect-square">
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
                  <div className="w-full h-full flex items-center justify-center bg-[rgba(246,237,221,0.05)]">
                    <svg className="w-20 h-20 text-[#f6eddd]/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
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

            {/* Product Details - Right Side */}
            <div className="md:w-1/2 flex flex-col">
              <div className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
                {/* Title & Price */}
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-medium text-[#f6eddd] leading-tight mb-4">
                    {product.title}
                  </h2>
                  <p className="text-2xl font-semibold text-[#f6eddd]">
                    {selectedVariant
                      ? formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode)
                      : formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)
                    }
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-8 mb-8">
                  {options.map(option => {
                    const isColor = option.name.toLowerCase() === 'color' || option.name.toLowerCase() === 'colour';
                    const isSize = option.name.toLowerCase() === 'size';

                    return (
                      <div key={option.name}>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-[#f6eddd]/50 uppercase tracking-wider font-medium">
                            {option.name}
                          </span>
                          {selectedOptions[option.name] && (
                            <span className="text-sm text-[#f6eddd]/70">
                              {selectedOptions[option.name]}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {option.values.map(value => {
                            const isSelected = selectedOptions[option.name] === value;
                            const isAvailable = isOptionAvailable(option.name, value);

                            if (isColor) {
                              return (
                                <button
                                  key={value}
                                  onClick={() => setSelectedOptions(prev => ({ ...prev, [option.name]: value }))}
                                  disabled={!isAvailable}
                                  className={`
                                    w-12 h-12 rounded-full border-2 transition-all relative
                                    ${isSelected
                                      ? 'border-[#f6eddd] ring-2 ring-[#f6eddd]/30 ring-offset-2 ring-offset-[#1a1c16]'
                                      : 'border-[rgba(246,237,221,0.2)] hover:border-[rgba(246,237,221,0.4)]'
                                    }
                                    ${!isAvailable ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
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
                                  px-5 py-3 text-sm rounded-full border transition-all font-medium
                                  ${isSelected
                                    ? 'border-[#f6eddd] bg-[#f6eddd] text-[#1a1c16]'
                                    : 'border-[rgba(246,237,221,0.2)] text-[#f6eddd]/70 hover:border-[rgba(246,237,221,0.4)] hover:text-[#f6eddd]'
                                  }
                                  ${!isAvailable ? 'opacity-30 cursor-not-allowed line-through' : 'cursor-pointer'}
                                `}
                              >
                                {isSize ? getShortLabel(value) : value}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Description */}
                {product.description && (
                  <div className="mb-8">
                    <h3 className="text-sm text-[#f6eddd]/50 uppercase tracking-wider font-medium mb-4">
                      Description
                    </h3>
                    <div className="bg-[rgba(246,237,221,0.04)] rounded-2xl p-5 border border-[rgba(246,237,221,0.06)]">
                      <p className="text-sm text-[#f6eddd]/60 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Add to Cart Footer */}
              <div className="p-6 md:p-8 lg:px-10 border-t border-[rgba(246,237,221,0.1)] bg-[#1a1c16]">
                <button
                  onClick={handleAddToCart}
                  disabled={isLoading || isAdding || !selectedVariant?.availableForSale}
                  className="w-full py-4 bg-[#f6eddd] text-[#1a1c16] font-semibold rounded-full hover:bg-[#e8dfcc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[15px]"
                >
                  {!selectedVariant?.availableForSale
                    ? 'Sold Out'
                    : isAdding
                      ? 'Adding to Cart...'
                      : 'Add to Cart'
                  }
                </button>

                <p className="text-center text-xs text-[#f6eddd]/40 mt-4">
                  Free shipping across India
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

