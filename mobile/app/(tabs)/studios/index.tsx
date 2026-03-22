import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, Alert, Dimensions, Linking, Modal, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import Svg, { Path } from 'react-native-svg';
import { router } from 'expo-router';
import { colors, typography, spacing, radius } from '@/theme';
import { StudioCard, isStudioOpenNow } from '@/components/studios';
import { StudioListSkeleton } from '@/components/ui/Skeleton';
import { getNearbyStudios, searchStudios, geocode, quickSearch } from '@/api/studios';
import { useStudioFavorites } from '@/hooks/useStudioFavorites';
import { useAuthStore } from '@/stores/authStore';
import type { Studio } from '@shared/types';

const AMENITY_OPTIONS = ['Reformer', 'Mat', 'Showers', 'Parking', 'WiFi', 'AC'] as const;

type SortOption = 'nearest' | 'rating';

interface Filters {
  openNow: boolean;
  amenities: string[];
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const MAP_HEIGHT = 280;

// Default to Mumbai
const DEFAULT_REGION: Region = {
  latitude: 19.076,
  longitude: 72.8777,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

type ViewMode = 'map' | 'list';

export default function StudiosScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [filters, setFilters] = useState<Filters>({ openNow: false, amenities: [] });
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('nearest');
  const [suggestions, setSuggestions] = useState<{ name: string; placeId: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const mapRef = useRef<MapView>(null);

  const isAuthenticated = !!useAuthStore((s) => s.accessToken);
  const { isFavorited, toggleFavorite } = useStudioFavorites();

  const handleToggleFavorite = useCallback((studioId: string) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(studioId);
  }, [isAuthenticated, toggleFavorite]);

  const activeFilterCount = (filters.openNow ? 1 : 0) + filters.amenities.length;

  // Get user location on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        return;
      }

