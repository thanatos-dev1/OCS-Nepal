'use client';

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s._isInitialized);
  const router = useRouter();

  if (!isInitialized) return null;

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
