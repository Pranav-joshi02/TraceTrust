import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  organizationId: string;
  organizationName?: string;
  organizationCode?: string;
  organizationType?: string;
  roles: string[];
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; organizationCode?: string }) => Promise<boolean>;
  logout: () => void;
  loadSession: () => Promise<void>;
  clearError: () => void;
}

const BASE_URL = typeof window !== 'undefined' ? '' : (process.env.INTERNAL_API_URL || 'http://127.0.0.1:4000');

function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Login failed' }));
        set({ isLoading: false, error: err.message || 'Invalid email or password.' });
        return false;
      }

      const data = await res.json();
      setCookie('tt_auth_token', data.accessToken, 1);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('tt_auth_token', data.accessToken);
        localStorage.setItem('tt_user', JSON.stringify(data.user));
      }

      set({
        user: data.user,
        token: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err) {
      set({ isLoading: false, error: 'Network error. Please try again.' });
      return false;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Registration failed' }));
        set({ isLoading: false, error: err.message || 'Registration failed.' });
        return false;
      }

      const result = await res.json();
      setCookie('tt_auth_token', result.accessToken, 1);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('tt_auth_token', result.accessToken);
        localStorage.setItem('tt_user', JSON.stringify(result.user));
      }

      set({
        user: result.user,
        token: result.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err) {
      set({ isLoading: false, error: 'Network error. Please try again.' });
      return false;
    }
  },

  logout: () => {
    deleteCookie('tt_auth_token');
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('tt_auth_token');
      localStorage.removeItem('tt_user');
    }
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  loadSession: async () => {
    const token = getCookie('tt_auth_token') || (typeof localStorage !== 'undefined' ? localStorage.getItem('tt_auth_token') : null);
    if (!token) {
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }

    // Try to load user from localStorage first
    if (typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem('tt_user');
      if (cached) {
        try {
          const user = JSON.parse(cached);
          set({ user, token, isAuthenticated: true });
        } catch { /* ignore */ }
      }
    }

    // Verify with API
    try {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const user = await res.json();
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('tt_user', JSON.stringify(user));
        }
        set({ user, token, isAuthenticated: true });
      } else {
        // Token invalid/expired
        deleteCookie('tt_auth_token');
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('tt_auth_token');
          localStorage.removeItem('tt_user');
        }
        set({ user: null, token: null, isAuthenticated: false });
      }
    } catch {
      // API unreachable — keep cached session
    }
  },

  clearError: () => set({ error: null }),
}));
