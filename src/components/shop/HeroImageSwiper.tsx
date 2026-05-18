"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { useHeroSlidesQuery } from "@/hooks/useHeroSlides";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

export default function HeroImageSwiper() {
  const { data: slides = [], isLoading } = useHeroSlidesQuery();

  if (isLoading) {
    return <div className="w-full aspect-4/5 rounded-xl bg-white/5 animate-pulse" />;
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-hidden rounded-xl shadow-lg">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={slides.length > 1}
        pagination={{ clickable: true }}
        className="aspect-4/5 [--swiper-pagination-color:var(--color-accent)] [--swiper-pagination-bullet-inactive-color:#ffffff] [--swiper-pagination-bullet-inactive-opacity:0.5]"
      >
        {slides.map((slide) => {
          const content = (
            <div className="relative w-full h-full">
              <Image
                src={slide.imageUrl}
                alt={slide.caption || "Hero slide"}
                fill
                sizes="(max-width: 1024px) 100vw, 24rem"
                className="object-cover"
                priority
              />
              {slide.caption && (
                <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-linear-to-t from-black/70 to-transparent text-white text-sm font-medium">
                  {slide.caption}
                </div>
              )}
            </div>
          );
          return (
            <SwiperSlide key={slide.id}>
              {slide.linkUrl ? (
                <Link href={slide.linkUrl} className="block w-full h-full">
                  {content}
                </Link>
              ) : (
                content
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
