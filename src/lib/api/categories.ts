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
  ShowOnHomepage?: boolean;
  Icon?: string;
  CoverImageURL?: string;
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
    showOnHomepage: c.ShowOnHomepage ?? false,
    coverImageUrl: c.CoverImageURL ?? "",
  };
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<ApiCategory[]>("/categories");
  return Array.isArray(data) ? data.map(adaptCategory) : [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  // Backend has no get-by-slug endpoint; client-side find on the list keeps
  // navigation pages working without an extra route. Acceptable given the
  // category list is small and already cached by getCategories' query key.
  const list = await getCategories();
  return list.find((c) => c.slug === slug) ?? null;
}

export type CategoryInput = {
  name: string;
  show_in_bar: boolean;
  show_on_homepage: boolean;
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

export async function uploadCategoryCover(id: number, file: File): Promise<Category> {
  const form = new FormData();
  form.append("image", file);
  const { data } = await api.post<ApiCategory>(`/categories/${id}/cover-image`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return adaptCategory(data);
}
