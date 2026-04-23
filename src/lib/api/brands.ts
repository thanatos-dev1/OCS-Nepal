import type { Brand } from "./types";
import { MOCK_BRANDS } from "./mock/brands";

// TODO: replace with axios call to GET /brands
export async function getBrands(): Promise<Brand[]> {
  return MOCK_BRANDS;
}
