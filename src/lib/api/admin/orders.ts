import adminApi from "../adminClient";
import { adaptOrder, type ApiOrder } from "../orders";
import type { Order } from "../types";

export async function adminGetOrders(status?: string): Promise<Order[]> {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  const { data } = await adminApi.get<ApiOrder[]>("/admin/orders", { params });
  return Array.isArray(data) ? data.map(adaptOrder) : [];
}

export async function adminGetOrder(id: string): Promise<Order> {
  const { data } = await adminApi.get<ApiOrder>(`/admin/orders/${id}`);
  return adaptOrder(data);
}

export async function adminConfirmOrder(id: string): Promise<Order> {
  const { data } = await adminApi.put<ApiOrder>(`/orders/${id}/confirm`);
  return adaptOrder(data);
}

export async function adminOutForDelivery(id: string): Promise<Order> {
  const { data } = await adminApi.put<ApiOrder>(`/orders/${id}/out-for-delivery`);
  return adaptOrder(data);
}

export async function adminDeliverOrder(id: string): Promise<Order> {
  const { data } = await adminApi.put<ApiOrder>(`/orders/${id}/delivered`);
  return adaptOrder(data);
}

export async function adminRejectOrder(id: string, reason: string): Promise<Order> {
  const { data } = await adminApi.put<ApiOrder>(`/orders/${id}/reject`, { reason });
  return adaptOrder(data);
}

export async function adminUpdateTracking(
  id: string,
  trackingNumber: string,
  carrier?: string,
): Promise<Order> {
  const { data } = await adminApi.put<ApiOrder>(`/admin/orders/${id}/tracking`, {
    tracking_number: trackingNumber,
    carrier,
  });
  return adaptOrder(data);
}
