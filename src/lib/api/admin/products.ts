import adminApi from "../adminClient";
import { adaptProduct, type ApiProduct, type ProductInput } from "../products";
import type { Product } from "../types";

export async function adminGetProducts(params?: {
  q?: string;
  category_id?: string;
  include_inactive?: boolean;
}): Promise<Product[]> {
  const query: Record<string, string> = {};
  if (params?.q) query.q = params.q;
  if (params?.category_id) query.category_id = params.category_id;
  if (params?.include_inactive) query.include_inactive = "true";
  const { data } = await adminApi.get<ApiProduct[]>("/api/v1/products", { params: query });
  return Array.isArray(data) ? data.map(adaptProduct) : [];
}

export async function adminUpdateStock(id: number, quantity: number): Promise<Product> {
  const { data } = await adminApi.patch<ApiProduct>(`/api/v1/admin/products/${id}/stock`, {
    quantity,
  });
  return adaptProduct(data);
}

export async function adminUpdateProduct(id: number, input: ProductInput): Promise<Product> {
  const { data } = await adminApi.put<ApiProduct>(`/api/v1/products/${id}`, input);
  return adaptProduct(data);
}

export async function adminDeleteProduct(id: number): Promise<void> {
  await adminApi.delete(`/api/v1/products/${id}`);
}

export async function adminToggleFlag(
  id: number,
  flag: "is_featured" | "is_new_arrival" | "is_active",
  value: boolean,
): Promise<Product> {
  const { data } = await adminApi.patch<ApiProduct>(`/api/v1/products/${id}`, { [flag]: value });
  return adaptProduct(data);
}

export async function adminUpdateSpecs(
  productId: number,
  specs: { key: string; value: string; sort_order: number }[],
): Promise<void> {
  await adminApi.put(`/api/v1/products/${productId}/specs`, specs);
}
