export const dynamic = "force-dynamic";

import Hero from "@/components/shop/Hero";
import CategoryGrid from "@/components/shop/CategoryGrid";
import DealsSection from "@/components/shop/DealsSection";
import FeaturedProducts from "@/components/shop/FeaturedProducts";
import BudgetPicks from "@/components/shop/BudgetPicks";
import FeaturedCategoryRows from "@/components/shop/FeaturedCategoryRows";
import ShopByBrand from "@/components/shop/ShopByBrand";
import RecentlyViewed from "@/components/shop/RecentlyViewed";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <DealsSection />
      <FeaturedProducts />
      <BudgetPicks />
      <FeaturedCategoryRows />
      <ShopByBrand />
      <RecentlyViewed />
    </>
  );
}
