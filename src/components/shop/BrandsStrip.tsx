import Link from "next/link";
import { getBrands } from "@/lib/api/brands";

export default async function BrandsStrip() {
  const brands = await getBrands();

  return (
    <section className="bg-bg-subtle border-y border-border py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-disabled text-center mb-6">
          Brands We Carry
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/products?brand=${brand.id}`}
              className="px-3 py-1.5 text-xs font-semibold tracking-wide text-text-muted bg-bg border border-border rounded-md hover:border-border-strong hover:text-text transition-colors"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
