'use client';

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, X } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import SpecFilterSidebar from "@/components/shop/SpecFilterSidebar";
import { useCategoriesQuery } from "@/hooks/useCategories";
import { useProductsQuery } from "@/hooks/useProducts";
import { useCategorySpecDefinitionsQuery } from "@/hooks/useSpecDefinitions";

interface Props {
  slug: string;
}

// CategoryView is client-rendered so spec filters can read/write the URL and
// React Query can refetch on filter change. Filter state lives in
// ?<key>(_min|_max)= search params, which means category links are shareable
// with their filters intact.
export default function CategoryView({ slug }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pull all non-reserved search params into the filter map. The keys match
  // the backend's query format 1:1 (ram_gb_min, panel, etc.), so this can be
  // passed straight to getProducts({ specFilters }).
  const filters = useMemo(() => {
    const out: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (value) out[key] = value;
    });
    return out;
  }, [searchParams]);

  const setFilters = useCallback(
    (next: Record<string, string>) => {
      const params = new URLSearchParams();
      Object.entries(next).forEach(([k, v]) => {
        if (v !== "" && v !== undefined && v !== null) params.set(k, v);
      });
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    },
    [router],
  );

  const { data: categories = [], isLoading: catsLoading } = useCategoriesQuery();
  const category = categories.find((c) => c.slug === slug);

  const { data: definitions = [] } = useCategorySpecDefinitionsQuery(slug);

  const productsParams = useMemo(
    () => ({ category: slug, specFilters: filters }),
    [slug, filters],
  );
  const { data: products = [], isLoading: productsLoading } = useProductsQuery(undefined, productsParams);

  if (catsLoading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-sm text-text-muted">Loading…</div>;
  }
  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-error">Category not found.</p>
      </div>
    );
  }

  const activeFilterCount = Object.values(filters).filter((v) => v !== "").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="flex items-center gap-1.5 text-sm text-text-muted mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} />
        <Link href="/categories" className="hover:text-primary transition-colors">Categories</Link>
        <ChevronRight size={14} />
        <span className="text-text font-medium">{category.name}</span>
      </nav>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center text-3xl">
          {category.icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text">{category.name}</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {productsLoading ? "Loading products…" : `${products.length} products`}
            {activeFilterCount > 0 && ` · ${activeFilterCount} filter${activeFilterCount === 1 ? "" : "s"} active`}
          </p>
        </div>
      </div>

      <div className="flex gap-8">
        <SpecFilterSidebar
          definitions={definitions}
          filters={filters}
          onChange={setFilters}
        />

        <div className="flex-1 min-w-0">
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-bg-subtle animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="text-5xl mb-4">📦</span>
              <p className="text-lg font-semibold text-text">
                {activeFilterCount > 0 ? "No products match your filters" : "No products yet"}
              </p>
              <p className="text-sm text-text-muted mt-1">
                {activeFilterCount > 0 ? "Try loosening or clearing the filters." : "Check back soon"}
              </p>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilters({})}
                  className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <X size={14} /> Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} showCategory={false} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
