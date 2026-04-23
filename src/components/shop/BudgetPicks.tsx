import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import { getBudgetPicks } from "@/lib/api/products";

const MAX_PRICE = 5000;

export default async function BudgetPicks() {
  const products = await getBudgetPicks(MAX_PRICE).catch(() => []);
  if (products.length === 0) return null;

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success-light rounded-lg">
              <Wallet size={20} className="text-success" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text">
                Under NPR {MAX_PRICE.toLocaleString("en-NP")}
              </h2>
              <p className="text-sm text-text-muted mt-1">Great picks on a budget</p>
            </div>
          </div>
          <Link
            href={`/products?maxPrice=${MAX_PRICE}`}
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
