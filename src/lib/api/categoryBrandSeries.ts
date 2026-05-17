import type { CategoryBrandGroup } from "./types";
import { MOCK_CATEGORY_BRAND_SERIES } from "./mock/categoryBrandSeries";

// TODO(backend): replace mock lookup with `api.get(\`/categories/${slug}/brand-series\`)`
// once the Go endpoint lands. See BACKEND-SPEC.md.
export async function getCategoryBrandSeries(
  categorySlug: string,
): Promise<CategoryBrandGroup[]> {
  return MOCK_CATEGORY_BRAND_SERIES[categorySlug] ?? [];
}
