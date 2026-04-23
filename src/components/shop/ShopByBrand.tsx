import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getBrands } from "@/lib/api/brands";

export default async function ShopByBrand() {
  const brands = await getBrands().catch(() => []);
  if (brands.length === 0) return null;

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text">Shop by Brand</h2>
            <p className="text-sm text-text-muted mt-1">Browse products from top brands</p>
          </div>
          <Link href="/products" className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1">
            All products <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/products?brand=${brand.id}`}
              className="group flex items-center justify-center px-3 py-4 bg-bg-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all text-center"
            >
              <span className="text-sm font-semibold text-text-muted group-hover:text-primary transition-colors">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
