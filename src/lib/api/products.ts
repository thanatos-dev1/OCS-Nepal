import type { Product } from "./types";
import { MOCK_PRODUCTS } from "./mock/products";

export async function getProducts(params?: {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}): Promise<Product[]> {
  // TODO: replace with axios call when backend is ready
  // return api.get("/products", { params }).then((r) => r.data);

  let results = [...MOCK_PRODUCTS];

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
  if (params?.sort === "price_asc")  results.sort((a, b) => a.price - b.price);
  if (params?.sort === "price_desc") results.sort((a, b) => b.price - a.price);

  return results;
}

export async function getProductById(id: string): Promise<Product | null> {
  // TODO: replace with axios call when backend is ready
  // return api.get(`/products/${id}`).then((r) => r.data);

  return MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  // TODO: replace with axios call when backend is ready
  // return api.get("/products/featured").then((r) => r.data);

  return MOCK_PRODUCTS.filter((p) => p.badge === "Popular" || p.badge === "New").slice(0, 4);
}
