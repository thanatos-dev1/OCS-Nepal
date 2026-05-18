import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSeriesByBrand,
  createSeries,
  updateSeries,
  deleteSeries,
  getBrandCategoryIds,
  setBrandCategoryIds,
  type Series,
  type SeriesInput,
} from "@/lib/api/series";

export const seriesKeys = {
  byBrand: (brandId: number) => ["series", "brand", brandId] as const,
  brandCategories: (brandId: number) => ["brand", brandId, "categories"] as const,
};

export function useSeriesByBrandQuery(brandId: number | null) {
  return useQuery({
    queryKey: seriesKeys.byBrand(brandId ?? 0),
    queryFn: () => getSeriesByBrand(brandId as number),
    enabled: !!brandId,
  });
}

export function useCreateSeriesMutation(brandId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SeriesInput) => createSeries(brandId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: seriesKeys.byBrand(brandId) });
    },
  });
}

export function useUpdateSeriesMutation(brandId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: SeriesInput }) => updateSeries(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: seriesKeys.byBrand(brandId) });
    },
  });
}

export function useDeleteSeriesMutation(brandId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSeries(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: seriesKeys.byBrand(brandId) });
    },
  });
}

export function useBrandCategoryIdsQuery(brandId: number | null) {
  return useQuery({
    queryKey: seriesKeys.brandCategories(brandId ?? 0),
    queryFn: () => getBrandCategoryIds(brandId as number),
    enabled: !!brandId,
  });
}

export function useSetBrandCategoryIdsMutation(brandId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => setBrandCategoryIds(brandId, ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: seriesKeys.brandCategories(brandId) });
      // The mega-menu data is derived from this link, so blow that cache too.
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export type { Series, SeriesInput };
