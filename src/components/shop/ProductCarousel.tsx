'use client';

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import type { Product } from "@/lib/api/types";

interface Props {
  products: Product[];
}

// ProductCarousel renders a horizontal scroll-snap row of ProductCards with
// left/right arrow controls. Replaces the per-section 4-up grid that used to
// wrap into two lines on common viewport widths.
//
// Slide width is responsive via Tailwind classes on the slide wrapper:
//   mobile  → 80% (peek next card)
//   sm:     → 50%
//   md:     → 33%
//   lg+:    → 25% (matches the previous 4-up grid)
export default function ProductCarousel({ products }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const refresh = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    refresh();
    emblaApi.on("select", refresh);
    emblaApi.on("reInit", refresh);
    return () => {
      emblaApi.off("select", refresh);
      emblaApi.off("reInit", refresh);
    };
  }, [emblaApi, refresh]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex -ml-5">
          {products.map((product) => (
            <div
              key={product.id}
              className="shrink-0 grow-0 basis-[80%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 pl-5"
            >
              <div className="block w-full [&>a]:block [&>a]:w-full">
                <ProductCard product={product} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrows — hidden on touch-first widths, and hidden entirely when
          there's nothing to scroll in that direction. */}
      {canPrev && (
        <button
          type="button"
          onClick={scrollPrev}
          aria-label="Previous"
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-bg shadow-card border border-border text-text hover:text-primary hover:border-primary transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
      )}
      {canNext && (
        <button
          type="button"
          onClick={scrollNext}
          aria-label="Next"
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-bg shadow-card border border-border text-text hover:text-primary hover:border-primary transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}
