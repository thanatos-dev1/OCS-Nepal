import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, createCategory, updateCategory, deleteCategory, type CategoryInput } from "@/lib/api/categories";
import { getCategoryBrandSeries } from "@/lib/api/categoryBrandSeries";
import { queryKeys } from "@/lib/queries";
import type { Category } from "@/lib/api/types";

export function useCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
  });
}

export function useCategoryBrandSeriesQuery(slug: string | null) {
  return useQuery({
    queryKey: queryKeys.categoryBrandSeries(slug ?? ""),
    queryFn: () => getCategoryBrandSeries(slug as string),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });
}

export function useSaveCategoryMutation(editingCategory: Category | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CategoryInput) => {
      if (editingCategory) {
        await updateCategory(parseInt(editingCategory.id, 10), input);
      } else {
        await createCategory(input);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories }),
  });
}

export function useDeleteCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories }),
  });
}
