"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useProductsQuery } from "@/hooks/useProducts";
import type { Product } from "@/lib/api/types";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/shop/ProductCard";

const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export default function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: products = initialProducts } = useProductsQuery(initialProducts);

  const query = searchParams.get("q") || "";
  const catParam = searchParams.get("cat") || "";
  const brandParam = searchParams.get("brand") || "";
  const minPrice = searchParams.get("min") || "";
  const maxPrice = searchParams.get("max") || "";
  const sort = searchParams.get("sort") || "default";

  const selectedCategories = catParam ? catParam.split(",") : [];
  const selectedBrandIds = brandParam ? brandParam.split(",") : [];

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [initialProducts]
  );
  const brands = useMemo(
    () => [...new Set(products.map((p) => p.brand).filter((b): b is string => !!b))].sort(),
    [initialProducts]
  );

  function setParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }
    router.replace(`/products?${params.toString()}`, { scroll: false });
  }

  const toggleCategory = (cat: string) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    setParams({ cat: next.join(",") || null });
  };

  const toggleBrand = (brand: string) => {
    const next = selectedBrandIds.includes(brand)
      ? selectedBrandIds.filter((b) => b !== brand)
      : [...selectedBrandIds, brand];
    setParams({ brand: next.join(",") || null });
  };

  const filtered = useMemo(() => {
    let result = products;
    if (query) result = result.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
    if (selectedCategories.length > 0) result = result.filter((p) => selectedCategories.includes(p.category));
    if (selectedBrandIds.length > 0) result = result.filter((p) => p.brand && selectedBrandIds.includes(p.brand.toLowerCase()));
    if (minPrice) result = result.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) result = result.filter((p) => p.price <= Number(maxPrice));
    if (sort === "price_asc") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") result = [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [products, query, catParam, brandParam, minPrice, maxPrice, sort]);

  const hasActiveFilters = !!(catParam || brandParam || minPrice || maxPrice);

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    router.replace(`/products?${params.toString()}`, { scroll: false });
  };

  const Filters = (
    <div className="space-y-6">
      {categories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text mb-3">Category</h3>
          <div className="space-y-2">
            {categories.map((cat) => (
              <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                />
                <span className="text-sm text-text-muted group-hover:text-text transition-colors">{cat}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {brands.length > 0 && (
        <div className="pt-6 border-t border-border">
          <h3 className="text-sm font-semibold text-text mb-3">Brand</h3>
          <div className="space-y-2">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedBrandIds.includes(brand.toLowerCase())}
                  onChange={() => toggleBrand(brand.toLowerCase())}
                  className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                />
                <span className="text-sm text-text-muted group-hover:text-text transition-colors">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-border">
        <h3 className="text-sm font-semibold text-text mb-3">Price Range (NPR)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setParams({ min: e.target.value || null })}
            className="w-full h-9 px-3 text-sm bg-bg border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          <span className="text-text-muted text-sm shrink-0">—</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setParams({ max: e.target.value || null })}
            className="w-full h-9 px-3 text-sm bg-bg border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1.5 text-sm text-error hover:text-error/80 transition-colors"
        >
          <X size={14} /> Clear filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">
            {query ? `Results for "${query}"` : "All Products"}
          </h1>
          <p className="text-sm text-text-muted mt-1">{filtered.length} products</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => setParams({ sort: e.target.value === "default" ? null : e.target.value })}
            className="h-9 px-3 text-sm bg-bg border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 h-9 px-3 text-sm font-medium border border-border rounded-md hover:bg-bg-subtle transition-colors"
          >
            <SlidersHorizontal size={15} /> Filters
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-accent" />}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm font-semibold text-text">Filters</span>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-error hover:text-error/80">
                  Clear all
                </button>
              )}
            </div>
            {Filters}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-lg font-semibold text-text">No products found</p>
              <p className="text-sm text-text-muted mt-1">Try adjusting your filters</p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-4 text-sm text-primary hover:text-primary-hover">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <>
          <div
            className="fixed inset-0 z-overlay bg-black/30 lg:hidden"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-modal w-72 bg-bg shadow-lg p-6 overflow-y-auto lg:hidden">
            <div className="flex items-center justify-between mb-6">
              <span className="font-semibold text-text">Filters</span>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-1 text-text-muted hover:text-text transition-colors">
                <X size={18} />
              </button>
            </div>
            {Filters}
            <div className="mt-8">
              <Button variant="primary" size="md" className="w-full" onClick={() => setMobileFiltersOpen(false)}>
                Show {filtered.length} products
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
