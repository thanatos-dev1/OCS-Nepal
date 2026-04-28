import { create } from "zustand";
import type { AdminRole } from "@/lib/api/types";

export type AdminAuthUser = {
  adminId: number;
  role: AdminRole;
};

type AdminAuthStore = {
  token: string | null;
  admin: AdminAuthUser | null;
  setAdminAuth: (token: string, admin: AdminAuthUser) => void;
  clearAdminAuth: () => void;
  hydrate: () => void;
};

export const useAdminAuthStore = create<AdminAuthStore>()((set) => ({
  token: null,
  admin: null,

  setAdminAuth: (token, admin) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ocs-admin-token", JSON.stringify(token));
      localStorage.setItem("ocs-admin-user", JSON.stringify(admin));
    }
    set({ token, admin });
  },

  clearAdminAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ocs-admin-token");
      localStorage.removeItem("ocs-admin-user");
    }
    set({ token: null, admin: null });
  },

  hydrate: () => {
    if (typeof window === "undefined") return;
    try {
      const rawToken = localStorage.getItem("ocs-admin-token");
      const rawAdmin = localStorage.getItem("ocs-admin-user");
      if (rawToken && rawAdmin) {
        set({
          token: JSON.parse(rawToken) as string,
          admin: JSON.parse(rawAdmin) as AdminAuthUser,
        });
      }
    } catch {
      // ignore corrupt storage
    }
  },
}));
