import adminApi from "../adminClient";
import type { Return, ReturnStatus } from "../types";

type ApiReturnOrder = {
  ID: number;
  Status: string;
  [key: string]: unknown;
};

type ApiReturnItem = {
  ID: number;
  Quantity: number;
  Price: number;
  Product?: { ID: number; Name: string; [key: string]: unknown };
};

type ApiReturn = {
  ID: number;
  OrderID: number;
  OrderItemID: number;
  Reason: string;
  Status: ReturnStatus;
  Notes?: string;
  CreatedAt: string;
  ResolvedAt?: string | null;
  Order?: ApiReturnOrder;
  OrderItem?: ApiReturnItem;
};

function adaptReturn(r: ApiReturn): Return {
  return {
    id: r.ID,
    orderId: String(r.OrderID),
    orderItemId: r.OrderItemID,
    reason: r.Reason,
    status: r.Status,
    notes: r.Notes,
    createdAt: r.CreatedAt,
    resolvedAt: r.ResolvedAt,
    order: r.Order
      ? {
          id: String(r.Order.ID),
          status: r.Order.Status as Return["order"] extends { status?: infer S } ? S : never,
          subtotal: 0,
          shippingAmount: 0,
          total: 0,
          createdAt: "",
          deliveryAddress: "",
          phone: "",
          statusLogs: [],
          items: [],
        }
      : undefined,
    item: r.OrderItem
      ? {
          id: String(r.OrderItem.ID),
          productId: String(r.OrderItem.Product?.ID ?? ""),
          productName: r.OrderItem.Product?.Name ?? "",
          name: r.OrderItem.Product?.Name ?? "",
          price: r.OrderItem.Price,
          qty: r.OrderItem.Quantity,
        }
      : undefined,
  };
}

export async function adminGetReturns(status?: ReturnStatus): Promise<Return[]> {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  const { data } = await adminApi.get<ApiReturn[]>("/admin/returns", { params });
  return Array.isArray(data) ? data.map(adaptReturn) : [];
}

export async function adminGetReturn(id: number): Promise<Return> {
  const { data } = await adminApi.get<ApiReturn>(`/admin/returns/${id}`);
  return adaptReturn(data);
}

export async function adminApproveReturn(id: number, notes?: string): Promise<Return> {
  const { data } = await adminApi.put<ApiReturn>(`/admin/returns/${id}/approve`, { notes });
  return adaptReturn(data);
}

export async function adminRejectReturn(id: number, notes?: string): Promise<Return> {
  const { data } = await adminApi.put<ApiReturn>(`/admin/returns/${id}/reject`, { notes });
  return adaptReturn(data);
}
