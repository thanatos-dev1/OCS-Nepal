import type { CategoryBrandGroup } from "./types";
import api from "./client";

type ApiBrandSeriesGroup = {
  BrandID?: number;
  brand_id?: number;
  BrandName?: string;
  brand_name?: string;
  BrandSlug?: string;
  brand_slug?: string;
  Series?: { ID?: number; id?: number; Name?: string; name?: string; Slug?: string; slug?: string }[];
  series?: { ID?: number; id?: number; Name?: string; name?: string; Slug?: string; slug?: string }[];
};

function adapt(g: ApiBrandSeriesGroup): CategoryBrandGroup {
  const id = g.BrandID ?? g.brand_id ?? 0;
  const series = (g.Series ?? g.series ?? []).map((s) => ({
    id: String(s.ID ?? s.id ?? 0),
    name: s.Name ?? s.name ?? "",
    slug: s.Slug ?? s.slug ?? "",
  }));
  return {
    brandId: String(id),
    brandName: g.BrandName ?? g.brand_name ?? "",
    brandSlug: g.BrandSlug ?? g.brand_slug ?? "",
    series,
  };
}

export async function getCategoryBrandSeries(
  categorySlug: string,
): Promise<CategoryBrandGroup[]> {
  const { data } = await api.get<ApiBrandSeriesGroup[]>(
    `/categories/${categorySlug}/brand-series`,
  );
  return Array.isArray(data) ? data.map(adapt) : [];
}
