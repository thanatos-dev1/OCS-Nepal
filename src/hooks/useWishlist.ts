import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWishlist, addToWishlist, removeFromWishlist } from "@/lib/api/wishlist";
import { queryKeys } from "@/lib/queries";
import { useAuthStore } from "@/stores/authStore";

export function useWishlistQuery() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: queryKeys.wishlist,
    queryFn: getWishlist,
    enabled: !!token,
  });
}

export function useIsInWishlist(productId: number): boolean {
  const { data = [] } = useWishlistQuery();
  return data.some((item) => item.productId === productId);
}

export function useAddToWishlistMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: number) => addToWishlist(productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.wishlist }),
  });
}

export function useRemoveFromWishlistMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: number) => removeFromWishlist(productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.wishlist }),
  });
}
