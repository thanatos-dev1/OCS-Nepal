import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  type BrandInput,
} from "@/lib/api/brands";
import { queryKeys } from "@/lib/queries";
import type { Brand } from "@/lib/api/types";

export function useBrandsQuery() {
  return useQuery({
    queryKey: queryKeys.brands,
    queryFn: getBrands,
  });
}

export function useSaveBrandMutation(editing: Brand | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: BrandInput) => {
      if (editing) {
        await updateBrand(parseInt(editing.id, 10), input);
      } else {
        await createBrand(input);
      }
    },
    // Brands also feed product responses (via BrandRef), so blow that cache too.
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.brands });
      qc.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
}

export function useDeleteBrandMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteBrand(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.brands });
      qc.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
}
