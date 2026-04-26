"use client";

import Link from "next/link";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import ProductCard from "@/components/shop/ProductCard";

export default function RecentlyViewed() {
  const products = useRecentlyViewed();
  if (products.length === 0) return null;

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text">Recently Viewed</h2>
            <p className="text-sm text-text-muted mt-1">Pick up where you left off</p>
          </div>
          <Link href="/products" className="text-sm font-medium text-primary hover:text-primary-hover">
            Browse all
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
