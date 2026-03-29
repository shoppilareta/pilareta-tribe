import { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Dimensions, Alert, ActivityIndicator, Share, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { getColorCode } from '@/utils/colorCode';
import { formatPrice } from '@/utils/formatPrice';
import { getProducts, createRestockAlert } from '@/api/shop';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { useWishlist } from '@/hooks/useWishlist';
import { ImageZoomModal } from '@/components/ui/ImageZoomModal';
import { SizeGuideModal } from '@/components/shop/SizeGuideModal';
import { useToast } from '@/components/ui/Toast';
import type { ShopifyProduct } from '@shared/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** Parse an HTML table into rows of cell text */
function parseHtmlTable(tableHtml: string): string[][] {
  const rows: string[][] = [];
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch;
  while ((trMatch = trRegex.exec(tableHtml)) !== null) {
    const cells: string[] = [];
    const cellRegex = /<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi;
    let cellMatch;
    while ((cellMatch = cellRegex.exec(trMatch[1])) !== null) {
      cells.push(cellMatch[1].replace(/<[^>]+>/g, '').trim());
    }
    if (cells.length > 0) rows.push(cells);
  }
  return rows;
}

/** A block of parsed description content */
type DescriptionBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'table'; rows: string[][] };

/** Parse descriptionHtml into structured blocks preserving formatting */
function parseDescriptionHtml(html: string): { blocks: DescriptionBlock[] } {
  const blocks: DescriptionBlock[] = [];
  if (!html) return { blocks };

  // Work through the HTML sequentially, extracting blocks in order
  let remaining = html;

  // Helper: strip tags from a fragment, preserving inner text
  const stripTags = (s: string) => s.replace(/<[^>]+>/g, '').trim();

  // Process the HTML by splitting on block-level elements
  // First, normalize <br> and <br/> to newlines so they create line breaks
  remaining = remaining.replace(/<br\s*\/?>/gi, '\n');

  // Extract tables
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let tableMatch;
  while ((tableMatch = tableRegex.exec(remaining)) !== null) {
    // Add any text before this table
    const before = remaining.substring(0, tableMatch.index);
    parseTextBlocks(before, blocks);
    // Add the table
    const rows = parseHtmlTable(tableMatch[1]);
    if (rows.length > 0) blocks.push({ type: 'table', rows });
    remaining = remaining.substring(tableMatch.index + tableMatch[0].length);
    tableRegex.lastIndex = 0; // Reset since we modified remaining
  }
  // Process any remaining text after last table
  if (remaining.trim()) {
    parseTextBlocks(remaining, blocks);
  }

  return { blocks };
}

/** Parse non-table HTML into heading, paragraph, and bullet blocks */
function parseTextBlocks(html: string, blocks: DescriptionBlock[]) {
  const stripTags = (s: string) => s.replace(/<[^>]+>/g, '').trim();

  // Extract headings
  const headingRegex = /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi;
  // Extract list items
  const listRegex = /<(?:ul|ol)[^>]*>([\s\S]*?)<\/(?:ul|ol)>/gi;
  // Extract paragraphs (including divs as paragraphs)
  const paraRegex = /<(?:p|div)[^>]*>([\s\S]*?)<\/(?:p|div)>/gi;

  // If HTML has block-level elements, parse them
  const hasBlockElements = /<(?:p|div|h[1-6]|ul|ol|li)[^>]*>/i.test(html);

  if (hasBlockElements) {
    // Process in document order by finding all block elements
    const blockRegex = /<(h[1-6]|p|div|ul|ol)[^>]*>([\s\S]*?)<\/\1>/gi;
    let blockMatch;
    let lastIndex = 0;

    while ((blockMatch = blockRegex.exec(html)) !== null) {
      // Any plain text between blocks
      const gap = html.substring(lastIndex, blockMatch.index);
      const gapText = stripTags(gap);
      if (gapText) blocks.push({ type: 'paragraph', text: gapText });

      const tag = blockMatch[1].toLowerCase();
      const content = blockMatch[2];

      if (tag.startsWith('h')) {
        const text = stripTags(content);
        if (text) blocks.push({ type: 'heading', text });
      } else if (tag === 'ul' || tag === 'ol') {
        const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
        let liMatch;
        while ((liMatch = liRegex.exec(content)) !== null) {
          const text = stripTags(liMatch[1]);
          if (text) blocks.push({ type: 'bullet', text });
        }
      } else {
        // p or div — treat as paragraph, split on \n for <br> breaks
        const text = stripTags(content);
        if (text) {
          const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
          for (const line of lines) {
            blocks.push({ type: 'paragraph', text: line });
          }
        }
      }

      lastIndex = blockMatch.index + blockMatch[0].length;
    }

    // Trailing text after last block
    const trailing = html.substring(lastIndex);
    const trailingText = stripTags(trailing);
    if (trailingText) blocks.push({ type: 'paragraph', text: trailingText });
  } else {
    // No block elements — treat as plain text with line breaks
    const text = stripTags(html);
    if (text) {
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        blocks.push({ type: 'paragraph', text: line });
      }
    }
  }
}

