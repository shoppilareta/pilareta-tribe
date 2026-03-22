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

/** Parse descriptionHtml into bullet points and plain text segments */
function parseDescriptionHtml(html: string): { bullets: string[]; plainText: string } {
  const bullets: string[] = [];
  // Extract list items
  const liRegex = /<li[^>]*>(.*?)<\/li>/gi;
  let match;
  while ((match = liRegex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').trim();
    if (text) bullets.push(text);
  }
  // Get text outside of lists
  const withoutLists = html.replace(/<ul[^>]*>[\s\S]*?<\/ul>/gi, '').replace(/<ol[^>]*>[\s\S]*?<\/ol>/gi, '');
  const plainText = withoutLists.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return { bullets, plainText };
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
    if (product.images.length > 0) return product.images;
    if (product.featuredImage) return [product.featuredImage];
    return [];
  }, [product]);

  // Extract unique options (Color, Size, etc.)
  const options = useMemo(() => {
    if (!product) return [];
    const optionMap: Record<string, Set<string>> = {};
    product.variants.forEach((variant) => {
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

  // Map color names to variant image URLs for swatches
  const colorImageMap = useMemo(() => {
    if (!product) return new Map<string, string>();
    const map = new Map<string, string>();
    for (const v of product.variants) {
      for (const opt of v.selectedOptions ?? []) {
        const isColor = opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colour';
        if (isColor && !map.has(opt.value) && v.image?.url) {
          map.set(opt.value, v.image.url);
        }
      }
    }
    return map;
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

  // Set default options on mount
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
    return product.variants.find((variant) =>
      (variant.selectedOptions ?? []).every((opt) => selectedOptions[opt.name] === opt.value)
    ) ?? null;
  }, [product, selectedOptions]);

  // Prefetch all product images when detail screen opens
  useEffect(() => {
    if (!product) return;
    const urls = new Set<string>();
    images.forEach((img) => urls.add(img.url));
    product.variants.forEach((v) => {
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
    return product.variants.some((variant) => {
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
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <BackArrow />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{product.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Pressable onPress={handleToggleWishlist} style={styles.backButton} hitSlop={8}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill={isWishlisted ? colors.error : 'none'} stroke={isWishlisted ? colors.error : colors.fg.primary} strokeWidth={2}>
              <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </Svg>
          </Pressable>
          <Pressable onPress={handleShare} style={styles.backButton} hitSlop={8}>
            <ShareIcon />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
                    const variantImageUrl = colorImageMap.get(value);
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
                          !variantImageUrl && { backgroundColor: getColorCode(value) },
                          isSelected && styles.colorSwatchSelected,
                          !available && styles.optionDisabled,
                        ]}
                      >
                        {variantImageUrl && (
                          <Image
                            source={{ uri: variantImageUrl }}
                            style={styles.colorSwatchImage}
                            resizeMode="cover"
                          />
                        )}
                      </Pressable>
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
              const { bullets, plainText } = parseDescriptionHtml(product.descriptionHtml || '');
              return (
                <>
                  {plainText ? <Text style={styles.descriptionText}>{plainText}</Text> : null}
                  {bullets.map((bullet, idx) => (
                    <View key={idx} style={styles.bulletRow}>
                      <Text style={styles.bulletDot}>{'\u2022'}</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                  {bullets.length === 0 && !plainText && product.description ? (
                    <Text style={styles.descriptionText}>{product.description}</Text>
                  ) : null}
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
                <Pressable style={styles.recCard} onPress={() => router.push({ pathname: '/(tabs)/shop/[handle]', params: { handle: item.handle } })}>
                  {item.images[0] && <Image source={{ uri: item.images[0].url }} style={styles.recImage} resizeMode="cover" />}
                  <Text style={styles.recName} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.recPrice}>{'\u20B9'}{parseFloat(item.priceRange.minVariantPrice.amount).toFixed(0)}</Text>
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
          <Pressable style={styles.notifyMeButton} onPress={handleNotifyMe}>
            <Text style={styles.notifyMeText}>Notify Me When Available</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[
              styles.addToCartButton,
              (isAdding || cartLoading) && styles.addToCartDisabled,
            ]}
            onPress={handleAddToCart}
            disabled={!selectedVariant?.availableForSale || isAdding || cartLoading}
          >
            {isAdding ? (
              <ActivityIndicator color={colors.bg.primary} size="small" />
            ) : (
              <Text style={styles.addToCartText}>Add to Cart</Text>
            )}
          </Pressable>
        )}
        <Text style={styles.shippingHint}>Free shipping across India</Text>
      </View>
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
  colorSwatchImage: {
    width: '100%', height: '100%', borderRadius: 18,
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
});
