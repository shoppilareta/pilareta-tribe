import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import MapView, { Marker, Region } from 'react-native-maps';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { StudioCard } from '@/components/studios';
import { getNearbyStudios, searchStudios, geocode } from '@/api/studios';
import type { Studio } from '@shared/types';

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
  const mapRef = useRef<MapView>(null);

  // Get user location on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

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

  const activeLocation = searchLocation || userLocation;

  const { data: nearbyData, isLoading: nearbyLoading } = useQuery({
    queryKey: ['studios-nearby', activeLocation?.lat, activeLocation?.lng],
    queryFn: () => getNearbyStudios(activeLocation!.lat, activeLocation!.lng, 15000),
    enabled: !!activeLocation,
  });

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['studios-search', searchQuery],
    queryFn: () => searchStudios({ q: searchQuery, limit: 30 }),
    enabled: searchQuery.length >= 2,
  });

  const studios = searchQuery.length >= 2
    ? (searchData?.studios ?? [])
    : (nearbyData?.studios ?? []);
  const isLoading = searchQuery.length >= 2 ? searchLoading : nearbyLoading;

  const handleSearch = async () => {
    const q = searchQuery.trim();
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Studios</Text>
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

      {/* Search bar */}
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
            <Pressable onPress={() => { setSearchQuery(''); setSearchLocation(null); }} hitSlop={8}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.fg.muted} strokeWidth={1.5}>
                <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
          )}
        </View>
        {userLocation && (
          <Pressable onPress={handleMyLocation} style={styles.myLocationButton} hitSlop={8}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={1.5}>
              <Path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
            </Svg>
          </Pressable>
        )}
      </View>

      {/* Map view */}
      {viewMode === 'map' && (
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {studios.filter((s) => s.latitude && s.longitude).map((studio) => (
            <Marker
              key={studio.id}
              coordinate={{ latitude: studio.latitude!, longitude: studio.longitude! }}
              title={studio.name}
              description={studio.city}
            />
          ))}
        </MapView>
      )}

      {/* Studio count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {isLoading ? 'Searching...' : `${studios.length} studio${studios.length !== 1 ? 's' : ''} found`}
        </Text>
        {nearbyData?.source && !searchQuery && (
          <Text style={styles.sourceText}>
            {nearbyData.source === 'google' ? 'Live results' : 'Cached'}
          </Text>
        )}
      </View>

      {/* Studio list */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.fg.primary} />
        </View>
      ) : studios.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No studios found</Text>
          <Text style={styles.emptyText}>
            {searchQuery ? 'Try a different search term.' : 'Try searching for a city or studio name.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={studios}
          keyExtractor={(s) => s.id}
          renderItem={({ item }) => <StudioCard studio={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  countRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  countText: { fontSize: typography.sizes.sm, color: colors.fg.tertiary },
  sourceText: { fontSize: 11, color: colors.fg.muted },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.sm },
  emptyText: { fontSize: typography.sizes.sm, color: colors.fg.tertiary, textAlign: 'center' },
  list: { padding: spacing.md },
});
