import type { Product, ProductImage, ProductSpec } from "./types";
import api from "./client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiProduct = Record<string, any>;

export type ProductInput = {
  Name: string;
  Price: number;
  Description?: string;
  Stock?: number;
  Brand?: string;
  CategoryID?: number;
  IsFeatured?: boolean;
  IsNewArrival?: boolean;
  IsActive?: boolean;
  SalePrice?: number;
};

export function adaptProduct(p: ApiProduct): Product {
  const id = p.ID ?? p.id;
  const name = p.Name ?? p.name ?? "";
  const slug = p.Slug ?? p.slug ?? name.toLowerCase().replace(/\s+/g, "-");
  const price = p.Price ?? p.price ?? 0;
  const stock = p.StockCount ?? p.stock_count ?? p.Stock ?? p.stock ?? 0;
  const imageUrl: string | undefined = p.ImageURL ?? p.image_url;
  const images: ProductImage[] = imageUrl
    ? [{ id: 0, url: imageUrl, altText: name, isPrimary: true, sortOrder: 0 }]
    : [];

  return {
    id: String(id),
    name,
    slug,
    price,
    brand: p.Brand ?? p.brand,
    description: p.Description ?? p.description ?? "",
    images,
    inStock: p.InStock ?? p.in_stock ?? stock > 0,
    stockCount: stock,
    lowStockThreshold: p.LowStockThreshold ?? p.low_stock_threshold ?? 5,
    categoryId: String(p.CategoryID ?? p.category_id ?? (typeof p.Category === "object" ? p.Category?.ID ?? p.Category?.id : "") ?? ""),
    category: typeof p.Category === "object" ? (p.Category?.Name ?? p.Category?.name ?? "") : (p.Category ?? p.category?.name ?? p.category ?? ""),
    categorySlug: typeof p.Category === "object" ? (p.Category?.Slug ?? p.Category?.slug ?? "") : (p.CategorySlug ?? p.category?.slug ?? ""),
    specs: [],
    isFeatured: p.IsFeatured ?? p.is_featured ?? false,
    isNewArrival: p.IsNewArrival ?? p.is_new_arrival ?? false,
    isActive: p.IsActive ?? p.is_active ?? true,
    salePrice: p.SalePrice ?? p.sale_price ?? undefined,
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
  const { data } = await api.post<ApiProduct>(
    `/products/${productId}/images`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return {
    id: data.ID ?? data.id ?? 0,
    url: data.URL ?? data.url ?? "",
    altText: data.AltText ?? data.alt_text ?? "",
    isPrimary: data.IsPrimary ?? data.is_primary ?? false,
    sortOrder: data.SortOrder ?? data.sort_order ?? 0,
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
