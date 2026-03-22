'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { SearchPanel } from './SearchPanel';
import { StudioMap } from './StudioMap';
import { StudioList } from './StudioList';
import { StudioDetailModal } from './StudioDetailModal';
import { ClaimStudioForm } from './ClaimStudioForm';
import { SuggestEditForm } from './SuggestEditForm';
import { ViewToggle } from './ViewToggle';
import { FilterSortPanel, type FilterState, type SortOption } from './FilterSortPanel';
import { useStudios, type Studio } from './hooks/useStudios';
import { useGeolocation } from './hooks/useGeolocation';

// Helper: check if studio is open now (same logic as StudioCard)
function isStudioOpenNow(openingHours: Studio['openingHours']): boolean | null {
  if (!openingHours || typeof openingHours !== 'object') return null;
  if (openingHours.open_now !== undefined) return openingHours.open_now;
  const periods = openingHours.periods;
  if (!Array.isArray(periods) || periods.length === 0) return null;
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  for (const period of periods) {
    if (!period.open) continue;
    if (period.open.day === 0 && period.open.time === '0000' && !period.close) return true;
    const openDay = period.open.day;
    const openTime = period.open.time;
    const closeDay = period.close?.day ?? openDay;
    const closeTime = period.close?.time ?? '2359';
    if (openDay === closeDay) {
      if (currentDay === openDay && currentTime >= openTime && currentTime < closeTime) return true;
    } else {
      if ((currentDay === openDay && currentTime >= openTime) || (currentDay === closeDay && currentTime < closeTime)) return true;
    }
  }
  return false;
}

// Default to India if geolocation unavailable
const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };

