export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import ProductCarousel from "@/components/shop/ProductCarousel";
import { getCategories } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";
import type { Category } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat: catParam } = await searchParams;
  const categories = await getCategories().catch(() => []);

  const topLevel = categories
    .filter((c) => !c.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Index children by parentId once so the right pane lookup is O(1).
  const childrenByParent = new Map<string, Category[]>();
  for (const c of categories) {
    if (c.parentId) {
      const list = childrenByParent.get(c.parentId);
      if (list) list.push(c);
      else childrenByParent.set(c.parentId, [c]);
    }
  }
  for (const list of childrenByParent.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  // Resolve the active category: query param first, else fall back to first
  // top-level. Server-rendered so deep-linking and refresh just work.
  const active =
    topLevel.find((c) => c.slug === catParam) ?? topLevel[0] ?? null;

  // Fetch products for the active category. The backend's category filter now
  // rolls up sub-categories for top-level slugs, so this naturally pulls in
  // SSDs/HDDs/NVMe when "Storage" is active.
  const products = active
    ? await getProducts({ category: active.slug }).catch(() => [])
    : [];

  const activeChildren = active ? childrenByParent.get(active.id) ?? [] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} />
        <span className="text-text font-medium">Categories</span>
      </nav>

      <h1 className="text-2xl font-bold text-text mb-1">All Categories</h1>
      <p className="text-text-muted text-sm mb-6">Browse our full range of genuine PC components</p>

      {topLevel.length === 0 || !active ? (
        <p className="text-sm text-text-muted">No categories yet.</p>
      ) : (
        <>
          {/* Mobile: horizontal chip strip */}
          <div className="md:hidden -mx-4 px-4 mb-6 overflow-x-auto">
            <div className="flex gap-2 w-max">
              {topLevel.map((c) => (
                <Link
                  key={c.id}
                  href={`/categories?cat=${c.slug}`}
                  scroll={false}
                  className={cn(
                    "shrink-0 px-3 py-1.5 text-sm font-medium rounded-full transition-colors",
                    c.id === active.id
                      ? "bg-primary text-white"
                      : "bg-bg-subtle text-text hover:bg-primary-light hover:text-primary",
                  )}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="md:flex md:gap-8">
            {/* Desktop: sticky sidebar */}
            <aside className="hidden md:block md:w-56 shrink-0">
              <nav className="sticky top-24 flex flex-col gap-1">
                {topLevel.map((c) => {
                  const isActive = c.id === active.id;
                  return (
                    <Link
                      key={c.id}
                      href={`/categories?cat=${c.slug}`}
                      scroll={false}
                      className={cn(
                        "group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-white"
                          : "text-text-muted hover:bg-bg-subtle hover:text-text",
                      )}
                    >
                      <span className="truncate">{c.name}</span>
                      <span
                        className={cn(
                          "text-xs ml-2 shrink-0",
                          isActive ? "text-white/80" : "text-text-disabled",
                        )}
                      >
                        {c.productCount}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Cover banner */}
              <Link
                href={`/categories/${active.slug}`}
                className="group relative block aspect-3/1 sm:aspect-4/1 rounded-xl overflow-hidden bg-primary mb-6"
              >
                {active.coverImageUrl ? (
                  <Image
                    src={active.coverImageUrl}
                    alt={active.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 70vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl opacity-80">{active.icon || "📦"}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white">
                  <h2 className="text-xl sm:text-2xl font-bold">{active.name}</h2>
                  {active.description && (
                    <p className="text-sm opacity-90 mt-1 max-w-xl line-clamp-2">{active.description}</p>
                  )}
                  <p className="text-xs opacity-80 mt-2">
                    {active.productCount} {active.productCount === 1 ? "product" : "products"}
                  </p>
                </div>
              </Link>

              {/* Sub-categories */}
              {activeChildren.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
                    Browse sub-categories
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {activeChildren.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/categories/${sub.slug}`}
                        className="group flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-bg-card hover:border-primary hover:shadow-card transition-all"
                      >
                        <span className="text-sm font-medium text-text group-hover:text-primary transition-colors truncate">
                          {sub.name}
                        </span>
                        <span className="text-xs text-text-disabled shrink-0 ml-2">
                          {sub.productCount}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Featured products */}
              {products.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide">
                      Featured in {active.name}
                    </h3>
                    <Link
                      href={`/categories/${active.slug}`}
                      className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1"
                    >
                      View all <ChevronRight size={14} />
                    </Link>
                  </div>
                  <ProductCarousel products={products.slice(0, 8)} />
                </div>
              ) : (
                <p className="text-sm text-text-muted">No products yet in this category.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
