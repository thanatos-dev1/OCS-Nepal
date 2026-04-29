import type { Category } from "./types";
import api from "./client";

type ApiCategory = {
  ID: number;
  Name: string;
  Slug: string;
  Description?: string;
  SortOrder?: number;
  ParentID?: number | null;
  ProductCount?: number;
  ShowInBar?: boolean;
  Icon?: string;
  Children?: ApiCategory[];
};

function adaptCategory(c: ApiCategory): Category {
  return {
    id: String(c.ID),
    name: c.Name,
    slug: c.Slug,
    icon: c.Icon ?? "",
    description: c.Description ?? "",
    sortOrder: c.SortOrder ?? 0,
    parentId: c.ParentID != null ? String(c.ParentID) : null,
    productCount: c.ProductCount ?? 0,
    showInBar: c.ShowInBar ?? false,
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
  Name: string;
  ShowInBar: boolean;
  Description?: string;
  SortOrder?: number;
  ParentID?: number | null;
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
