import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone?: string;
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

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
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
        try {
          const res = await axios.post(
            "/api/v1/auth/refresh",
            {},
            { withCredentials: true }
          );
          set({ token: res.data.data.access_token, _isInitialized: true });
        } catch {
          set({ token: null, user: null, _isInitialized: true });
        }
      },
    }),
    {
      name: "ocs-auth",
      // token is memory-only — only the user profile is persisted
      partialize: (s) => ({ user: s.user }),
      onRehydrateStorage: () => (state) => {
        setTimeout(() => state?.setHasHydrated(true), 0);
      },
    }
  )
);
