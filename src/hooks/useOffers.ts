import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOffers, createOffer, updateOffer, deleteOffer } from "@/lib/api/offers";
import { queryKeys } from "@/lib/queries";
import type { Offer, OfferInput } from "@/lib/api/types";

export function useOffersQuery() {
  return useQuery({
    queryKey: queryKeys.offers,
    queryFn: getOffers,
  });
}

export function useSaveOfferMutation(editing: Offer | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: OfferInput) =>
      editing
        ? updateOffer(parseInt(editing.id, 10), input)
        : createOffer(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.offers }),
  });
}

export function useDeleteOfferMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteOffer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.offers }),
  });
}
