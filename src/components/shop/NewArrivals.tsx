import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import { getNewArrivals } from "@/lib/api/products";

export default async function NewArrivals() {
  const products = await getNewArrivals().catch(() => []);
  if (products.length === 0) return null;

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text">New Arrivals</h2>
            <p className="text-sm text-text-muted mt-1">Fresh stock, just landed</p>
          </div>
          <Link href="/products?sort=newest" className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
