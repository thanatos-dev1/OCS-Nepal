import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategories } from "@/lib/api/categories";

export default async function CategoryGrid() {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  try {
    categories = await getCategories();
  } catch {
    return null;
  }

  if (categories.length === 0) return null;

  return (
    <section className="bg-bg-subtle py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-text">Shop by Category</h2>
        <Link href="/categories" className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1">
          View all <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categories/${cat.slug}`}
            className="group flex flex-col items-center gap-3 p-4 bg-bg-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all text-center"
          >
            <span className="text-3xl">{cat.icon}</span>
            <div>
              <p className="text-sm font-semibold text-text group-hover:text-primary transition-colors">
                {cat.name}
              </p>
              <p className="text-xs text-text-muted mt-0.5">{cat.productCount} items</p>
            </div>
          </Link>
        ))}
      </div>
      </div>
    </section>
  );
}
