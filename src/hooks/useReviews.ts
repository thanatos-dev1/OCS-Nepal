import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReviews, createReview, deleteReview } from "@/lib/api/reviews";
import type { ReviewInput } from "@/lib/api/types";
import { queryKeys } from "@/lib/queries";
import { useAuthStore } from "@/stores/authStore";

export function useReviewsQuery(productId: string) {
  return useQuery({
    queryKey: queryKeys.reviews(productId),
    queryFn: () => getReviews(productId),
    enabled: !!productId,
  });
}

export function useCreateReviewMutation(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ReviewInput) => createReview(productId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.reviews(productId) }),
  });
}

export function useDeleteReviewMutation(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: number) => deleteReview(reviewId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.reviews(productId) }),
  });
}

export function useMyReview(productId: string) {
  const user = useAuthStore((s) => s.user);
  const { data: reviews = [] } = useReviewsQuery(productId);
  if (!user) return null;
  return reviews.find((r) => r.user.name === user.name) ?? null;
}
