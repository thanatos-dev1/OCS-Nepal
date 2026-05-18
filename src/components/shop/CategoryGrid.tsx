import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getCategories } from "@/lib/api/categories";

const MAX_TILES = 6;

export default async function CategoryGrid() {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  try {
    categories = await getCategories();
  } catch {
    return null;
  }

  // Top-level only — sub-categories live inside the mega-menu, not here.
  const topLevel = categories.filter((c) => !c.parentId).slice(0, MAX_TILES);
  if (topLevel.length === 0) return null;

  return (
    <section className="bg-bg-subtle py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-text">Shop by Category</h2>
          <Link href="/categories" className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {topLevel.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group relative aspect-4/3 rounded-xl overflow-hidden bg-primary shadow-sm hover:shadow-lg transition-shadow"
            >
              {cat.coverImageUrl ? (
                <Image
                  src={cat.coverImageUrl}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 30vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl opacity-80">{cat.icon || "📦"}</span>
                </div>
              )}
              {/* Gradient + label overlay (always on, sits above the photo) */}
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 text-white">
                <p className="text-base sm:text-lg font-semibold">{cat.name}</p>
                <p className="text-xs sm:text-sm opacity-80 mt-0.5">
                  {cat.productCount} {cat.productCount === 1 ? "item" : "items"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
