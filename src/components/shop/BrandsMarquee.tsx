"use client";

import Link from "next/link";

type Brand = { id: string | number; name: string };

export default function BrandsMarquee({ brands }: { brands: Brand[] }) {
  const doubled = [...brands, ...brands];

  return (
    <div className="overflow-hidden">
      <div className="flex animate-marquee">
        {doubled.map((brand, i) => (
          <Link
            key={`${brand.id}-${i}`}
            href={`/products?brand=${brand.id}`}
            className="mx-2 shrink-0 px-3 py-1.5 text-xs font-semibold tracking-wide text-text-muted bg-bg border border-border rounded-md hover:border-border-strong hover:text-text transition-colors"
          >
            {brand.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
