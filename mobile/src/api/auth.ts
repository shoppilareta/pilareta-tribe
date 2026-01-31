import { apiFetch, API_BASE } from './client';
import type { MobileLoginResponse, MobileCallbackRequest, MobileCallbackResponse } from '@shared/types';

export async function initiateLogin(): Promise<MobileLoginResponse> {
  return apiFetch('/api/auth/mobile/login', {
    method: 'POST',
    skipAuth: true,
  });
}

export async function exchangeCode(params: MobileCallbackRequest): Promise<MobileCallbackResponse> {
  return apiFetch('/api/auth/mobile/callback', {
    method: 'POST',
    body: JSON.stringify(params),
    skipAuth: true,
  });
}

export async function logoutMobile(accessToken: string): Promise<{ success: boolean; logoutUrl?: string }> {
  return apiFetch('/api/auth/mobile/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    skipAuth: true,
  });
}
