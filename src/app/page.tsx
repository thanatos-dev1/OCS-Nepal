export const dynamic = "force-dynamic";

import Hero from "@/components/shop/Hero";
import BrandsStrip from "@/components/shop/BrandsStrip";
import NewArrivals from "@/components/shop/NewArrivals";
import FeaturedProducts from "@/components/shop/FeaturedProducts";
import DealsSection from "@/components/shop/DealsSection";
import BudgetPicks from "@/components/shop/BudgetPicks";
import CategoryGrid from "@/components/shop/CategoryGrid";
import ShopByBrand from "@/components/shop/ShopByBrand";
import RecentlyViewed from "@/components/shop/RecentlyViewed";

export default function HomePage() {
  return (
    <>
      <Hero />
      <BrandsStrip />
      <DealsSection />
      <NewArrivals />
      <FeaturedProducts />
      <BudgetPicks />
      <CategoryGrid />
      <ShopByBrand />
      <RecentlyViewed />
    </>
  );
}
