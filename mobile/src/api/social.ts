import { apiFetch } from './client';

export interface UserSummary {
  id: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  avatarUrl: string | null;
  followedAt?: string;
}

export interface SearchUser extends UserSummary {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

interface FollowResponse {
  success: boolean;
  following: boolean;
}

interface FollowersResponse {
  followers: UserSummary[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface FollowingResponse {
  following: UserSummary[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface SearchUsersResponse {
  users: SearchUser[];
}

// Follow a user
export async function followUser(id: string): Promise<FollowResponse> {
  return apiFetch(`/api/users/${id}/follow`, { method: 'POST' });
}

// Unfollow a user
export async function unfollowUser(id: string): Promise<FollowResponse> {
  return apiFetch(`/api/users/${id}/follow`, { method: 'DELETE' });
}

// Get followers of a user
export async function getFollowers(
  id: string,
  params?: { cursor?: string; limit?: number }
): Promise<FollowersResponse> {
  const query = new URLSearchParams();
  if (params?.cursor) query.set('cursor', params.cursor);
  if (params?.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  return apiFetch(`/api/users/${id}/followers${qs ? `?${qs}` : ''}`, { skipAuth: true });
}

// Get users that a user is following
export async function getFollowing(
  id: string,
  params?: { cursor?: string; limit?: number }
): Promise<FollowingResponse> {
  const query = new URLSearchParams();
  if (params?.cursor) query.set('cursor', params.cursor);
  if (params?.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  return apiFetch(`/api/users/${id}/following${qs ? `?${qs}` : ''}`, { skipAuth: true });
}

// Search users by name or email
export async function searchUsers(
  q: string,
  limit?: number
): Promise<SearchUsersResponse> {
  const query = new URLSearchParams();
  query.set('q', q);
  if (limit) query.set('limit', String(limit));

  return apiFetch(`/api/users/search?${query}`);
}
