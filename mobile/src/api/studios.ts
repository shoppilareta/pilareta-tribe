import { apiFetch } from './client';
import type {
  StudiosResponse,
  NearbyStudiosResponse,
  GeocodeResponse,
} from '@shared/types';
import type { Studio } from '@shared/types';

export async function searchStudios(params?: {
  city?: string;
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<StudiosResponse> {
  const query = new URLSearchParams();
  if (params?.city) query.set('city', params.city);
  if (params?.q) query.set('q', params.q);
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.offset) query.set('offset', String(params.offset));

  const qs = query.toString();
  return apiFetch(`/api/studios${qs ? `?${qs}` : ''}`, { skipAuth: true });
}

export async function getNearbyStudios(lat: number, lng: number, radius = 10000): Promise<NearbyStudiosResponse> {
  return apiFetch(`/api/studios/nearby?lat=${lat}&lng=${lng}&radius=${radius}`, { skipAuth: true });
}

export async function geocode(query: string): Promise<GeocodeResponse> {
  return apiFetch(`/api/studios/geocode?q=${encodeURIComponent(query)}`, { skipAuth: true });
}

export async function quickSearch(q: string, limit = 10): Promise<{ studios: Studio[] }> {
  return apiFetch(`/api/studios/search?q=${encodeURIComponent(q)}&limit=${limit}`, { skipAuth: true });
}

export async function getStudio(id: string): Promise<{ studio: Studio }> {
  return apiFetch(`/api/studios/${id}`, { skipAuth: true });
}
