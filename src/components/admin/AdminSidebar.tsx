'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Tag, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { logout } from "@/lib/api/auth";

const nav = [
  { label: "Products", href: "/dashboard/products", icon: LayoutGrid },
  { label: "Categories", href: "/dashboard/categories", icon: Tag },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clear } = useAuthStore();

  async function handleLogout() {
    try { await logout(); } catch { /* ignore */ }
    clear();
    router.push("/account/login");

  }

  return (
    <aside className="w-56 shrink-0 flex flex-col border-r border-border bg-bg-subtle min-h-screen">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-border">
        <span className="text-sm font-bold text-primary tracking-wide">OCS Nepal</span>
        <span className="block text-xs text-text-muted mt-0.5">Owner Dashboard</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {nav.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-primary text-white"
                : "text-text-muted hover:bg-primary-light hover:text-primary"
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <p className="text-xs text-text-muted truncate mb-3">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-error transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
