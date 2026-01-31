import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setTokens: (accessToken: string, refreshToken: string, expiresAt: string) => Promise<void>;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

const TOKEN_KEYS = {
  accessToken: 'pilareta_access_token',
  refreshToken: 'pilareta_refresh_token',
  expiresAt: 'pilareta_expires_at',
  user: 'pilareta_user',
} as const;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  isLoading: true,
  isAuthenticated: false,

  setTokens: async (accessToken, refreshToken, expiresAt) => {
    await SecureStore.setItemAsync(TOKEN_KEYS.accessToken, accessToken);
    await SecureStore.setItemAsync(TOKEN_KEYS.refreshToken, refreshToken);
    await SecureStore.setItemAsync(TOKEN_KEYS.expiresAt, expiresAt);
    set({ accessToken, refreshToken, expiresAt, isAuthenticated: true });
  },

  setUser: (user) => {
    SecureStore.setItemAsync(TOKEN_KEYS.user, JSON.stringify(user));
    set({ user });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEYS.accessToken);
    await SecureStore.deleteItemAsync(TOKEN_KEYS.refreshToken);
    await SecureStore.deleteItemAsync(TOKEN_KEYS.expiresAt);
    await SecureStore.deleteItemAsync(TOKEN_KEYS.user);
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
    });
  },

  loadStoredAuth: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync(TOKEN_KEYS.accessToken);
      const refreshToken = await SecureStore.getItemAsync(TOKEN_KEYS.refreshToken);
      const expiresAt = await SecureStore.getItemAsync(TOKEN_KEYS.expiresAt);
      const userJson = await SecureStore.getItemAsync(TOKEN_KEYS.user);

      if (accessToken && refreshToken) {
        const user = userJson ? JSON.parse(userJson) : null;
        set({
          accessToken,
          refreshToken,
          expiresAt,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
