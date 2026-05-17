import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCategorySpecDefinitions,
  createSpecDefinition,
  updateSpecDefinition,
  deleteSpecDefinition,
  type SpecDefinitionInput,
} from "@/lib/api/specDefinitions";
import { queryKeys } from "@/lib/queries";
import type { SpecDefinition } from "@/lib/api/types";

export function useCategorySpecDefinitionsQuery(slug: string | null) {
  return useQuery({
    queryKey: queryKeys.categorySpecDefinitions(slug ?? ""),
    queryFn: () => getCategorySpecDefinitions(slug as string),
    enabled: !!slug,
  });
}

// useSaveSpecDefinitionMutation handles both create (when editing is null) and
// update. The categoryId is only used on create; on edit the slug invalidation
// alone is enough.
export function useSaveSpecDefinitionMutation(
  slug: string,
  categoryId: number,
  editing: SpecDefinition | null,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SpecDefinitionInput) => {
      if (editing) {
        return updateSpecDefinition(editing.id, input);
      }
      return createSpecDefinition(categoryId, input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categorySpecDefinitions(slug) }),
  });
}

export function useDeleteSpecDefinitionMutation(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSpecDefinition(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categorySpecDefinitions(slug) }),
  });
}