export function StudioLocatorClient() {
  const [view, setView] = useState<'map' | 'list'>('map');
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null);
  const [detailStudio, setDetailStudio] = useState<Studio | null>(null);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(INDIA_CENTER);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ openNow: false, amenities: [] });
  const [sortBy, setSortBy] = useState<SortOption>('nearest');

  const { studios, loading, error, searchNearby, geocodeAndSearch, getStudioDetails, clearError } = useStudios();

  // Fetch auth status and favorites
  useEffect(() => {
    async function loadFavorites() {
      try {
        const userRes = await fetch('/api/user');
        if (!userRes.ok) return;
        const userData = await userRes.json();
        if (!userData.user) return;
        setIsAuthenticated(true);

        const favRes = await fetch('/api/studios/favorites');
        if (favRes.ok) {
          const favData = await favRes.json();
          setFavoriteIds(new Set(favData.studioIds || []));
        }
      } catch {
        // Not authenticated or favorites unavailable
      }
    }
    loadFavorites();
  }, []);

  const handleToggleFavorite = useCallback(async (studioId: string) => {
    if (!isAuthenticated) return;
    const wasFavorited = favoriteIds.has(studioId);

    // Optimistic update
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (wasFavorited) next.delete(studioId); else next.add(studioId);
      return next;
    });

    try {
      if (wasFavorited) {
        await fetch(`/api/studios/favorites/${studioId}`, { method: 'DELETE' });
      } else {
        await fetch('/api/studios/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studioId }),
        });
      }
    } catch {
      // Revert on failure
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFavorited) next.add(studioId); else next.delete(studioId);
        return next;
      });
    }
  }, [isAuthenticated, favoriteIds]);

  // Apply filters and sorting to studios
  const filteredStudios = useMemo(() => {
    let result = [...studios];

    // Open Now filter
    if (filters.openNow) {
      result = result.filter((s) => isStudioOpenNow(s.openingHours) === true);
    }

    // Amenity filters
    if (filters.amenities.length > 0) {
      result = result.filter((s) => {
        const studioAmenities = (s.amenities || []).map((a) => a.toLowerCase());
        return filters.amenities.every((f) => studioAmenities.some((a) => a.includes(f.toLowerCase())));
      });
    }

    // Sorting
    if (sortBy === 'highest_rated') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    // 'nearest' is the default API order (by distance), no re-sort needed

    return result;
  }, [studios, filters, sortBy]);
  const { getCurrentLocation, loading: locationLoading, error: locationError, clearError: clearLocationError, latitude: userLat, longitude: userLng } = useGeolocation();

  // Auto-detect location on mount
  useEffect(() => {
    if (initialLoadDone) return;

    const initializeLocation = async () => {
      setInitialLoadDone(true);

      // Try to get user's location
      const location = await getCurrentLocation();

      if (location) {
        // User location available - use it
        setMapCenter({ lat: location.latitude, lng: location.longitude });
        await searchNearby(location.latitude, location.longitude);
      } else {
        // Fallback to India
        clearLocationError();
        setMapCenter(INDIA_CENTER);
        await searchNearby(INDIA_CENTER.lat, INDIA_CENTER.lng, 50000); // 50km radius for India default
      }
    };

    initializeLocation();
  }, [initialLoadDone, getCurrentLocation, searchNearby, clearLocationError]);

  // Handle success messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSearch = useCallback(
    async (query: string) => {
      clearError();
      const location = await geocodeAndSearch(query);
      if (location) {
        setMapCenter({ lat: location.latitude, lng: location.longitude });
      }
    },
    [geocodeAndSearch, clearError]
  );

  const handleNearMe = useCallback(async () => {
    clearError();
    const location = await getCurrentLocation();
    if (location) {
      setMapCenter({ lat: location.latitude, lng: location.longitude });
      await searchNearby(location.latitude, location.longitude);
    }
  }, [getCurrentLocation, searchNearby, clearError]);

  const handleMapMoved = useCallback(
    async (newCenter: { lat: number; lng: number }) => {
      // Don't update mapCenter state to avoid re-centering the map
      // Just search for studios at the new location
      await searchNearby(newCenter.lat, newCenter.lng);
    },
    [searchNearby]
  );

  const handleSelectStudio = useCallback(
    async (studio: Studio) => {
      setSelectedStudio(studio);
      // Fetch full details if needed
      const details = await getStudioDetails(studio.id);
      if (details) {
        setDetailStudio(details);
      } else {
        setDetailStudio(studio);
      }
    },
    [getStudioDetails]
  );

  const handleCloseDetail = useCallback(() => {
    setDetailStudio(null);
    setSelectedStudio(null);
  }, []);

  const handleClaimClick = useCallback(() => {
    setShowClaimForm(true);
  }, []);

  const handleSuggestEditClick = useCallback(() => {
    setShowEditForm(true);
  }, []);

  const handleClaimSuccess = useCallback(() => {
    setShowClaimForm(false);
    setSuccessMessage('Your claim has been submitted. We will review it shortly.');
  }, []);

  const handleEditSuccess = useCallback(() => {
    setShowEditForm(false);
    setSuccessMessage('Your suggestion has been submitted. Thank you for helping us improve!');
  }, []);

  // Get window width for responsive design
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const displayError = error || locationError;

  return (
    <div
      style={{
        height: 'calc(100vh - 4rem)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Search Panel */}
      <SearchPanel
        onSearch={handleSearch}
        onNearMe={handleNearMe}
        loading={loading}
        locationLoading={locationLoading}
      />

      {/* Filter/Sort Panel */}
      <FilterSortPanel
        filters={filters}
        onFiltersChange={setFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Error/Success Messages */}
      {displayError && (
        <div
          style={{
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {displayError}
          <button
            type="button"
            onClick={clearError}
            style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {successMessage && (
        <div
          style={{
            padding: '0.75rem 1rem',
            background: 'rgba(34, 197, 94, 0.1)',
            borderBottom: '1px solid rgba(34, 197, 94, 0.2)',
            color: '#22c55e',
            fontSize: '0.875rem',
          }}
        >
          {successMessage}
        </div>
      )}

      {/* Mobile View Toggle */}
      {isMobile && (
        <div
          style={{
            padding: '0.5rem 1rem',
            borderBottom: '1px solid rgba(246, 237, 221, 0.1)',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      )}

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Map */}
        <div
          style={{
            flex: isMobile ? 'none' : 1,
            width: isMobile ? (view === 'map' ? '100%' : '0') : '50%',
            height: '100%',
            display: isMobile && view !== 'map' ? 'none' : 'block',
          }}
        >
          <StudioMap
            studios={filteredStudios}
            center={mapCenter}
            selectedStudioId={selectedStudio?.id || null}
            onSelectStudio={handleSelectStudio}
            userLocation={userLat && userLng ? { lat: userLat, lng: userLng } : null}
            onMapMoved={handleMapMoved}
          />
        </div>

        {/* List */}
        <div
          style={{
            flex: isMobile ? 'none' : 1,
            width: isMobile ? (view === 'list' ? '100%' : '0') : '50%',
            height: '100%',
            overflow: 'auto',
            borderLeft: isMobile ? 'none' : '1px solid rgba(246, 237, 221, 0.1)',
            display: isMobile && view !== 'list' ? 'none' : 'block',
          }}
        >
          <StudioList
            studios={filteredStudios}
            loading={loading}
            selectedStudioId={selectedStudio?.id || null}
            onSelectStudio={handleSelectStudio}
            favoriteIds={isAuthenticated ? favoriteIds : undefined}
            onToggleFavorite={isAuthenticated ? handleToggleFavorite : undefined}
          />
        </div>
      </div>

      {/* Detail Modal */}
      <StudioDetailModal
        studio={detailStudio}
        onClose={handleCloseDetail}
        onClaimClick={handleClaimClick}
        onSuggestEditClick={handleSuggestEditClick}
      />

      {/* Claim Form */}
      {showClaimForm && detailStudio && (
        <ClaimStudioForm
          studio={detailStudio}
          onClose={() => setShowClaimForm(false)}
          onSuccess={handleClaimSuccess}
        />
      )}

      {/* Edit Form */}
      {showEditForm && detailStudio && (
        <SuggestEditForm
          studio={detailStudio}
          onClose={() => setShowEditForm(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
