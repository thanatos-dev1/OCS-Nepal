import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/api/categories";
import { queryKeys } from "@/lib/queries";
import type { Category } from "@/lib/api/types";

export function useCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
  });
}

export function useSaveCategoryMutation(editingCategory: Category | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (editingCategory) {
        await updateCategory(parseInt(editingCategory.id, 10), name);
      } else {
        await createCategory(name);
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
