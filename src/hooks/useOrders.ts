import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOrder,
  createGuestOrder,
  getOrders,
  getOrder,
  getAllOrders,
  confirmOrder,
  outForDelivery,
  deliverOrder,
  rejectOrder,
  updateTracking,
  requestReturn,
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
      qc.invalidateQueries({ queryKey: queryKeys.orders });
      qc.invalidateQueries({ queryKey: queryKeys.cart });
      qc.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

export function usePlaceGuestOrderMutation() {
  return useMutation({ mutationFn: createGuestOrder });
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

export function useUpdateTrackingMutation(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ trackingNumber, carrier }: { trackingNumber: string; carrier?: string }) =>
      updateTracking(orderId, trackingNumber, carrier),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.allOrders });
      qc.invalidateQueries({ queryKey: queryKeys.order(orderId) });
    },
  });
}

export function useRequestReturnMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      orderItemId,
      reason,
    }: {
      orderId: string;
      orderItemId: number;
      reason: string;
    }) => requestReturn(orderId, orderItemId, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.orders }),
  });
}
