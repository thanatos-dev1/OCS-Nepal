import type { Category } from "./types";
import api from "./client";

type ApiCategory = { ID: number; Name: string };

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function adaptCategory(c: ApiCategory): Category {
  return {
    id: String(c.ID),
    name: c.Name,
    slug: toSlug(c.Name),
    icon: "",
    productCount: 0,
  };
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<ApiCategory[]>("/categories");
  return Array.isArray(data) ? data.map(adaptCategory) : [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const all = await getCategories();
  return all.find((c) => c.slug === slug) ?? null;
}

// --- Owner endpoints ---

export async function createCategory(name: string): Promise<Category> {
  const { data } = await api.post<ApiCategory>("/categories", { name });
  return adaptCategory(data);
}

export async function updateCategory(id: number, name: string): Promise<Category> {
  const { data } = await api.put<ApiCategory>(`/categories/${id}`, { name });
  return adaptCategory(data);
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/categories/${id}`);
}
