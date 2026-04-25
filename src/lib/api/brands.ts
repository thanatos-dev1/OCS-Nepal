import type { Brand } from "./types";
import api from "./client";
import { MOCK_BRANDS } from "./mock/brands";

type ApiProduct = { ID: number; Brand?: string };

export async function getBrands(): Promise<Brand[]> {
  // const { data } = await api.get<ApiProduct[]>("/products");
  // const seen = new Set<string>();
  // const brands: Brand[] = [];
  // if (Array.isArray(data)) {
  //   for (const p of data) {
  //     const name = p.Brand?.trim();
  //     if (name && !seen.has(name)) {
  //       seen.add(name);
  //       brands.push({ id: name.toLowerCase().replace(/\s+/g, "-"), name });
  //     }
  //   }
  // }
  return MOCK_BRANDS;
}
