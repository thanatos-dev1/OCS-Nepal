import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import { getCategoryBySlug } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [category, products] = await Promise.all([
    getCategoryBySlug(slug),
    getProducts({ category: slug }),
  ]);

  if (!category) notFound();

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
          <p className="text-sm text-text-muted mt-0.5">{products.length} products</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-5xl mb-4">📦</span>
          <p className="text-lg font-semibold text-text">No products yet</p>
          <p className="text-sm text-text-muted mt-1">Check back soon</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} showCategory={false} />
          ))}
        </div>
      )}
    </div>
  );
}
