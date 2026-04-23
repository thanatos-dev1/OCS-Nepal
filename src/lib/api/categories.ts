import type { Category } from "./types";
import { MOCK_CATEGORIES } from "./mock/categories";

export async function getCategories(): Promise<Category[]> {
  // TODO: replace with axios call when backend is ready
  // return api.get("/categories").then((r) => r.data);

  return MOCK_CATEGORIES;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  // TODO: replace with axios call when backend is ready
  // return api.get(`/categories/${slug}`).then((r) => r.data);

  return MOCK_CATEGORIES.find((c) => c.slug === slug) ?? null;
}
