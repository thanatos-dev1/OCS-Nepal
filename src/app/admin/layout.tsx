"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminNav from "@/components/admin-portal/AdminNav";
import { useAdminAuthStore } from "@/stores/adminAuthStore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, hydrate } = useAdminAuthStore();

  useEffect(() => {
    hydrate();
  }, []);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoginPage && !admin) {
      router.replace("/admin/login");
    }
  }, [admin, isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;
  if (!admin) return null;

  return (
    <div className="flex min-h-screen bg-bg">
      <AdminNav />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
