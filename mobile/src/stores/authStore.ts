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
  setUser: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  isTokenExpired: () => boolean;
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

  setUser: async (user) => {
    await SecureStore.setItemAsync(TOKEN_KEYS.user, JSON.stringify(user));
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
        // Parse and validate user data, handling corrupted JSON gracefully
        let user: User | null = null;
        if (userJson) {
          try {
            const parsed = JSON.parse(userJson);
            // Validate the parsed data has required shape
            if (
              parsed &&
              typeof parsed === 'object' &&
              typeof parsed.id === 'string' &&
              typeof parsed.email === 'string' &&
              typeof parsed.isAdmin === 'boolean'
            ) {
              user = {
                id: parsed.id,
                email: parsed.email,
                firstName: typeof parsed.firstName === 'string' ? parsed.firstName : null,
                lastName: typeof parsed.lastName === 'string' ? parsed.lastName : null,
                isAdmin: parsed.isAdmin,
              };
            }
          } catch {
            // Corrupted user JSON - clear it but keep tokens (user data will
            // be refreshed from the server on next API call)
            await SecureStore.deleteItemAsync(TOKEN_KEYS.user);
          }
        }

        // Validate expiresAt is a valid date string
        const validExpiresAt = expiresAt && !isNaN(new Date(expiresAt).getTime()) ? expiresAt : null;

        set({
          accessToken,
          refreshToken,
          expiresAt: validExpiresAt,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        // Partial state (one token present but not the other) - clean up
        if (accessToken || refreshToken) {
          await SecureStore.deleteItemAsync(TOKEN_KEYS.accessToken);
          await SecureStore.deleteItemAsync(TOKEN_KEYS.refreshToken);
          await SecureStore.deleteItemAsync(TOKEN_KEYS.expiresAt);
          await SecureStore.deleteItemAsync(TOKEN_KEYS.user);
        }
        set({ isLoading: false });
      }
    } catch {
      // SecureStore itself failed (e.g. device security compromised) - reset state
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  isTokenExpired: () => {
    const { expiresAt } = get();
    if (!expiresAt) return true;
    return new Date(expiresAt).getTime() < Date.now();
  },
}));
