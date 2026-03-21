'use client';

import { useCallback, useMemo, useEffect, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import type { Studio } from './hooks/useStudios';

interface StudioMapProps {
  studios: Studio[];
  center: { lat: number; lng: number } | null;
  selectedStudioId: string | null;
  onSelectStudio: (studio: Studio) => void;
  userLocation?: { lat: number; lng: number } | null;
  onMapMoved?: (center: { lat: number; lng: number }) => void;
}

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 }; // India
const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Inner component that can use the useMap hook
function MapController({
  center,
  studios,
  onMapMoved,
}: {
  center: { lat: number; lng: number };
  studios: Studio[];
  onMapMoved?: (center: { lat: number; lng: number }) => void;
}) {
  const map = useMap();
  const [lastProgrammaticCenter, setLastProgrammaticCenter] = useState<string | null>(null);

  // Handle programmatic center changes (from search)
  useEffect(() => {
    if (!map) return;

    const centerKey = `${center.lat},${center.lng}`;
    setLastProgrammaticCenter(centerKey);

    // Pan to center when it changes
    map.panTo(center);

    // Adjust zoom based on whether we have studios
    if (studios.length > 0) {
      map.setZoom(12);
    } else {
      map.setZoom(10);
    }
  }, [map, center, studios.length]);

  // Listen for user drag events
  useEffect(() => {
    if (!map || !onMapMoved) return;

    const handleDragEnd = () => {
      const newCenter = map.getCenter();
      if (!newCenter) return;

      const newLat = newCenter.lat();
      const newLng = newCenter.lng();
      const newCenterKey = `${newLat},${newLng}`;

      // Only trigger if this is a user-initiated move (not programmatic)
      if (newCenterKey !== lastProgrammaticCenter) {
        onMapMoved({ lat: newLat, lng: newLng });
      }
    };

    const listener = map.addListener('dragend', handleDragEnd);

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, onMapMoved, lastProgrammaticCenter]);

  return null;
}

export function StudioMap({ studios, center, selectedStudioId, onSelectStudio, userLocation, onMapMoved }: StudioMapProps) {
  const [initialCenter] = useState(center || DEFAULT_CENTER);
  const mapCenter = center || DEFAULT_CENTER;

  // Calculate bounds to fit all markers
  const bounds = useMemo(() => {
    if (studios.length === 0) return null;

    let minLat = Infinity,
      maxLat = -Infinity,
      minLng = Infinity,
      maxLng = -Infinity;

    studios.forEach((studio) => {
      if (studio.latitude && studio.longitude) {
        minLat = Math.min(minLat, studio.latitude);
        maxLat = Math.max(maxLat, studio.latitude);
        minLng = Math.min(minLng, studio.longitude);
        maxLng = Math.max(maxLng, studio.longitude);
      }
    });

    if (minLat === Infinity) return null;

    return {
      north: maxLat,
      south: minLat,
      east: maxLng,
      west: minLng,
    };
  }, [studios]);

  const handleMarkerClick = useCallback(
    (studio: Studio) => {
      onSelectStudio(studio);
    },
    [onSelectStudio]
  );

  if (!MAPS_API_KEY) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(246, 237, 221, 0.05)',
          color: 'rgba(246, 237, 221, 0.6)',
        }}
      >
        Map unavailable - API key missing
      </div>
    );
  }

  return (
    <APIProvider apiKey={MAPS_API_KEY}>
      <Map
        defaultCenter={initialCenter}
        defaultZoom={10}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapId="studio-locator-map"
        style={{ width: '100%', height: '100%' }}
      >
        <MapController center={mapCenter} studios={studios} onMapMoved={onMapMoved} />
        {studios.map((studio) => {
          if (!studio.latitude || !studio.longitude) return null;
          const isSelected = studio.id === selectedStudioId;

          return (
            <AdvancedMarker
              key={studio.id}
              position={{ lat: studio.latitude, lng: studio.longitude }}
              onClick={() => handleMarkerClick(studio)}
              title={studio.name}
            >
              <Pin
                background={isSelected ? '#f59e0b' : '#f6eddd'}
                borderColor={isSelected ? '#d97706' : '#1a1a1a'}
                glyphColor={isSelected ? '#1a1a1a' : '#1a1a1a'}
                scale={isSelected ? 1.2 : 1}
              />
            </AdvancedMarker>
          );
        })}
        {/* User's current location - blue dot */}
        {userLocation && (
          <AdvancedMarker
            position={userLocation}
            title="Your location"
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#4285F4',
                border: '3px solid white',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            />
          </AdvancedMarker>
        )}
      </Map>
    </APIProvider>
  );
}
