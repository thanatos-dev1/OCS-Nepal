"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCategoriesQuery } from "@/hooks/useCategories";
import type { Category } from "@/lib/api/types";

function CategoryDropdown({
  parent,
  children,
  active,
}: {
  parent: Category;
  children: Category[];
  active: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "shrink-0 flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
          active ? "bg-white text-accent" : "text-white hover:bg-white/20",
        )}
      >
        {parent.name}
        <ChevronDown size={13} className={cn("transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 min-w-44 bg-white border border-border rounded-xl shadow-lg py-1.5 z-modal">
          <Link
            href={`/categories/${parent.slug}`}
            onClick={() => setOpen(false)}
            className={cn(
              "block px-4 py-2 text-sm transition-colors",
              pathname === `/categories/${parent.slug}`
                ? "text-primary font-medium bg-bg-subtle"
                : "text-text hover:bg-bg-subtle hover:text-primary",
            )}
          >
            All {parent.name}
          </Link>
          <div className="h-px bg-border mx-3 my-1" />
          {children.map((child) => (
            <Link
              key={child.id}
              href={`/categories/${child.slug}`}
              onClick={() => setOpen(false)}
              className={cn(
                "block px-4 py-2 text-sm transition-colors",
                pathname === `/categories/${child.slug}`
                  ? "text-primary font-medium bg-bg-subtle"
                  : "text-text-muted hover:bg-bg-subtle hover:text-primary",
              )}
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryBar() {
  const pathname = usePathname();
  const { data: categories, isLoading } = useCategoriesQuery();

  const visible = categories?.filter((cat) => cat.showInBar) ?? [];
  const parents = visible.filter((c) => !c.parentId);
  const childrenMap = visible.reduce<Record<string, Category[]>>((acc, c) => {
    if (c.parentId) {
      acc[c.parentId] ??= [];
      acc[c.parentId].push(c);
    }
    return acc;
  }, {});

  if (!isLoading && visible.length === 0) return null;

  return (
    <div className="sticky top-16 z-sticky bg-accent shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-1 overflow-x-auto scrollbar-none py-2">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="shrink-0 h-7 w-20 rounded-md bg-white/20 animate-pulse" />
              ))
            : parents.map((cat) => {
                const kids = childrenMap[cat.id] ?? [];
                const href = `/categories/${cat.slug}`;
                const active = pathname === href || pathname.startsWith(href + "/");

                if (kids.length > 0) {
                  return (
                    <CategoryDropdown key={cat.id} parent={cat} children={kids} active={active} />
                  );
                }

                return (
                  <Link
                    key={cat.id}
                    href={href}
                    className={cn(
                      "shrink-0 px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                      active ? "bg-white text-accent" : "text-white hover:bg-white/20",
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
