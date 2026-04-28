import type { Category } from "./types";
import api from "./client";

type ApiCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sort_order?: number;
  parent_id?: number | null;
  product_count?: number;
  show_in_bar?: boolean;
  icon?: string;
  children?: ApiCategory[];
};

function adaptCategory(c: ApiCategory): Category {
  return {
    id: String(c.id),
    name: c.name,
    slug: c.slug,
    icon: c.icon ?? "",
    description: c.description ?? "",
    sortOrder: c.sort_order ?? 0,
    parentId: c.parent_id != null ? String(c.parent_id) : null,
    productCount: c.product_count ?? 0,
    showInBar: c.show_in_bar ?? false,
  };
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<ApiCategory[]>("/categories");
  return Array.isArray(data) ? data.map(adaptCategory) : [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const { data } = await api.get<ApiCategory>(`/categories/${slug}`);
    return adaptCategory(data);
  } catch {
    // fallback: fetch all and find by slug
    const all = await getCategories();
    return all.find((c) => c.slug === slug) ?? null;
  }
}

export type CategoryInput = {
  name: string;
  show_in_bar: boolean;
  description?: string;
  sort_order?: number;
  parent_id?: number | null;
};

// --- Owner endpoints ---

export async function createCategory(input: CategoryInput): Promise<Category> {
  const { data } = await api.post<ApiCategory>("/categories", input);
  return adaptCategory(data);
}

export async function updateCategory(id: number, input: CategoryInput): Promise<Category> {
  const { data } = await api.put<ApiCategory>(`/categories/${id}`, input);
  return adaptCategory(data);
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/categories/${id}`);
}
