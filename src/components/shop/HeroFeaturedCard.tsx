"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getFeaturedProducts } from "@/lib/api/products";
import { queryKeys } from "@/lib/queries";

export default function HeroFeaturedCard() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: queryKeys.featuredProducts,
    queryFn: getFeaturedProducts,
  });

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (products.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % products.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [products.length]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="w-56 h-56 rounded-full bg-white/5 animate-pulse" />
        <div className="w-40 h-4 rounded bg-white/10 animate-pulse" />
        <div className="w-24 h-4 rounded bg-white/10 animate-pulse" />
      </div>
    );
  }

  if (products.length === 0) return null;

  const product = products[index];
  const imageUrl = product.images?.[0]?.url;

  return (
    <div className="flex flex-col items-center text-center gap-6">
      {/* Image with radial glow */}
      <div className="relative flex items-center justify-center w-64 h-64">
        <div className="absolute inset-0 rounded-full bg-accent/10 blur-3xl" />
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={product.name}
            className="relative w-full h-full object-contain drop-shadow-2xl"
          />
        ) : (
          <span className="relative text-8xl select-none">🖥️</span>
        )}
      </div>

      {/* Info */}
      <div>
        {product.category && (
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            {product.category}
          </span>
        )}
        <h3 className="mt-2 text-xl font-bold text-white leading-snug line-clamp-2">
          {product.name}
        </h3>
        <p className="mt-1 text-2xl font-bold text-white">
          NPR {product.price.toLocaleString("en-NP")}
        </p>
        <Link
          href={`/products/${product.slug}`}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-accent hover:bg-accent-hover active:bg-accent-active rounded-md transition-colors"
        >
          View Product <ArrowRight size={14} />
        </Link>
      </div>

      {/* Arrows + dots */}
      {products.length > 1 && (
        <div className="flex gap-1.5">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-accent" : "w-1.5 bg-white/30"
              }`}
              aria-label={`Go to product ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
