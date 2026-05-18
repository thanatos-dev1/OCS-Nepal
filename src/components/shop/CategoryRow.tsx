import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCarousel from "@/components/shop/ProductCarousel";
import { getProducts } from "@/lib/api/products";

interface Props {
  slug: string;
  title: string;
  // Optional sub-title shown under the heading (e.g. "Fresh stock of SSDs").
  subtitle?: string;
}

// One horizontal product row for a single category. Reuses ProductCarousel.
// Hides itself when the category has no products to avoid empty sections.
export default async function CategoryRow({ slug, title, subtitle }: Props) {
  const products = await getProducts({ category: slug }).catch(() => []);
  if (products.length === 0) return null;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text">{title}</h2>
            {subtitle && <p className="text-sm text-text-muted mt-1">{subtitle}</p>}
          </div>
          <Link
            href={`/categories/${slug}`}
            className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <ProductCarousel products={products.slice(0, 8)} />
      </div>
    </section>
  );
}
