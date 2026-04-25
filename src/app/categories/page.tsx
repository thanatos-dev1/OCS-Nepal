export const dynamic = "force-dynamic";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCategories } from "@/lib/api/categories";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-text-muted mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} />
        <span className="text-text font-medium">Categories</span>
      </nav>

      <h1 className="text-2xl font-bold text-text mb-2">All Categories</h1>
      <p className="text-text-muted text-sm mb-8">Browse our full range of genuine PC components</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categories/${cat.slug}`}
            className="group flex items-center gap-5 p-5 bg-bg-card border border-border rounded-xl hover:border-primary hover:shadow-card transition-all"
          >
            <div className="w-14 h-14 rounded-lg bg-bg-subtle flex items-center justify-center text-3xl shrink-0 group-hover:bg-primary-light transition-colors">
              {cat.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-text group-hover:text-primary transition-colors">
                {cat.name}
              </h2>
              <p className="text-sm text-text-muted mt-0.5">{cat.productCount} products</p>
            </div>
            <ChevronRight size={16} className="text-text-disabled group-hover:text-primary transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
