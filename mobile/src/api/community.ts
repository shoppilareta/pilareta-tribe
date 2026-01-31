import { apiFetch } from './client';
import type {
  UgcFeedResponse,
  UgcCommentsResponse,
  UgcTagsResponse,
  CursorPaginationParams,
} from '@shared/types';
import type { UgcPost } from '@shared/types';

export async function getFeed(params?: CursorPaginationParams & {
  tag?: string;
  studioId?: string;
}): Promise<UgcFeedResponse> {
  const query = new URLSearchParams();
  if (params?.cursor) query.set('cursor', params.cursor);
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.tag) query.set('tag', params.tag);
  if (params?.studioId) query.set('studioId', params.studioId);

  const qs = query.toString();
  return apiFetch(`/api/ugc/posts${qs ? `?${qs}` : ''}`, { skipAuth: true });
}

export async function getPost(id: string): Promise<UgcPost> {
  return apiFetch(`/api/ugc/posts/${id}`, { skipAuth: true });
}

export async function likePost(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/api/ugc/posts/${id}/like`, { method: 'POST' });
}

export async function unlikePost(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/api/ugc/posts/${id}/like`, { method: 'DELETE' });
}

export async function savePost(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/api/ugc/posts/${id}/save`, { method: 'POST' });
}

export async function unsavePost(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/api/ugc/posts/${id}/save`, { method: 'DELETE' });
}

export async function getComments(postId: string, params?: CursorPaginationParams): Promise<UgcCommentsResponse> {
  const query = new URLSearchParams();
  if (params?.cursor) query.set('cursor', params.cursor);
  if (params?.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  return apiFetch(`/api/ugc/posts/${postId}/comments${qs ? `?${qs}` : ''}`, { skipAuth: true });
}

export async function addComment(postId: string, content: string): Promise<{ success: boolean }> {
  return apiFetch(`/api/ugc/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function getTags(): Promise<UgcTagsResponse> {
  return apiFetch('/api/ugc/tags', { skipAuth: true });
}

export async function getFeatured(limit = 6): Promise<{ posts: UgcPost[] }> {
  return apiFetch(`/api/ugc/featured?limit=${limit}`, { skipAuth: true });
}

export async function getMyPosts(params?: CursorPaginationParams): Promise<UgcFeedResponse> {
  const query = new URLSearchParams();
  if (params?.cursor) query.set('cursor', params.cursor);
  if (params?.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  return apiFetch(`/api/ugc/my-posts${qs ? `?${qs}` : ''}`);
}

export async function createPost(data: {
  file?: { uri: string; type: string; name: string };
  instagramUrl?: string;
  caption?: string;
  studioId?: string;
  tagIds?: string[];
}): Promise<{ success: boolean; post: UgcPost; message: string }> {
  const formData = new FormData();

  if (data.file) {
    formData.append('file', data.file as unknown as Blob);
  }
  if (data.instagramUrl) formData.append('instagramUrl', data.instagramUrl);
  if (data.caption) formData.append('caption', data.caption);
  if (data.studioId) formData.append('studioId', data.studioId);
  if (data.tagIds?.length) formData.append('tagIds', JSON.stringify(data.tagIds));
  formData.append('consentGiven', 'true');

  return apiFetch('/api/ugc/posts', {
    method: 'POST',
    body: formData,
  });
}

export async function deletePost(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/api/ugc/posts/${id}`, { method: 'DELETE' });
}

export async function getSavedPosts(params?: CursorPaginationParams): Promise<UgcFeedResponse> {
  const query = new URLSearchParams();
  if (params?.cursor) query.set('cursor', params.cursor);
  if (params?.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  return apiFetch(`/api/ugc/saved${qs ? `?${qs}` : ''}`);
}
