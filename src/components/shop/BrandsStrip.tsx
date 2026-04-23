import { getBrands } from "@/lib/api/brands";
import BrandsMarquee from "./BrandsMarquee";

export default async function BrandsStrip() {
  const brands = await getBrands().catch(() => []);

  return (
    <section className="bg-bg-subtle border-y border-border py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-disabled text-center mb-4">
          Brands We Carry
        </p>
        <BrandsMarquee brands={brands} />
      </div>
    </section>
  );
}
