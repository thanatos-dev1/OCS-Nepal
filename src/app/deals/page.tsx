export const dynamic = "force-dynamic";

import Link from "next/link";
import { ChevronRight, Tag } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import { getProducts } from "@/lib/api/products";

export default async function DealsPage() {
  const products = await getProducts().catch(() => []);
  const deals = products.filter((p) => p.badge);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="flex items-center gap-1.5 text-sm text-text-muted mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} />
        <span className="text-text font-medium">Deals</span>
      </nav>

      <div className="rounded-2xl bg-primary px-8 py-10 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tag size={18} className="text-accent" />
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">Limited Stock</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Current Deals</h1>
          <p className="text-primary-light text-sm mt-1">
            Handpicked products — genuine, warrantied, and ready to ship.
          </p>
        </div>
        <Link
          href="/products"
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-md transition-colors"
        >
          Browse All Products
        </Link>
      </div>

      {deals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-5xl mb-4">🏷️</span>
          <p className="text-lg font-semibold text-text">No deals right now</p>
          <p className="text-sm text-text-muted mt-1">Check back soon for new offers</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {deals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