      setPermissionDenied(false);
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      setUserLocation(coords);
      setRegion({
        latitude: coords.lat,
        longitude: coords.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    })();
  }, []);

  // Debounced autocomplete suggestions
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const result = await quickSearch(q, 5);
        const mapped = (result.studios ?? []).map((s) => ({
          name: s.name + (s.city ? ` - ${s.city}` : ''),
          placeId: s.id,
        }));
        setSuggestions(mapped);
        setShowSuggestions(mapped.length > 0);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const activeLocation = searchLocation || userLocation;

  const { data: nearbyData, isLoading: nearbyLoading, isError: nearbyError, refetch: refetchNearby } = useQuery({
    queryKey: ['studios-nearby', activeLocation?.lat, activeLocation?.lng],
    queryFn: () => getNearbyStudios(activeLocation!.lat, activeLocation!.lng, 15000),
    enabled: !!activeLocation,
  });

  const { data: searchData, isLoading: searchLoading, isError: searchError, refetch: refetchSearch } = useQuery({
    queryKey: ['studios-search', searchQuery],
    queryFn: () => searchStudios({ q: searchQuery, limit: 30 }),
    enabled: searchQuery.length >= 2,
  });

  // After geocoding a city, prefer nearby results for that location.
  // Only use text search when typing without submitting.
  const rawStudios: Studio[] = searchLocation
    ? (nearbyData?.studios ?? [])
    : searchQuery.length >= 2
      ? (searchData?.studios ?? [])
      : (nearbyData?.studios ?? []);
  const isLoading = searchLocation
    ? nearbyLoading
    : searchQuery.length >= 2 ? searchLoading : nearbyLoading;
  const isError = searchLocation
    ? nearbyError
    : searchQuery.length >= 2 ? searchError : nearbyError;

  // Apply client-side filters and sorting
  const studios = useMemo(() => {
    let filtered = rawStudios;
    if (filters.openNow) {
      filtered = filtered.filter((s) => isStudioOpenNow(s.openingHours) === true);
    }
    if (filters.amenities.length > 0) {
      const lowerAmenities = filters.amenities.map((a) => a.toLowerCase());
      filtered = filtered.filter((s) =>
        lowerAmenities.every((fa) => s.amenities.some((sa) => sa.toLowerCase() === fa))
      );
    }
    if (sortOption === 'rating') {
      filtered = [...filtered].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }
    // 'nearest' keeps the natural API order (already sorted by distance)
    return filtered;
  }, [rawStudios, filters, sortOption]);

  const handleRetry = () => {
    if (searchLocation || !searchQuery) {
      refetchNearby();
    } else {
      refetchSearch();
    }
  };

  const handleSearch = async () => {
    const q = searchQuery.trim();
    setShowSuggestions(false);
    setSuggestions([]);
    if (!q) {
      setSearchLocation(null);
      return;
    }

    try {
      const result = await geocode(q);
      setSearchLocation({ lat: result.lat, lng: result.lng });
      setRegion({
        latitude: result.lat,
        longitude: result.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      mapRef.current?.animateToRegion({
        latitude: result.lat,
        longitude: result.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } catch {
      Alert.alert('Location not found', 'Try a different search term.');
    }
  };

  const handleSuggestionTap = (suggestion: { name: string; placeId: string }) => {
    // Extract studio name without city suffix for search
    const name = suggestion.name.split(' - ')[0];
    setSearchQuery(name);
    setShowSuggestions(false);
    setSuggestions([]);
    // Navigate directly to the studio detail
    router.push(`/(tabs)/studios/${suggestion.placeId}`);
  };

  const handleMyLocation = () => {
    if (!userLocation) return;
    setSearchQuery('');
    setSearchLocation(null);
    const newRegion = {
      latitude: userLocation.lat,
      longitude: userLocation.lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion);
  };

  // Determine which empty state to show
  const renderEmptyState = () => {
    if (permissionDenied && !searchLocation && !searchQuery) {
      return (
        <View style={styles.centered}>
          <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={colors.fg.muted} strokeWidth={1.5}>
            <Path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={styles.emptyTitle}>Enable location to find studios near you</Text>
          <Text style={styles.emptyText}>
            We need your location to show nearby Pilates studios. You can also search by city name above.
          </Text>
          <Pressable style={styles.settingsButton} onPress={() => Linking.openSettings()}>
            <Text style={styles.settingsButtonText}>Open Settings</Text>
          </Pressable>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Couldn't load studios</Text>
          <Text style={styles.emptyText}>Something went wrong. Check your connection and try again.</Text>
          <Pressable style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>No studios found</Text>
        <Text style={styles.emptyText}>
          {searchQuery
            ? 'No studios found in this area. Try a different city or studio name.'
            : 'Try searching for a city or studio name above.'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Studios</Text>
        <View style={styles.headerRight}>
          <Pressable onPress={() => router.push('/(tabs)/studios/favorites')} style={styles.headerIconButton} hitSlop={8}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
              <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </Svg>
          </Pressable>
          <View style={styles.viewToggle}>
            <Pressable
              onPress={() => setViewMode('map')}
              style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={viewMode === 'map' ? colors.bg.primary : colors.fg.secondary} strokeWidth={1.5}>
                <Path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
            <Pressable
              onPress={() => setViewMode('list')}
              style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={viewMode === 'list' ? colors.bg.primary : colors.fg.secondary} strokeWidth={1.5}>
                <Path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </Svg>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.fg.muted} strokeWidth={1.5}>
              <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search studios or locations..."
              placeholderTextColor={colors.fg.muted}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => { setSearchQuery(''); setSearchLocation(null); setShowSuggestions(false); setSuggestions([]); }} hitSlop={8}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.fg.muted} strokeWidth={1.5}>
                  <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </Pressable>
            )}
          </View>
          <Pressable onPress={() => setShowFilterSheet(true)} style={styles.filterButton} hitSlop={8}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={1.5}>
              <Path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>
          {userLocation && (
            <Pressable onPress={handleMyLocation} style={styles.myLocationButton} hitSlop={8}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={1.5}>
                <Path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
              </Svg>
            </Pressable>
          )}
        </View>

        {/* Autocomplete suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.suggestionsDropdown}>
            {suggestions.map((s, i) => (
              <Pressable
                key={`${s.placeId}-${i}`}
                style={[styles.suggestionItem, i < suggestions.length - 1 && styles.suggestionBorder]}
                onPress={() => handleSuggestionTap(s)}
              >
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.fg.muted} strokeWidth={1.5}>
                  <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={styles.suggestionText} numberOfLines={1}>{s.name}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Location permission denied banner */}
      {permissionDenied && (
        <View style={styles.permissionBanner}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.warning} strokeWidth={1.5}>
            <Path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={styles.permissionBannerText}>Enable location to find studios near you</Text>
          <Pressable onPress={() => Linking.openSettings()} hitSlop={8}>
            <Text style={styles.permissionBannerLink}>Open Settings</Text>
          </Pressable>
        </View>
      )}

      {/* Map view */}
      {viewMode === 'map' && (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {(studios ?? []).filter((s) => s.latitude && s.longitude).map((studio) => (
            <Marker
              key={studio.id}
              coordinate={{ latitude: studio.latitude!, longitude: studio.longitude! }}
              title={studio.name}
              description={studio.city}
            />
          ))}
        </MapView>
      )}

      {/* Studio count + sort */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {isLoading ? 'Searching...' : `${(studios ?? []).length} studio${(studios ?? []).length !== 1 ? 's' : ''} found`}
        </Text>
        <View style={styles.sortRow}>
          {nearbyData?.source && !searchQuery && (
            <Text style={styles.sourceText}>
              {nearbyData.source === 'google' ? 'Live results' : 'Cached'}
            </Text>
          )}
          <View style={styles.sortToggle}>
            <Pressable
              onPress={() => setSortOption('nearest')}
              style={[styles.sortButton, sortOption === 'nearest' && styles.sortButtonActive]}
            >
              <Text style={[styles.sortButtonText, sortOption === 'nearest' && styles.sortButtonTextActive]}>Nearest</Text>
            </Pressable>
            <Pressable
              onPress={() => setSortOption('rating')}
              style={[styles.sortButton, sortOption === 'rating' && styles.sortButtonActive]}
            >
              <Text style={[styles.sortButtonText, sortOption === 'rating' && styles.sortButtonTextActive]}>Top Rated</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Studio list */}
      {isLoading ? (
        <StudioListSkeleton />
      ) : (studios ?? []).length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={studios ?? []}
          keyExtractor={(s) => s.id}
          renderItem={({ item }) => (
            <StudioCard
              studio={item}
              isFavorited={isFavorited(item.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
      {/* Filter Sheet */}
      <Modal visible={showFilterSheet} transparent animationType="slide" onRequestClose={() => setShowFilterSheet(false)}>
        <Pressable style={styles.filterOverlay} onPress={() => setShowFilterSheet(false)}>
          <Pressable style={styles.filterSheet} onPress={() => {}}>
            <View style={styles.filterSheetHeader}>
              <Text style={styles.filterSheetTitle}>Filters</Text>
              <Pressable onPress={() => setShowFilterSheet(false)} hitSlop={8}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
                  <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Open Now Toggle */}
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Open Now</Text>
                <Switch
                  value={filters.openNow}
                  onValueChange={(val) => setFilters((prev) => ({ ...prev, openNow: val }))}
                  trackColor={{ false: colors.border.default, true: colors.success }}
                  thumbColor={colors.bg.primary}
                />
              </View>

              {/* Amenities */}
              <Text style={styles.filterSectionTitle}>Amenities</Text>
              {AMENITY_OPTIONS.map((amenity) => {
                const selected = filters.amenities.includes(amenity);
                return (
                  <Pressable
                    key={amenity}
                    style={styles.filterRow}
                    onPress={() => {
                      setFilters((prev) => ({
                        ...prev,
                        amenities: selected
                          ? prev.amenities.filter((a) => a !== amenity)
                          : [...prev.amenities, amenity],
                      }));
                    }}
                  >
                    <Text style={styles.filterLabel}>{amenity}</Text>
                    <View style={[styles.checkbox, selected && styles.checkboxActive]}>
                      {selected && (
                        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.bg.primary} strokeWidth={3}>
                          <Path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Clear / Apply buttons */}
            <View style={styles.filterActions}>
              <Pressable
                style={styles.clearFiltersButton}
                onPress={() => setFilters({ openNow: false, amenities: [] })}
              >
                <Text style={styles.clearFiltersText}>Clear All</Text>
              </Pressable>
              <Pressable
                style={styles.applyFiltersButton}
                onPress={() => setShowFilterSheet(false)}
              >
                <Text style={styles.applyFiltersText}>Apply</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  title: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.fg.primary },
  viewToggle: { flexDirection: 'row', backgroundColor: colors.bg.card, borderRadius: radius.sm, padding: 2 },
  toggleButton: { padding: 8, borderRadius: radius.xs },
  toggleButtonActive: { backgroundColor: colors.fg.primary },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingBottom: spacing.sm, gap: spacing.sm },
  searchInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: spacing.sm, gap: spacing.xs },
  searchInput: { flex: 1, paddingVertical: spacing.sm, fontSize: typography.sizes.sm, color: colors.fg.primary },
  myLocationButton: { padding: spacing.sm, backgroundColor: colors.bg.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border.default },
  map: { width: SCREEN_WIDTH, height: MAP_HEIGHT },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.25)',
  },
  permissionBannerText: { flex: 1, fontSize: typography.sizes.sm, color: colors.fg.secondary },
  permissionBannerLink: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.warning },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  countText: { fontSize: typography.sizes.sm, color: colors.fg.tertiary },
  sourceText: { fontSize: 11, color: colors.fg.muted },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.sm, marginTop: spacing.md, textAlign: 'center' },
  emptyText: { fontSize: typography.sizes.sm, color: colors.fg.tertiary, textAlign: 'center', lineHeight: 20 },
  settingsButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.button.primaryBg,
    borderRadius: radius.md,
  },
  settingsButtonText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.button.primaryText },
  retryButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  retryButtonText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  list: { padding: spacing.md },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerIconButton: { padding: spacing.xs },
  filterButton: { position: 'relative', padding: spacing.sm, backgroundColor: colors.bg.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border.default },
  filterBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: colors.error, borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  filterBadgeText: { fontSize: 10, fontWeight: typography.weights.bold, color: '#fff' },
  filterOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  filterSheet: { backgroundColor: colors.bg.primary, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, paddingHorizontal: spacing.md, paddingBottom: spacing.xl, maxHeight: '70%' },
  filterSheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.default },
  filterSheetTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border.default },
  filterLabel: { fontSize: typography.sizes.base, color: colors.fg.primary },
  filterSectionTitle: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.tertiary, textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.md, marginBottom: spacing.xs },
  checkbox: { width: 22, height: 22, borderRadius: radius.xs, borderWidth: 2, borderColor: colors.border.default, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: colors.fg.primary, borderColor: colors.fg.primary },
  filterActions: { flexDirection: 'row', gap: spacing.sm, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border.default, marginTop: spacing.sm },
  clearFiltersButton: { flex: 1, paddingVertical: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border.default, alignItems: 'center' },
  clearFiltersText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.secondary },
  applyFiltersButton: { flex: 1, paddingVertical: 12, borderRadius: radius.md, backgroundColor: colors.fg.primary, alignItems: 'center' },
  applyFiltersText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.bg.primary },
  searchWrapper: { position: 'relative', zIndex: 10 },
  suggestionsDropdown: {
    position: 'absolute',
    top: '100%',
    left: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(40, 43, 35, 0.97)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
    zIndex: 20,
    elevation: 5,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  suggestionBorder: { borderBottomWidth: 1, borderBottomColor: colors.border.default },
  suggestionText: { flex: 1, fontSize: typography.sizes.sm, color: colors.fg.primary },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sortToggle: { flexDirection: 'row', backgroundColor: colors.bg.card, borderRadius: radius.sm, padding: 2 },
  sortButton: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.xs },
  sortButtonActive: { backgroundColor: colors.fg.primary },
  sortButtonText: { fontSize: 11, color: colors.fg.tertiary, fontWeight: typography.weights.medium },
  sortButtonTextActive: { color: colors.bg.primary },
});
