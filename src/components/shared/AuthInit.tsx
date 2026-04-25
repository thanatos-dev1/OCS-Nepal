"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

export default function AuthInit() {
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return null;
}
