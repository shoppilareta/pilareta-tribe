import { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { getColorCode } from '@/utils/colorCode';
import { getProducts } from '@/api/shop';
import { useCartStore } from '@/stores/cartStore';
import type { ShopifyProduct } from '@shared/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function formatPrice(amount: string, currencyCode: string): string {
  const num = parseFloat(amount);
  if (currencyCode === 'INR') return `\u20B9${num.toFixed(0)}`;
  return `${currencyCode} ${num.toFixed(2)}`;
}

const normalizeUrl = (url: string) => url.split('?')[0];

function BackArrow() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
      <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function ProductDetailScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const { addItem, loading: cartLoading } = useCartStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState(false);
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

  // Find matching variant based on selected options
  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return product.variants.find((variant) =>
      (variant.selectedOptions ?? []).every((opt) => selectedOptions[opt.name] === opt.value)
    ) ?? null;
  }, [product, selectedOptions]);

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
      router.back();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to add item to cart.');
    } finally {
      setIsAdding(false);
    }
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
        <View style={{ width: 36 }} />
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
                <Image key={idx} source={{ uri: img.url }} style={styles.heroImage} resizeMode="cover" />
              ))}
            </ScrollView>
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
          <Text style={styles.productPrice}>
            {selectedVariant
              ? formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode)
              : formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}
          </Text>
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
            </View>
          );
        })}

        {/* Description */}
        {product.description ? (
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionLabel}>Description</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>
        ) : null}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky add to cart footer */}
      <View style={styles.footer}>
        <Pressable
          style={[
            styles.addToCartButton,
            (!selectedVariant?.availableForSale || isAdding || cartLoading) && styles.addToCartDisabled,
          ]}
          onPress={handleAddToCart}
          disabled={!selectedVariant?.availableForSale || isAdding || cartLoading}
        >
          {isAdding ? (
            <ActivityIndicator color={colors.bg.primary} size="small" />
          ) : (
            <Text style={styles.addToCartText}>
              {!selectedVariant?.availableForSale ? 'Sold Out' : 'Add to Cart'}
            </Text>
          )}
        </Pressable>
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
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(246,237,221,0.2)' },
  dotActive: { backgroundColor: colors.fg.primary, width: 18 },
  detailSection: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm },
  productTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.xs, lineHeight: 28 },
  productPrice: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.fg.primary },
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
  descriptionText: { fontSize: typography.sizes.sm, color: colors.fg.secondary, lineHeight: 22 },
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
  shippingHint: { fontSize: 11, color: colors.fg.muted, textAlign: 'center', marginTop: spacing.xs },
});
