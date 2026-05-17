import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCarousel from "@/components/shop/ProductCarousel";
import { getFeaturedProducts } from "@/lib/api/products";

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts().catch(() => []);

  if (products.length === 0) return null;

  return (
    <section className="bg-bg-subtle py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-text">Featured Products</h2>
          <Link href="/products" className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <ProductCarousel products={products} />
      </div>
    </section>
  );
}
