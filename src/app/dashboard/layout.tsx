'use client';

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, _hasHydrated } = useAuthStore();
  const router = useRouter();

  if (!_hasHydrated) return null;

  if (!user || user.role !== "owner") {
    router.replace("/account/login");
    return null;
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
