import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/lib/api/coupons";
import { queryKeys } from "@/lib/queries";
import type { Coupon, CouponInput } from "@/lib/api/types";

export function useCouponsQuery() {
  return useQuery({
    queryKey: queryKeys.coupons,
    queryFn: getCoupons,
  });
}

export function useSaveCouponMutation(editing: Coupon | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CouponInput) =>
      editing
        ? updateCoupon(parseInt(editing.id, 10), input)
        : createCoupon(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.coupons }),
  });
}

export function useDeleteCouponMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCoupon(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.coupons }),
  });
}
