import type { Product, ProductImage, ProductSpec } from "./types";
import api from "./client";

// New snake_case API shape from Go backend
type ApiProductImage = {
  id: number;
  url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
};

type ApiProductSpec = {
  key: string;
  value: string;
  sort_order: number;
};

export type ApiProduct = {
  id: number;
  name: string;
  slug: string;
  price: number;
  brand?: string;
  category_id?: number;
  description?: string;
  stock?: number;
  low_stock_threshold?: number;
  category?: { id: number; name: string; slug: string };
  is_featured?: boolean;
  is_new_arrival?: boolean;
  is_active?: boolean;
  sale_price?: number | null;
  images?: ApiProductImage[];
  specs?: ApiProductSpec[];
};

export type ProductInput = {
  name: string;
  price: number;
  description?: string;
  stock?: number;
  brand?: string;
  category_id?: number;
  is_featured?: boolean;
  is_new_arrival?: boolean;
  is_active?: boolean;
  sale_price?: number;
  low_stock_threshold?: number;
};

export function adaptProduct(p: ApiProduct): Product {
  const images: ProductImage[] = (p.images ?? [])
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return a.sort_order - b.sort_order;
    })
    .map((img) => ({
      id: img.id,
      url: img.url,
      altText: img.alt_text,
      isPrimary: img.is_primary,
      sortOrder: img.sort_order,
    }));

  const specs: ProductSpec[] = (p.specs ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((s) => ({ key: s.key, value: s.value, sortOrder: s.sort_order }));

  return {
    id: String(p.id),
    name: p.name,
    slug: p.slug,
    price: p.price,
    brand: p.brand,
    description: p.description ?? "",
    images,
    inStock: (p.stock ?? 0) > 0,
    stockCount: p.stock ?? 0,
    lowStockThreshold: p.low_stock_threshold ?? 5,
    categoryId: String(p.category_id ?? ""),
    category: p.category?.name ?? "",
    categorySlug: p.category?.slug ?? "",
    specs,
    isFeatured: p.is_featured ?? false,
    isNewArrival: p.is_new_arrival ?? false,
    isActive: p.is_active ?? true,
    salePrice: p.sale_price ?? undefined,
  };
}

export type ProductsParams = {
  q?: string;
  category_id?: string;
  is_featured?: boolean;
  is_new_arrival?: boolean;
  min_price?: number;
  max_price?: number;
  include_inactive?: boolean;
  sort?: string;
};

export async function getProducts(params?: ProductsParams): Promise<Product[]> {
  const query: Record<string, string> = {};
  if (params?.q) query.q = params.q;
  if (params?.category_id) query.category_id = params.category_id;
  if (params?.is_featured) query.is_featured = "true";
  if (params?.is_new_arrival) query.is_new_arrival = "true";
  if (params?.min_price !== undefined) query.min_price = String(params.min_price);
  if (params?.max_price !== undefined) query.max_price = String(params.max_price);
  if (params?.include_inactive) query.include_inactive = "true";

  const { data } = await api.get<ApiProduct[]>("/products", { params: query });
  let products = Array.isArray(data) ? data.map(adaptProduct) : [];

  if (params?.sort === "price_asc") products = products.sort((a, b) => a.price - b.price);
  if (params?.sort === "price_desc") products = products.sort((a, b) => b.price - a.price);

  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data } = await api.get<ApiProduct>(`/products/${slug}`);
    return adaptProduct(data);
  } catch {
    return null;
  }
}

// Legacy ID-based lookup kept for internal use (admin)
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data } = await api.get<ApiProduct>(`/products/${id}`);
    return adaptProduct(data);
  } catch {
    return null;
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return getProducts({ is_featured: true });
}

export async function getNewArrivals(): Promise<Product[]> {
  return getProducts({ is_new_arrival: true });
}

export async function getDeals(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.salePrice !== undefined && p.salePrice < p.price);
}

export async function getBudgetPicks(maxPrice: number): Promise<Product[]> {
  return getProducts({ max_price: maxPrice });
}

// --- Owner endpoints ---

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data } = await api.post<ApiProduct>("/products", input);
  return adaptProduct(data);
}

export async function createProductWithImage(form: FormData): Promise<Product> {
  const { data } = await api.post<ApiProduct>("/products/with-image", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return adaptProduct(data);
}

export async function updateProduct(id: number, input: ProductInput): Promise<Product> {
  const { data } = await api.put<ApiProduct>(`/products/${id}`, input);
  return adaptProduct(data);
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function updateStock(id: number, quantity: number): Promise<Product> {
  const { data } = await api.patch<ApiProduct>(`/admin/products/${id}/stock`, { quantity });
  return adaptProduct(data);
}

export async function toggleProductFlag(
  id: number,
  flag: "is_featured" | "is_new_arrival" | "is_active",
  value: boolean,
): Promise<Product> {
  const { data } = await api.patch<ApiProduct>(`/products/${id}`, { [flag]: value });
  return adaptProduct(data);
}

// Image management
export async function uploadProductImage(
  productId: number,
  form: FormData,
): Promise<ProductImage> {
  const { data } = await api.post<ApiProductImage>(
    `/products/${productId}/images`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return {
    id: data.id,
    url: data.url,
    altText: data.alt_text,
    isPrimary: data.is_primary,
    sortOrder: data.sort_order,
  };
}

export async function deleteProductImage(productId: number, imageId: number): Promise<void> {
  await api.delete(`/products/${productId}/images/${imageId}`);
}

export async function setPrimaryImage(productId: number, imageId: number): Promise<void> {
  await api.put(`/products/${productId}/images/${imageId}/primary`);
}

// Specs management
export async function updateProductSpecs(
  productId: number,
  specs: { key: string; value: string; sort_order: number }[],
): Promise<void> {
  await api.put(`/products/${productId}/specs`, specs);
}
