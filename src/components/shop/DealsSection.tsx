import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import { getOffers } from "@/lib/api/offers";

export default async function DealsSection() {
  const offers = await getOffers().catch(() => []);
  if (offers.length === 0) return null;

  const products = offers.map((offer) => ({
    ...offer.product,
    salePrice: offer.salePrice,
    badge: offer.label ?? offer.product.badge,
  }));

  return (
    <section className="py-16 bg-error-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-error/10 rounded-lg">
              <Tag size={20} className="text-error" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text">Deals & Offers</h2>
              <p className="text-sm text-text-muted mt-1">Limited time discounts</p>
            </div>
          </div>
          <Link
            href="/products?deals=true"
            className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1"
          >
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
