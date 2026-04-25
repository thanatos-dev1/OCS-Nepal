import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOrder, getOrders, getOrder, getAllOrders,
  confirmOrder, outForDelivery, deliverOrder, rejectOrder,
} from "@/lib/api/orders";
import { queryKeys } from "@/lib/queries";
import { useAuthStore } from "@/stores/authStore";

export function useOrdersQuery() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: getOrders,
    enabled: !!token,
  });
}

export function useOrderQuery(id: string) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: () => getOrder(id),
    enabled: !!token && !!id,
  });
}

export function useAllOrdersQuery() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: queryKeys.allOrders,
    queryFn: getAllOrders,
    enabled: !!token,
  });
}

export function usePlaceOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      // Backend clears the cart on order success — just invalidate both
      qc.invalidateQueries({ queryKey: queryKeys.orders });
      qc.invalidateQueries({ queryKey: queryKeys.cart });
      qc.invalidateQueries({ queryKey: queryKeys.profile }); // purchase_badge may flip
    },
  });
}

export function useConfirmOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => confirmOrder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.allOrders }),
  });
}

export function useOutForDeliveryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => outForDelivery(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.allOrders }),
  });
}

export function useDeliverOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deliverOrder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.allOrders }),
  });
}

export function useRejectOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectOrder(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.allOrders }),
  });
}
