"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCategoriesQuery, useCategoryBrandSeriesQuery } from "@/hooks/useCategories";
import type { Category } from "@/lib/api/types";

const HOVER_OPEN_DELAY = 80;
const HOVER_CLOSE_DELAY = 150;

function CategoryMegaMenu({
  category,
  subCategories,
  active,
}: {
  category: Category;
  subCategories: Category[];
  active: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [panelTop, setPanelTop] = useState(0);
  // Viewport X-coordinate of the trigger chip's horizontal center, used to
  // place the speech-bubble triangle directly under the chip that opened the
  // panel.
  const [triggerCenterX, setTriggerCenterX] = useState(0);
  const triggerRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const { data: groups, isLoading } = useCategoryBrandSeriesQuery(open ? category.slug : null);

  useEffect(() => {
    if (!open) return;
    function measure() {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPanelTop(rect.bottom + 8);
      setTriggerCenterX(rect.left + rect.width / 2);
    }
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open]);

  function scheduleOpen() {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    if (open) return;
    openTimer.current = window.setTimeout(() => setOpen(true), HOVER_OPEN_DELAY);
  }

  function scheduleClose() {
    if (openTimer.current) {
      window.clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    closeTimer.current = window.setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY);
  }

  useEffect(() => {
    return () => {
      if (openTimer.current) window.clearTimeout(openTimer.current);
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <div
      ref={triggerRef}
      className="relative"
      onMouseEnter={scheduleOpen}
      onMouseLeave={scheduleClose}
      onFocus={scheduleOpen}
      onBlur={scheduleClose}
    >
      <button
        type="button"
        onClick={() => {
          if (openTimer.current) {
            window.clearTimeout(openTimer.current);
            openTimer.current = null;
          }
          if (closeTimer.current) {
            window.clearTimeout(closeTimer.current);
            closeTimer.current = null;
          }
          setOpen((v) => !v);
        }}
        className={cn(
          "shrink-0 flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-default",
          active || open ? "bg-white text-accent" : "text-white hover:bg-white/20",
        )}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {category.name}
        <ChevronDown size={13} className={cn("transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          {/* Hover grace zone bridges the gap between trigger and panel */}
          <div className="absolute left-0 right-0 top-full h-2" />
          <div
            className="fixed left-0 right-0 z-modal px-4 sm:px-6 lg:px-8"
            style={{ top: panelTop }}
            onMouseEnter={scheduleOpen}
            onMouseLeave={scheduleClose}
          >
            {/* Speech-bubble triangle pointing up at the chip that opened
                this panel. Two stacked CSS triangles: the back one provides
                the border edge, the front one fills with white and overlaps
                the panel's top border by 1px so the seam disappears. */}
            <div
              aria-hidden="true"
              className="absolute pointer-events-none"
              style={{ left: triggerCenterX - 8, top: -8 }}
            >
              <div className="absolute w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-border" />
              <div className="absolute w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white" style={{ top: 1 }} />
            </div>
            <div className="max-w-7xl mx-auto bg-white border border-border rounded-xl shadow-xl p-6">
                {isLoading || !groups ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 w-16 rounded bg-bg-subtle animate-pulse" />
                        {Array.from({ length: 4 }).map((__, j) => (
                          <div key={j} className="h-3 w-20 rounded bg-bg-subtle animate-pulse" />
                        ))}
                      </div>
                    ))}
                  </div>
                ) : groups.length === 0 && subCategories.length === 0 ? (
                  <p className="text-sm text-text-muted">Nothing here yet.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-4">
                    {subCategories.length > 0 && (
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
                          Categories
                        </p>
                        <ul className="space-y-1.5">
                          {subCategories.map((sub) => (
                            <li key={sub.id}>
                              <Link
                                href={`/categories/${sub.slug}`}
                                onClick={() => setOpen(false)}
                                className="block text-sm text-text-muted hover:text-accent transition-colors truncate"
                              >
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {groups.map((group) => (
                      <div key={group.brandId} className="min-w-0">
                        <Link
                          href={`/categories/${category.slug}?brand=${group.brandSlug}`}
                          className="block text-sm font-semibold text-primary hover:text-accent transition-colors uppercase tracking-wide mb-2"
                          onClick={() => setOpen(false)}
                        >
                          {group.brandName}
                        </Link>
                        <ul className="space-y-1.5">
                          {group.series.map((s) => (
                            <li key={s.id}>
                              <Link
                                href={`/categories/${category.slug}?brand=${group.brandSlug}&series=${s.slug}`}
                                onClick={() => setOpen(false)}
                                className="block text-sm text-text-muted hover:text-accent transition-colors truncate"
                              >
                                {s.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-5 pt-4 border-t border-border">
                  <Link
                    href={`/categories/${category.slug}`}
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium text-accent hover:text-accent-hover"
                  >
                    Browse all {category.name} →
                  </Link>
                </div>
              </div>
            </div>
        </>
      )}
    </div>
  );
}

export default function CategoryBar() {
  const pathname = usePathname();
  const { data: categories, isLoading } = useCategoriesQuery();

  const all = categories ?? [];
  const parents = all.filter((c) => c.showInBar && !c.parentId);

  // Group sub-categories by their parent ID so each mega-menu can show its own.
  const childrenByParent = new Map<string, Category[]>();
  for (const c of all) {
    if (c.parentId) {
      const list = childrenByParent.get(c.parentId);
      if (list) list.push(c);
      else childrenByParent.set(c.parentId, [c]);
    }
  }

  if (!isLoading && parents.length === 0) return null;

  return (
    <div className="sticky top-16 z-sticky bg-accent shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-1 py-2">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="shrink-0 h-7 w-20 rounded-md bg-white/20 animate-pulse" />
              ))
            : parents.map((cat) => {
                const href = `/categories/${cat.slug}`;
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <CategoryMegaMenu
                    key={cat.id}
                    category={cat}
                    subCategories={childrenByParent.get(cat.id) ?? []}
                    active={active}
                  />
                );
              })}
        </div>
      </div>
    </div>
  );
}
