"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCategoriesQuery } from "@/hooks/useCategories";

export default function CategoryBar() {
  const pathname = usePathname();
  const { data: categories, isLoading } = useCategoriesQuery();

  const visible = categories?.filter((cat) => cat.showInBar) ?? [];
  if (!isLoading && visible.length === 0) return null;

  return (
    <div className="sticky top-16 z-sticky bg-accent shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-1 overflow-x-auto scrollbar-none py-2">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="shrink-0 h-7 w-20 rounded-md bg-white/20 animate-pulse"
                />
              ))
            : visible.map((cat) => {
                const href = `/categories/${cat.slug}`;
                const active =
                  pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={cat.id}
                    href={href}
                    className={cn(
                      "shrink-0 px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                      active
                        ? "bg-white text-accent"
                        : "text-white hover:bg-white/20",
                    )}
                  >
                    {cat.name}
                  </Link>
                );
              })}
        </div>
      </div>
    </div>
  );
}
