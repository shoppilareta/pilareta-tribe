import { apiFetch } from './client';
import type { UserProfileResponse, UpdateUserProfileRequest } from '@shared/types';

export async function getProfile(): Promise<UserProfileResponse> {
  return apiFetch('/api/user/profile');
}

export async function updateProfile(
  data: UpdateUserProfileRequest
): Promise<UserProfileResponse> {
  return apiFetch('/api/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
