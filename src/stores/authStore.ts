import axios from "axios";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  purchaseBadge?: boolean;
  role: "customer" | "staff" | "owner";
};

type AuthStore = {
  user: AuthUser | null;
  token: string | null;
  _hasHydrated: boolean;
  _isInitialized: boolean;
  setHasHydrated: (v: boolean) => void;
  setAuth: (user: AuthUser, token: string) => void;
  setUser: (user: AuthUser) => void;
  setToken: (token: string | null) => void;
  clear: () => void;
  initAuth: () => Promise<void>;
};

// user → localStorage (survives browser close)
// token → sessionStorage (survives page refresh, cleared on tab close)
const hybridStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    const base = localStorage.getItem(name);
    const token = sessionStorage.getItem(`${name}:token`);
    const parsed = base ? JSON.parse(base) : { state: {}, version: 0 };
    parsed.state.token = token ? JSON.parse(token) : null;
    return JSON.stringify(parsed);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return;
    const parsed = JSON.parse(value) as { state: AuthStore; version: number };
    const { token, ...rest } = parsed.state;
    // Only touch sessionStorage when token is explicitly set or cleared (null).
    // undefined means the field wasn't intentionally changed — leave sessionStorage alone.
    if (typeof token === "string") sessionStorage.setItem(`${name}:token`, JSON.stringify(token));
    else if (token === null) sessionStorage.removeItem(`${name}:token`);
    localStorage.setItem(name, JSON.stringify({ ...parsed, state: rest }));
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
    sessionStorage.removeItem(`${name}:token`);
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      _hasHydrated: false,
      _isInitialized: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setAuth: (user, token) => set({ user, token }),
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      clear: () => set({ user: null, token: null }),
      initAuth: async () => {
        // Token already restored from sessionStorage — no need to hit the refresh endpoint.
        // The API client's 401 interceptor will refresh when the token actually expires.
        if (get().token) {
          set({ _isInitialized: true });
          return;
        }
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );
          const newToken: string | undefined = res.data?.data?.access_token ?? res.data?.access_token;
          if (newToken) set({ token: newToken, _isInitialized: true });
          else set({ _isInitialized: true });
        } catch (err) {
          // Only clear session on explicit 401 (refresh token expired/invalid).
          // Network errors, CORS failures, etc. should not log the user out.
          const status = axios.isAxiosError(err) ? err.response?.status : null;
          if (status === 401) {
            set({ token: null, user: null, _isInitialized: true });
          } else {
            set({ _isInitialized: true });
          }
        }
      },
    }),
    {
      name: "ocs-auth",
      storage: createJSONStorage(() => hybridStorage),
      partialize: (s) => ({ user: s.user, token: s.token }),
      onRehydrateStorage: () => (state) => {
        setTimeout(() => state?.setHasHydrated(true), 0);
      },
    }
  )
);
