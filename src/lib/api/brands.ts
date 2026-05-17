import type { Brand } from "./types";
import api from "./client";

type ApiBrand = {
  ID?: number;
  id?: number;
  Name?: string;
  name?: string;
  Slug?: string;
  slug?: string;
  LogoURL?: string;
  logo_url?: string;
  Website?: string;
  website?: string;
  SortOrder?: number;
  sort_order?: number;
  IsActive?: boolean;
  is_active?: boolean;
  ProductCount?: number;
  product_count?: number;
};

function adaptBrand(b: ApiBrand): Brand {
  const name = b.Name ?? b.name ?? "";
  const id = b.ID ?? b.id ?? 0;
  return {
    id: String(id),
    name,
    slug: b.Slug ?? b.slug ?? name.toLowerCase().replace(/\s+/g, "-"),
    logoUrl: b.LogoURL ?? b.logo_url ?? undefined,
    website: b.Website ?? b.website ?? undefined,
    sortOrder: b.SortOrder ?? b.sort_order ?? 0,
    isActive: b.IsActive ?? b.is_active ?? true,
    productCount: b.ProductCount ?? b.product_count ?? 0,
  };
}

export async function getBrands(): Promise<Brand[]> {
  const { data } = await api.get<ApiBrand[]>("/brands");
  return Array.isArray(data) ? data.map(adaptBrand) : [];
}

export type BrandInput = {
  Name: string;
  Slug?: string;
  LogoURL?: string;
  Website?: string;
  SortOrder?: number;
  IsActive: boolean;
};

export async function createBrand(input: BrandInput): Promise<Brand> {
  const { data } = await api.post<ApiBrand>("/brands", {
    name: input.Name,
    slug: input.Slug,
    logo_url: input.LogoURL,
    website: input.Website,
    sort_order: input.SortOrder ?? 0,
    is_active: input.IsActive,
  });
  return adaptBrand(data);
}

export async function updateBrand(id: number, input: BrandInput): Promise<Brand> {
  const { data } = await api.put<ApiBrand>(`/brands/${id}`, {
    name: input.Name,
    slug: input.Slug,
    logo_url: input.LogoURL,
    website: input.Website,
    sort_order: input.SortOrder ?? 0,
    is_active: input.IsActive,
  });
  return adaptBrand(data);
}

export async function deleteBrand(id: number): Promise<void> {
  await api.delete(`/brands/${id}`);
}
