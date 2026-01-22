'use client';

import { useState, useCallback } from 'react';

export interface Studio {
  id: string;
  name: string;
  city: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  googlePlaceId?: string | null;
  googleDataFetched?: string | null;
  formattedAddress?: string | null;
  phoneNumber?: string | null;
  website?: string | null;
  rating?: number | null;
  ratingCount?: number | null;
  openingHours?: {
    open_now?: boolean;
    weekday_text?: string[];
    periods?: Array<{
      open: { day: number; time: string };
      close?: { day: number; time: string };
    }>;
  } | null;
  photos?: Array<{
    reference: string;
    height: number;
    width: number;
  }> | null;
  amenities?: string[];
  verified?: boolean;
  distance?: number;
}

interface StudiosState {
  studios: Studio[];
  loading: boolean;
  error: string | null;
  source: string | null;
}

interface UseStudiosReturn extends StudiosState {
  searchNearby: (lat: number, lng: number, radius?: number, keyword?: string) => Promise<void>;
  geocodeAndSearch: (query: string, radius?: number, keyword?: string) => Promise<void>;
  getStudioDetails: (id: string) => Promise<Studio | null>;
  clearStudios: () => void;
  clearError: () => void;
}

export function useStudios(): UseStudiosReturn {
  const [state, setState] = useState<StudiosState>({
    studios: [],
    loading: false,
    error: null,
    source: null,
  });

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearStudios = useCallback(() => {
    setState({
      studios: [],
      loading: false,
      error: null,
      source: null,
    });
  }, []);

  const searchNearby = useCallback(async (
    lat: number,
    lng: number,
    radius: number = 10000,
    keyword: string = 'Pilates studio'
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius: radius.toString(),
        keyword,
      });

      const response = await fetch(`/api/studios/nearby?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search nearby studios');
      }

      setState({
        studios: data.studios || [],
        loading: false,
        error: data.warning || null,
        source: data.source,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, []);

  const geocodeAndSearch = useCallback(async (
    query: string,
    radius: number = 10000,
    keyword: string = 'Pilates studio'
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // First, geocode the location
      const geocodeResponse = await fetch(`/api/studios/geocode?q=${encodeURIComponent(query)}`);
      const geocodeData = await geocodeResponse.json();

      if (!geocodeResponse.ok) {
        throw new Error(geocodeData.error || 'Failed to find location');
      }

      // Then search nearby
      const params = new URLSearchParams({
        lat: geocodeData.latitude.toString(),
        lng: geocodeData.longitude.toString(),
        radius: radius.toString(),
        keyword,
      });

      const nearbyResponse = await fetch(`/api/studios/nearby?${params}`);
      const nearbyData = await nearbyResponse.json();

      if (!nearbyResponse.ok) {
        throw new Error(nearbyData.error || 'Failed to search nearby studios');
      }

      setState({
        studios: nearbyData.studios || [],
        loading: false,
        error: nearbyData.warning || null,
        source: nearbyData.source,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, []);

  const getStudioDetails = useCallback(async (id: string): Promise<Studio | null> => {
    try {
      const response = await fetch(`/api/studios/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch studio details');
      }

      return data.studio;
    } catch (error) {
      console.error('Error fetching studio details:', error);
      return null;
    }
  }, []);

  return {
    ...state,
    searchNearby,
    geocodeAndSearch,
    getStudioDetails,
    clearStudios,
    clearError,
  };
}
