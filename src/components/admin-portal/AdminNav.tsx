"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  RotateCcw,
  UserCog,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAdminAuthStore } from "@/stores/adminAuthStore";
import type { AdminRole } from "@/lib/api/types";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: AdminRole[];
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["super_admin", "manager"],
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
    roles: ["super_admin", "manager", "staff"],
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
    roles: ["super_admin", "manager", "staff"],
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
    roles: ["super_admin", "manager"],
  },
  {
    label: "Coupons",
    href: "/admin/coupons",
    icon: Tag,
    roles: ["super_admin", "manager"],
  },
  {
    label: "Returns",
    href: "/admin/returns",
    icon: RotateCcw,
    roles: ["super_admin", "manager", "staff"],
  },
  {
    label: "Admin Mgmt",
    href: "/admin/admins",
    icon: UserCog,
    roles: ["super_admin"],
  },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, clearAdminAuth } = useAdminAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const role = admin?.role ?? "staff";
  const visible = NAV_ITEMS.filter((item) => item.roles.includes(role));

  function handleLogout() {
    clearAdminAuth();
    router.replace("/admin/login");
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-primary text-white sticky top-0 transition-all duration-200",
        collapsed ? "w-16" : "w-56",
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-accent" />
            <span className="font-bold text-sm">OCS Admin</span>
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className={cn(
            "p-1 rounded-md hover:bg-white/10 transition-colors",
            collapsed && "mx-auto",
          )}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 py-2">
          <span className="text-xs text-white/50 font-medium uppercase tracking-wide">
            {role.replace("_", " ")}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {visible.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10",
                collapsed && "justify-center px-0",
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {/* Store link + logout */}
      <div className="border-t border-white/10 py-2">
        <Link
          href="/"
          title={collapsed ? "Back to Store" : undefined}
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors",
            collapsed && "justify-center px-0",
          )}
        >
          <ChevronLeft size={18} className="shrink-0" />
          {!collapsed && "Back to Store"}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Sign Out" : undefined}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-error hover:bg-white/10 transition-colors",
            collapsed && "justify-center px-0",
          )}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && "Sign Out"}
        </button>
      </div>
    </aside>
  );
}
