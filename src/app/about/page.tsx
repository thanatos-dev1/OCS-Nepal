export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  ChevronRight,
  ShieldCheck,
  BadgeCheck,
  Truck,
  Headphones,
} from "lucide-react";
import { getBrands } from "@/lib/api/brands";

const values = [
  {
    icon: BadgeCheck,
    title: "100% Genuine Products",
    description:
      "Every product we sell is sourced directly from authorised distributors. No counterfeits, no grey-market imports.",
  },
  {
    icon: ShieldCheck,
    title: "Official Warranty",
    description:
      "All products carry manufacturer warranty. We handle warranty claims on your behalf so you never have to chase it alone.",
  },
  {
    icon: Truck,
    title: "Delivery Across Nepal",
    description:
      "We ship to all major cities and districts in Nepal. Orders are packed carefully and dispatched within 24 hours.",
  },
  {
    icon: Headphones,
    title: "After-Sales Support",
    description:
      "Our team is available on WhatsApp to help with product selection, compatibility questions, and post-purchase support.",
  },
];

export default async function AboutPage() {
  const brands = await getBrands();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-text-muted mb-8">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight size={14} />
        <span className="text-text font-medium">About</span>
      </nav>

      {/* Story */}
      <section className="mb-14">
        <h1 className="text-3xl font-bold text-text mb-4">About OCS Nepal</h1>
        <div className="space-y-4 text-text-muted leading-relaxed">
          <p>
            OCS Nepal is a Kathmandu-based technology retailer and solutions
            provider dedicated to bringing genuine PC components and reliable
            digital services to builders, gamers, and professionals across
            Nepal.
          </p>
          <p>
            We started with a simple belief: every customer in Nepal deserves
            access to authentic products with real warranty support — not
            counterfeit parts sold at suspiciously low prices. That belief still
            drives everything we do, both in hardware and software.
          </p>
          <p>
            From RAM and SSDs to mechanical keyboards and accessories, we carry
            products from brands that stand behind their quality. When you buy
            from OCS Nepal, you know exactly what you&apos;re getting.
          </p>
          <p>
            Beyond hardware, we also build custom websites and web applications,
            including eCommerce platforms and business systems tailored to your
            needs. Our focus is on creating reliable, scalable, and
            user-friendly digital solutions.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-text mb-6">Why Choose Us</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {values.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex gap-4 p-5 bg-bg-subtle border border-border rounded-xl"
            >
              <div className="shrink-0 w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                <Icon size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text mb-1">
                  {title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brands */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-text mb-2">Brands We Carry</h2>
        <p className="text-sm text-text-muted mb-6">
          We stock products from {brands.length} authorized brands — all
          genuine, all warrantied.
        </p>
        <div className="flex flex-wrap gap-2">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/products?brand=${brand.id}`}
              className="px-3 py-1.5 text-xs font-semibold tracking-wide text-text-muted bg-bg-subtle border border-border rounded-md hover:border-border-strong hover:text-text transition-colors"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="rounded-2xl bg-primary px-8 py-8">
        <h2 className="text-xl font-bold text-white mb-1">Get in Touch</h2>
        <p className="text-primary-light text-sm mb-6">
          Have a question about a product or need help choosing the right
          components?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/5 rounded-lg px-4 py-3">
            <p className="text-primary-light text-xs uppercase tracking-wide mb-1">
              WhatsApp
            </p>
            <a
              href="https://wa.me/9779860232485"
              className="text-white font-medium hover:text-accent transition-colors"
            >
              +977 9860232485
            </a>
          </div>
          <div className="bg-white/5 rounded-lg px-4 py-3">
            <p className="text-primary-light text-xs uppercase tracking-wide mb-1">
              Email
            </p>
            <a
              href="mailto:info@ocsnepal.com"
              className="text-white font-medium hover:text-accent transition-colors"
            >
              info@ocsnepal.com
            </a>
          </div>
          <div className="bg-white/5 rounded-lg px-4 py-3">
            <p className="text-primary-light text-xs uppercase tracking-wide mb-1">
              Location
            </p>
            <p className="text-white font-medium">Kathmandu, Nepal</p>
          </div>
        </div>
      </section>
    </div>
  );
}