const normalizeUrl = (url: string) => url.split('?')[0];

function BackArrow() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
      <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ShareIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
      <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function ProductDetailScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const { addItem, loading: cartLoading } = useCartStore();
  const { addHandle: addRecentlyViewed } = useRecentlyViewedStore();
  const isAuthenticated = !!useAuthStore((s) => s.accessToken);
  const userEmail = useAuthStore((s) => s.user?.email);
  const { isWishlisted: checkWishlisted, toggleWishlist } = useWishlist();
  const isWishlisted = handle ? checkWishlisted(handle) : false;

  const handleToggleWishlist = () => {
    if (!handle) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleWishlist(handle);
  };
  const { showToast } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const imageScrollRef = useRef<ScrollView>(null);
  const mainScrollRef = useRef<ScrollView>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['shop-products'],
    queryFn: getProducts,
  });

  const product: ShopifyProduct | undefined = useMemo(() => {
    return data?.products?.find((p) => p.handle === handle);
  }, [data, handle]);

  // Build images list (product-level images)
  const images = useMemo(() => {
    if (!product) return [];
    if (product.images?.length > 0) return product.images;
    if (product.featuredImage) return [product.featuredImage];
    return [];
  }, [product]);

  // Extract unique options (Color, Size, etc.)
  const options = useMemo(() => {
    if (!product) return [];
    const optionMap: Record<string, Set<string>> = {};
    (product.variants ?? []).forEach((variant) => {
      (variant.selectedOptions ?? []).forEach((opt) => {
        if (!optionMap[opt.name]) optionMap[opt.name] = new Set();
        optionMap[opt.name].add(opt.value);
      });
    });
    return Object.entries(optionMap).map(([name, values]) => ({
      name,
      values: Array.from(values),
    }));
  }, [product]);

  // All products for recommendations
  const allProducts = data?.products;

  const recommendations = useMemo(() => {
    if (!product || !allProducts) return [];
    const currentCollections = product.collections?.map(c => c.title) || [];
    const currentType = product.productType;
    return allProducts
      .filter(p => p.handle !== product.handle)
      .filter(p => {
        const pCollections = p.collections?.map(c => c.title) || [];
        return pCollections.some(c => currentCollections.includes(c)) || p.productType === currentType;
      })
      .slice(0, 8);
  }, [product, allProducts]);

  // Scroll to top and reset state when navigating to a new product
  useEffect(() => {
    mainScrollRef.current?.scrollTo({ y: 0, animated: false });
    imageScrollRef.current?.scrollTo({ x: 0, animated: false });
    setSelectedImage(0);
    setSelectedOptions({});
  }, [handle]);

  // Set default options on mount or product change
  useEffect(() => {
    if (options.length > 0 && Object.keys(selectedOptions).length === 0) {
      const defaults: Record<string, string> = {};
      options.forEach((opt) => {
        defaults[opt.name] = opt.values[0];
      });
      setSelectedOptions(defaults);
    }
  }, [options]);

  // Track recently viewed product
  useEffect(() => {
    if (handle) {
      addRecentlyViewed(handle);
    }
  }, [handle]);

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `Check out ${product.title} on Pilareta!\nhttps://tribe.pilareta.com/shop/${product.handle}`,
      });
    } catch {}
  };

  // Find matching variant based on selected options
  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return (product.variants ?? []).find((variant) =>
      (variant.selectedOptions ?? []).every((opt) => selectedOptions[opt.name] === opt.value)
    ) ?? null;
  }, [product, selectedOptions]);

  // Prefetch all product images when detail screen opens
  useEffect(() => {
    if (!product) return;
    const urls = new Set<string>();
    images.forEach((img) => urls.add(img.url));
    (product.variants ?? []).forEach((v) => {
      if (v.image?.url) urls.add(v.image.url);
    });
    urls.forEach((url) => Image.prefetch(url));
  }, [product, images]);

  // When variant changes and has an image, scroll to it in the gallery
  useEffect(() => {
    if (!selectedVariant?.image || images.length === 0) return;
    const variantUrl = normalizeUrl(selectedVariant.image.url);
    const idx = images.findIndex((img) => normalizeUrl(img.url) === variantUrl);
    if (idx >= 0 && idx !== selectedImage) {
      imageScrollRef.current?.scrollTo({ x: idx * SCREEN_WIDTH, animated: true });
      setSelectedImage(idx);
    }
  }, [selectedVariant]);

  // Check if a specific option value is available given other selections
  const isOptionAvailable = (optionName: string, optionValue: string) => {
    if (!product) return false;
    return (product.variants ?? []).some((variant) => {
      const opts = variant.selectedOptions ?? [];
      const hasOption = opts.some((o) => o.name === optionName && o.value === optionValue);
      if (!hasOption) return false;
      const othersMatch = opts.every((o) => {
        if (o.name === optionName) return true;
        return selectedOptions[o.name] === o.value || !selectedOptions[o.name];
      });
      return othersMatch && variant.availableForSale;
    });
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || !selectedVariant.availableForSale) return;
    setIsAdding(true);
    try {
      await addItem(selectedVariant.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Added to cart');
      router.back();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to add item to cart.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleNotifyMe = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    const email = userEmail || '';
    Alert.alert(
      'Notify Me When Available',
      `We'll send a notification to ${email} when this item is back in stock.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Notify Me',
          onPress: async () => {
            try {
              await createRestockAlert(email, handle!, selectedVariant?.title);
              showToast("We'll notify you when this is back!");
            } catch {
              showToast('Failed to subscribe. Try again.', 'error');
            }
          },
        },
      ]
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerBar}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
            <BackArrow />
          </Pressable>
          <Text style={styles.headerTitle}>Loading...</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.fg.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Error or not found state
  if (!product) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerBar}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
            <BackArrow />
          </Pressable>
          <Text style={styles.headerTitle}>Product</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.loadingWrap}>
          <Text style={styles.errorTitle}>
            {isError ? 'Something went wrong' : 'Product not found'}
          </Text>
          <Text style={styles.errorText}>
            {isError ? 'Could not load product details.' : 'This product may no longer be available.'}
          </Text>
          <Pressable onPress={() => router.back()} style={styles.errorButton}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header bar */}
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8} accessibilityLabel="Go back" accessibilityRole="button">
          <BackArrow />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{product.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Pressable onPress={handleToggleWishlist} style={styles.backButton} hitSlop={8} accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'} accessibilityRole="button">
            <Svg width={20} height={20} viewBox="0 0 24 24" fill={isWishlisted ? colors.error : 'none'} stroke={isWishlisted ? colors.error : colors.fg.primary} strokeWidth={2}>
              <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </Svg>
          </Pressable>
          <Pressable onPress={handleShare} style={styles.backButton} hitSlop={8} accessibilityLabel="Share product" accessibilityRole="button">
            <ShareIcon />
          </Pressable>
        </View>
      </View>

      <ScrollView ref={mainScrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Image gallery */}
        {images.length > 0 && (
          <View>
            <ScrollView
              ref={imageScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setSelectedImage(idx);
              }}
            >
              {images.map((img, idx) => (
                <Pressable key={idx} onPress={() => setZoomVisible(true)}>
                  <Image source={{ uri: img.url }} style={styles.heroImage} resizeMode="cover" />
                </Pressable>
              ))}
            </ScrollView>
            {/* Sale badge */}
            {(() => {
              const cap = selectedVariant?.compareAtPrice;
              const varPrice = selectedVariant?.price ?? product.priceRange.minVariantPrice;
              const heroIsOnSale = cap && parseFloat(cap.amount) > parseFloat(varPrice.amount);
              return heroIsOnSale ? (
                <View style={styles.heroSaleBadge}>
                  <Text style={styles.heroSaleBadgeText}>SALE</Text>
                </View>
              ) : null;
            })()}
            {images.length > 1 && (
              <View style={styles.dots}>
                {images.map((_, idx) => (
                  <View key={idx} style={[styles.dot, idx === selectedImage && styles.dotActive]} />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Product info */}
        <View style={styles.detailSection}>
          <Text style={styles.productTitle}>{product.title}</Text>
          {(() => {
            const variantPrice = selectedVariant
              ? selectedVariant.price
              : product.priceRange.minVariantPrice;
            const cap = selectedVariant?.compareAtPrice;
            const isOnSale = cap && parseFloat(cap.amount) > parseFloat(variantPrice.amount);
            if (isOnSale) {
              const pct = Math.round((1 - parseFloat(variantPrice.amount) / parseFloat(cap.amount)) * 100);
              return (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Text style={styles.productComparePrice}>
                    {formatPrice(cap.amount, cap.currencyCode)}
                  </Text>
                  <Text style={styles.productSalePrice}>
                    {formatPrice(variantPrice.amount, variantPrice.currencyCode)}
                  </Text>
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveBadgeText}>Save {pct}%</Text>
                  </View>
                </View>
              );
            }
            return (
              <Text style={styles.productPrice}>
                {formatPrice(variantPrice.amount, variantPrice.currencyCode)}
              </Text>
            );
          })()}
          {selectedVariant?.quantityAvailable != null && selectedVariant.quantityAvailable > 0 && selectedVariant.quantityAvailable < 5 && (
            <Text style={styles.stockUrgency}>Only {selectedVariant.quantityAvailable} left in stock!</Text>
          )}
        </View>

        {/* Options */}
        {options.map((option) => {
          const isColor = option.name.toLowerCase() === 'color' || option.name.toLowerCase() === 'colour';
          return (
            <View key={option.name} style={styles.optionSection}>
              <View style={styles.optionHeader}>
                <Text style={styles.optionLabel}>{option.name}</Text>
                {selectedOptions[option.name] && (
                  <Text style={styles.optionValue}>{selectedOptions[option.name]}</Text>
                )}
              </View>
              <View style={styles.optionValues}>
                {option.values.map((value) => {
                  const isSelected = selectedOptions[option.name] === value;
                  const available = isOptionAvailable(option.name, value);

                  if (isColor) {
                    return (
                      <Pressable
                        key={value}
                        onPress={() => {
                          if (available) {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setSelectedOptions((prev) => ({ ...prev, [option.name]: value }));
                          }
                        }}
                        style={[
                          styles.colorSwatch,
                          { backgroundColor: getColorCode(value) },
                          isSelected && styles.colorSwatchSelected,
                          !available && styles.optionDisabled,
                        ]}
                      />
                    );
                  }

                  return (
                    <Pressable
                      key={value}
                      onPress={() => {
                        if (available) {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setSelectedOptions((prev) => ({ ...prev, [option.name]: value }));
                        }
                      }}
                      style={[
                        styles.sizePill,
                        isSelected && styles.sizePillSelected,
                        !available && styles.optionDisabled,
                      ]}
                    >
                      <Text style={[
                        styles.sizePillText,
                        isSelected && styles.sizePillTextSelected,
                        !available && styles.sizePillTextDisabled,
                      ]}>
                        {value.replace(/\s*\(.*\)/, '')}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {!isColor && (
                <Pressable onPress={() => setShowSizeGuide(true)} style={{ marginTop: spacing.xs }}>
                  <Text style={styles.sizeGuideLink}>Size Guide</Text>
                </Pressable>
              )}
            </View>
          );
        })}

        {/* Description */}
        {(product.descriptionHtml || product.description) ? (
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionLabel}>Product Details</Text>
            {(() => {
              const { blocks } = parseDescriptionHtml(product.descriptionHtml || '');
              if (blocks.length === 0 && product.description) {
                return <Text style={styles.descriptionText}>{product.description}</Text>;
              }
              return (
                <>
                  {blocks.map((block, idx) => {
                    switch (block.type) {
                      case 'heading':
                        return <Text key={idx} style={styles.descriptionHeading}>{block.text}</Text>;
                      case 'paragraph':
                        return <Text key={idx} style={styles.descriptionText}>{block.text}</Text>;
                      case 'bullet':
                        return (
                          <View key={idx} style={styles.bulletRow}>
                            <Text style={styles.bulletDot}>{'\u2022'}</Text>
                            <Text style={styles.bulletText}>{block.text}</Text>
                          </View>
                        );
                      case 'table':
                        return (
                          <View key={idx} style={styles.tableContainer}>
                            {block.rows.map((row, rIdx) => (
                              <View key={`row-${rIdx}`} style={[styles.tableRow, rIdx === 0 && styles.tableHeaderRow, rIdx % 2 === 1 && styles.tableRowAlt]}>
                                {row.map((cell, cIdx) => (
                                  <Text key={`cell-${cIdx}`} style={[styles.tableCell, rIdx === 0 && styles.tableHeaderCell]} numberOfLines={2}>
                                    {cell}
                                  </Text>
                                ))}
                              </View>
                            ))}
                          </View>
                        );
                      default:
                        return null;
                    }
                  })}
                </>
              );
            })()}
          </View>
        ) : null}

        {/* Trust & Policy */}
        <View style={styles.trustSection}>
          {[
            { icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l4-2 4 2 4-2 4 2V6a1 1 0 00-1-1h-2', title: 'Free Shipping', subtitle: 'Free delivery across India' },
            { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', title: 'Easy Returns', subtitle: '30-day hassle-free returns' },
            { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: '100% Authentic', subtitle: 'Genuine Pilareta products' },
            { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', title: 'Secure Payments', subtitle: 'Cards, UPI & wallets accepted' },
          ].map((item) => (
            <View key={item.title} style={styles.trustRow}>
              <View style={styles.trustIcon}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.fg.secondary} strokeWidth={1.5}>
                  <Path d={item.icon} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <View>
                <Text style={styles.trustTitle}>{item.title}</Text>
                <Text style={styles.trustSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* You May Also Like */}
        {recommendations.length > 0 && (
          <View style={styles.recsSection}>
            <Text style={styles.recsTitle}>You May Also Like</Text>
            <FlatList
              data={recommendations}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.handle}
              contentContainerStyle={{ paddingHorizontal: spacing.md }}
              renderItem={({ item }) => (
                <Pressable style={styles.recCard} onPress={() => router.push({ pathname: '/(tabs)/shop/[handle]', params: { handle: item.handle } })} accessibilityLabel={`${item.title}, ${formatPrice(item.priceRange?.minVariantPrice?.amount ?? '0', item.priceRange?.minVariantPrice?.currencyCode ?? 'INR')}`} accessibilityRole="button">
                  {item.images?.[0] ? <Image source={{ uri: item.images[0].url }} style={styles.recImage} resizeMode="cover" /> : <View style={[styles.recImage, { backgroundColor: 'rgba(70,74,60,0.3)' }]} />}
                  <Text style={styles.recName} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.recPrice}>{formatPrice(item.priceRange?.minVariantPrice?.amount ?? '0', item.priceRange?.minVariantPrice?.currencyCode ?? 'INR')}</Text>
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
            />
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Image zoom modal */}
      <ImageZoomModal
        visible={zoomVisible}
        images={images}
        initialIndex={selectedImage}
        onClose={() => setZoomVisible(false)}
      />

      {/* Size guide modal */}
      <SizeGuideModal visible={showSizeGuide} onClose={() => setShowSizeGuide(false)} />

      {/* Sticky add to cart footer */}
      <View style={styles.footer}>
        {selectedVariant && !selectedVariant.availableForSale ? (
          <Pressable style={styles.notifyMeButton} onPress={handleNotifyMe} accessibilityLabel="Notify me when available" accessibilityRole="button">
            <Text style={styles.notifyMeText}>Notify Me When Available</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[
              styles.addToCartButton,
              (isAdding || cartLoading || !selectedVariant?.availableForSale) && styles.addToCartDisabled,
            ]}
            onPress={handleAddToCart}
            disabled={!selectedVariant?.availableForSale || isAdding || cartLoading}
            accessibilityLabel="Add to cart"
            accessibilityRole="button"
            accessibilityState={{ disabled: !selectedVariant?.availableForSale || isAdding || cartLoading }}
          >
            {isAdding ? (
              <ActivityIndicator color={colors.bg.primary} size="small" />
            ) : (
              <Text style={styles.addToCartText}>
                {!selectedVariant?.availableForSale ? 'Unavailable' : 'Add to Cart'}
              </Text>
            )}
          </Pressable>
        )}
        <Text style={styles.shippingHint}>Free shipping across India</Text>
      </View>

      {/* Loading overlay when adding to cart */}
      {isAdding && (
        <View style={styles.addToCartOverlay}>
          <View style={styles.addToCartOverlayContent}>
            <ActivityIndicator color={colors.fg.primary} size="small" />
            <Text style={styles.addToCartOverlayText}>Adding to cart...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  headerBar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border.default,
  },
  backButton: { padding: spacing.xs },
  headerTitle: { flex: 1, fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.fg.primary, textAlign: 'center', marginHorizontal: spacing.sm },
  errorTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.xs },
  errorText: { fontSize: typography.sizes.sm, color: colors.fg.tertiary, textAlign: 'center', marginBottom: spacing.md },
  errorButton: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.fg.primary },
  errorButtonText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.bg.primary },
  scrollContent: { paddingBottom: 20 },
  heroImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH, backgroundColor: 'rgba(246,237,221,0.05)' },
  heroSaleBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(239, 68, 68, 0.9)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, zIndex: 1 },
  heroSaleBadgeText: { fontSize: 10, fontWeight: typography.weights.bold, color: '#fff', letterSpacing: 0.5 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(246,237,221,0.2)' },
  dotActive: { backgroundColor: colors.fg.primary, width: 18 },
  detailSection: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm },
  productTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.xs, lineHeight: 28 },
  productPrice: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.fg.primary },
  productComparePrice: { fontSize: typography.sizes.lg, color: colors.fg.muted, textDecorationLine: 'line-through' },
  productSalePrice: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.error },
  saveBadge: { backgroundColor: colors.error, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  saveBadgeText: { fontSize: 11, fontWeight: typography.weights.bold, color: '#fff' },
  optionSection: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  optionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  optionLabel: { fontSize: typography.sizes.xs, color: colors.fg.muted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: typography.weights.medium },
  optionValue: { fontSize: typography.sizes.sm, color: colors.fg.secondary },
  optionValues: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  colorSwatch: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 2, borderColor: 'rgba(246,237,221,0.15)',
  },
  colorSwatchSelected: {
    borderColor: colors.fg.primary, borderWidth: 3,
  },
  optionDisabled: { opacity: 0.25 },
  sizePill: {
    paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(246,237,221,0.15)',
  },
  sizePillSelected: {
    backgroundColor: colors.fg.primary, borderColor: colors.fg.primary,
  },
  sizePillText: { fontSize: typography.sizes.sm, color: colors.fg.secondary, fontWeight: typography.weights.medium },
  sizePillTextSelected: { color: colors.bg.primary },
  sizePillTextDisabled: { textDecorationLine: 'line-through' },
  descriptionSection: {
    paddingHorizontal: spacing.md, paddingTop: spacing.md,
    marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border.default,
  },
  descriptionLabel: { fontSize: typography.sizes.xs, color: colors.fg.muted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: typography.weights.medium, marginBottom: spacing.sm },
  descriptionText: { fontSize: typography.sizes.sm, color: colors.fg.secondary, lineHeight: 22, marginBottom: spacing.sm },
  bulletRow: { flexDirection: 'row', paddingRight: spacing.md, marginBottom: 6 },
  bulletDot: { fontSize: typography.sizes.sm, color: colors.fg.secondary, marginRight: 8, lineHeight: 22 },
  bulletText: { flex: 1, fontSize: typography.sizes.sm, color: colors.fg.secondary, lineHeight: 22 },
  descriptionHeading: { fontSize: typography.sizes.md, fontWeight: '600' as const, color: colors.fg.primary, marginTop: spacing.md, marginBottom: spacing.xs },
  tableContainer: { marginTop: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border.default, overflow: 'hidden' as const },
  tableRow: { flexDirection: 'row' as const, borderBottomWidth: 1, borderBottomColor: colors.border.default },
  tableHeaderRow: { backgroundColor: 'rgba(246, 237, 221, 0.08)' },
  tableRowAlt: { backgroundColor: 'rgba(246, 237, 221, 0.03)' },
  tableCell: { flex: 1, paddingVertical: 8, paddingHorizontal: 10, fontSize: typography.sizes.xs, color: colors.fg.secondary },
  tableHeaderCell: { fontWeight: '600' as const, color: colors.fg.primary, fontSize: typography.sizes.xs },
  footer: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderTopWidth: 1, borderTopColor: colors.border.default,
    backgroundColor: colors.bg.primary,
  },
  addToCartButton: {
    backgroundColor: colors.fg.primary, borderRadius: 24,
    paddingVertical: 14, alignItems: 'center',
  },
  addToCartDisabled: { opacity: 0.5 },
  addToCartText: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.bg.primary },
  notifyMeButton: {
    borderRadius: 24, paddingVertical: 14, alignItems: 'center',
    borderWidth: 2, borderColor: colors.fg.primary,
  },
  notifyMeText: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  stockUrgency: { fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.warning, marginTop: spacing.xs },
  shippingHint: { fontSize: 11, color: colors.fg.muted, textAlign: 'center', marginTop: spacing.xs },
  sizeGuideLink: { fontSize: typography.sizes.xs, color: colors.fg.secondary, textDecorationLine: 'underline' },
  trustSection: { marginTop: spacing.md, paddingTop: spacing.md, paddingHorizontal: spacing.md, borderTopWidth: 1, borderTopColor: colors.border.default },
  trustRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  trustIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bg.card, alignItems: 'center', justifyContent: 'center' },
  trustTitle: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  trustSubtitle: { fontSize: typography.sizes.xs, color: colors.fg.tertiary },
  recsSection: { marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border.default },
  recsTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold, color: colors.fg.primary, marginBottom: spacing.sm, paddingHorizontal: spacing.md },
  recCard: { width: 130 },
  recImage: { width: 130, aspectRatio: 1, borderRadius: radius.sm, backgroundColor: 'rgba(246,237,221,0.05)' },
  recName: { fontSize: typography.sizes.xs, color: colors.fg.primary, marginTop: spacing.xs },
  recPrice: { fontSize: typography.sizes.xs, color: colors.fg.secondary },
  addToCartOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  addToCartOverlayContent: {
    backgroundColor: colors.bg.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  addToCartOverlayText: {
    fontSize: typography.sizes.sm,
    color: colors.fg.primary,
    fontWeight: typography.weights.medium,
  },
});
