import api from "./client";

export type Series = {
  id: number;
  brandId: number;
  name: string;
  slug: string;
  sortOrder: number;
};

type ApiSeries = {
  ID?: number;
  id?: number;
  BrandID?: number;
  brand_id?: number;
  Name?: string;
  name?: string;
  Slug?: string;
  slug?: string;
  SortOrder?: number;
  sort_order?: number;
};

function adapt(s: ApiSeries): Series {
  return {
    id: s.ID ?? s.id ?? 0,
    brandId: s.BrandID ?? s.brand_id ?? 0,
    name: s.Name ?? s.name ?? "",
    slug: s.Slug ?? s.slug ?? "",
    sortOrder: s.SortOrder ?? s.sort_order ?? 0,
  };
}

export async function getSeriesByBrand(brandId: number): Promise<Series[]> {
  const { data } = await api.get<ApiSeries[]>(`/brands/${brandId}/series`);
  return Array.isArray(data) ? data.map(adapt) : [];
}

export type SeriesInput = {
  name: string;
  slug?: string;
  sort_order?: number;
};

export async function createSeries(brandId: number, input: SeriesInput): Promise<Series> {
  const { data } = await api.post<ApiSeries>(`/brands/${brandId}/series`, input);
  return adapt(data);
}

export async function updateSeries(id: number, input: SeriesInput): Promise<Series> {
  const { data } = await api.put<ApiSeries>(`/series/${id}`, input);
  return adapt(data);
}

export async function deleteSeries(id: number): Promise<void> {
  await api.delete(`/series/${id}`);
}

// Brand ↔ category links

export async function getBrandCategoryIds(brandId: number): Promise<number[]> {
  const { data } = await api.get<number[]>(`/brands/${brandId}/categories`);
  return Array.isArray(data) ? data : [];
}

export async function setBrandCategoryIds(brandId: number, ids: number[]): Promise<void> {
  await api.put(`/brands/${brandId}/categories`, { category_ids: ids });
}
