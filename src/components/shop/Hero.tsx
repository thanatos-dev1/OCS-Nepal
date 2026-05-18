import Link from "next/link";
import { ArrowRight, BadgeCheck, ShieldCheck, Truck } from "lucide-react";
import HeroImageSwiper from "./HeroImageSwiper";
import { getHeroContent } from "@/lib/api/heroContent";

// Hardcoded fallback used when the owner hasn't customized the hero yet.
// Mirrored in the admin form's placeholders so the owner sees the same copy
// they'd be replacing.
const DEFAULTS = {
  eyebrow: "Genuine Products · Nepal",
  headline1: "Build Your",
  headline2: "Dream PC",
  subtext: "Premium computer hardware and PC components — RAM, SSDs, keyboards, and more. All genuine, all warrantied.",
  primaryCtaLabel: "Shop Now",
  primaryCtaHref: "/products",
  secondaryCtaLabel: "Browse Categories",
  secondaryCtaHref: "/categories",
};

export default async function Hero() {
  const content = (await getHeroContent().catch(() => null)) ?? DEFAULTS;
  // Per-field fallback so a partially-filled record doesn't blank out the UI.
  const c = {
    eyebrow: content.eyebrow || DEFAULTS.eyebrow,
    headline1: content.headline1 || DEFAULTS.headline1,
    headline2: content.headline2 || DEFAULTS.headline2,
    subtext: content.subtext || DEFAULTS.subtext,
    primaryCtaLabel: content.primaryCtaLabel || DEFAULTS.primaryCtaLabel,
    primaryCtaHref: content.primaryCtaHref || DEFAULTS.primaryCtaHref,
    secondaryCtaLabel: content.secondaryCtaLabel || DEFAULTS.secondaryCtaLabel,
    secondaryCtaHref: content.secondaryCtaHref || DEFAULTS.secondaryCtaHref,
  };

  return (
    <section className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left — copy */}
          <div className="flex-1">
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase text-accent bg-accent/10 rounded-full mb-6">
              {c.eyebrow}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              {c.headline1}
              <br />
              <span className="text-accent">{c.headline2}</span>
            </h1>
            <p className="mt-6 text-lg text-primary-light leading-relaxed max-w-xl">
              {c.subtext}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href={c.primaryCtaHref}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover active:bg-accent-active text-white font-semibold rounded-md transition-colors"
              >
                {c.primaryCtaLabel} <ArrowRight size={16} />
              </Link>
              <Link
                href={c.secondaryCtaHref}
                className="inline-flex items-center justify-center px-6 py-3 border border-white/30 hover:border-white/60 text-white font-semibold rounded-md transition-colors"
              >
                {c.secondaryCtaLabel}
              </Link>
            </div>
          </div>

          {/* Right — image swiper (hidden when no slides) */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0">
            <HeroImageSwiper />
          </div>
        </div>
      </div>

      {/* Trust bar */}
      <div className="border-t border-white/10 bg-primary-hover">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-sm text-primary-light">
            <div className="flex items-center gap-2">
              <BadgeCheck size={16} className="text-accent" />
              <span>100% Genuine Products</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-accent" />
              <span>Official Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-accent" />
              <span>Delivery Across Nepal</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
