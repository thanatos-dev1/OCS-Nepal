import adminApi from "../adminClient";
import type { Return, ReturnStatus } from "../types";

type ApiReturn = {
  id: number;
  order_id: number;
  order_item_id: number;
  reason: string;
  status: ReturnStatus;
  notes?: string;
  created_at: string;
  order?: { id: number; total: number };
  item?: { id: number; product_name: string; price: number; quantity: number };
};

function adaptReturn(r: ApiReturn): Return {
  return {
    id: r.id,
    orderId: String(r.order_id),
    orderItemId: r.order_item_id,
    reason: r.reason,
    status: r.status,
    notes: r.notes,
    createdAt: r.created_at,
    order: r.order ? { id: String(r.order.id), total: r.order.total, subtotal: 0, shippingAmount: 0, status: "delivered", createdAt: "", deliveryAddress: "", phone: "", statusLogs: [], items: [] } : undefined,
    item: r.item
      ? { id: String(r.item.id), productId: "", productName: r.item.product_name, name: r.item.product_name, price: r.item.price, qty: r.item.quantity }
      : undefined,
  };
}

export async function adminGetReturns(status?: ReturnStatus): Promise<Return[]> {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  const { data } = await adminApi.get<ApiReturn[]>("/api/v1/admin/returns", { params });
  return Array.isArray(data) ? data.map(adaptReturn) : [];
}

export async function adminApproveReturn(id: number, notes?: string): Promise<Return> {
  const { data } = await adminApi.put<ApiReturn>(`/api/v1/admin/returns/${id}/approve`, { notes });
  return adaptReturn(data);
}

export async function adminRejectReturn(id: number, notes?: string): Promise<Return> {
  const { data } = await adminApi.put<ApiReturn>(`/api/v1/admin/returns/${id}/reject`, { notes });
  return adaptReturn(data);
}
