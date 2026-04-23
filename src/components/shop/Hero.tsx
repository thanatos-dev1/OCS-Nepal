import Link from "next/link";
import { ArrowRight, BadgeCheck, ShieldCheck, Truck } from "lucide-react";
import HeroFeaturedCard from "./HeroFeaturedCard";

export default function Hero() {
  return (
    <section className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left — copy */}
          <div className="flex-1">
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase text-accent bg-accent/10 rounded-full mb-6">
              Genuine Products · Nepal
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Build Your
              <br />
              <span className="text-accent">Dream PC</span>
            </h1>
            <p className="mt-6 text-lg text-primary-light leading-relaxed max-w-xl">
              Premium computer hardware and PC components — RAM, SSDs, keyboards, and more. All genuine, all warrantied.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover active:bg-accent-active text-white font-semibold rounded-md transition-colors"
              >
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center justify-center px-6 py-3 border border-white/30 hover:border-white/60 text-white font-semibold rounded-md transition-colors"
              >
                Browse Categories
              </Link>
            </div>
          </div>

          {/* Right — featured products */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0">
            <HeroFeaturedCard />
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
