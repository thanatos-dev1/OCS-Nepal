import type { Product } from "./types";
import api from "./client";

// Shape returned by the Go API (PascalCase GORM model)
export type ApiProduct = {
  ID: number;
  Name: string;
  Price: number;
  Brand?: string;
  CategoryID?: number;
  Description?: string;
  ImageURL?: string;
  Stock?: number;
  Category?: { ID: number; Name: string };
  IsFeatured?: boolean;
  IsNewArrival?: boolean;
  SalePrice?: number;
};

export type ProductInput = {
  name: string;
  price: number;
  description?: string;
  stock?: number;
  brand?: string;
  image_url?: string;
  category_id?: number;
  is_featured?: boolean;
  is_new_arrival?: boolean;
  sale_price?: number;
};

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function adaptProduct(p: ApiProduct): Product {
  return {
    id: String(p.ID),
    name: p.Name,
    slug: toSlug(p.Name),
    price: p.Price,
    brand: p.Brand,
    description: p.Description ?? "",
    images: p.ImageURL ? [p.ImageURL] : [],
    inStock: (p.Stock ?? 0) > 0,
    stockCount: p.Stock ?? 0,
    categoryId: String(p.CategoryID ?? ""),
    category: p.Category?.Name ?? "",
    categorySlug: p.Category ? toSlug(p.Category.Name) : "",
    specs: [],
    isFeatured: p.IsFeatured ?? true,
    isNewArrival: p.IsNewArrival ?? true,
    salePrice: p.SalePrice,
  };
}

function applyFilters(
  products: Product[],
  params?: { q?: string; category?: string; minPrice?: number; maxPrice?: number; sort?: string }
): Product[] {
  let results = [...products];
  if (params?.q) {
    const q = params.q.toLowerCase();
    results = results.filter((p) => p.name.toLowerCase().includes(q));
  }
  if (params?.category) {
    results = results.filter((p) => p.categorySlug === params.category);
  }
  if (params?.minPrice !== undefined) {
    results = results.filter((p) => p.price >= params.minPrice!);
  }
  if (params?.maxPrice !== undefined) {
    results = results.filter((p) => p.price <= params.maxPrice!);
  }
  if (params?.sort === "price_asc") results.sort((a, b) => a.price - b.price);
  if (params?.sort === "price_desc") results.sort((a, b) => b.price - a.price);
  return results;
}

export async function getProducts(params?: {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}): Promise<Product[]> {
  const { data } = await api.get<ApiProduct[]>("/products");
  const products = Array.isArray(data) ? data.map(adaptProduct) : [];
  return applyFilters(products, params);
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data } = await api.get<ApiProduct>(`/products/${parseInt(id, 10)}`);
  return adaptProduct(data);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.isFeatured);
}

export async function getNewArrivals(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.isNewArrival);
}

export async function getDeals(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.salePrice !== undefined && p.salePrice < p.price);
}

export async function getBudgetPicks(maxPrice: number): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => {
    const effectivePrice = p.salePrice ?? p.price;
    return effectivePrice <= maxPrice;
  });
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

export async function updateStock(id: number, stock: number): Promise<Product> {
  const { data } = await api.patch<ApiProduct>(`/admin/products/${id}/stock`, { stock });
  return adaptProduct(data);
}
