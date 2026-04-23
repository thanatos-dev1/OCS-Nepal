import api from "./client";
import type { Order } from "./types";

type ApiProduct = { ID: number; Name: string; Price: number; [key: string]: unknown };

type ApiOrderItem = {
  ID: number;
  ProductID: number;
  Quantity: number;
  Price: number;
  Product?: ApiProduct;
};

type ApiUser = { ID: number; Name: string; Email: string };

export type ApiOrder = {
  ID: number;
  CreatedAt: string;
  Status: string;
  Total: number;
  DeliveryAddress: string;
  Phone: string;
  Note?: string;
  RejectionReason?: string;
  TrackingNumber?: string;
  PaymentMethod?: string;
  Items: ApiOrderItem[];
  User?: ApiUser;
};

export function adaptOrder(o: ApiOrder): Order {
  return {
    id: String(o.ID),
    status: o.Status as Order["status"],
    total: o.Total,
    createdAt: o.CreatedAt,
    deliveryAddress: o.DeliveryAddress,
    phone: o.Phone,
    note: o.Note,
    rejectionReason: o.RejectionReason,
    trackingNumber: o.TrackingNumber,
    items: (o.Items ?? []).map((i) => ({
      productId: String(i.ProductID),
      name: i.Product?.Name ?? "",
      price: i.Price,
      qty: i.Quantity,
    })),
    user: o.User ? { id: o.User.ID, name: o.User.Name, email: o.User.Email } : undefined,
  };
}

export async function createOrder(payload: {
  deliveryAddress: string;
  phone: string;
  note?: string;
  couponCode?: string;
  discountAmount?: number;
}): Promise<Order> {
  const { data } = await api.post<ApiOrder>("/orders", {
    delivery_address: payload.deliveryAddress,
    phone: payload.phone,
    note: payload.note,
    payment_method: "cod",
    coupon_code: payload.couponCode,
    discount_amount: payload.discountAmount,
  });
  return adaptOrder(data);
}

export async function getOrders(): Promise<Order[]> {
  const { data } = await api.get<ApiOrder[]>("/orders");
  return Array.isArray(data) ? data.map(adaptOrder) : [];
}

export async function getOrder(id: string): Promise<Order> {
  const { data } = await api.get<ApiOrder>(`/orders/${id}`);
  return adaptOrder(data);
}

export async function getAllOrders(): Promise<Order[]> {
  const { data } = await api.get<ApiOrder[]>("/admin/orders");
  return Array.isArray(data) ? data.map(adaptOrder) : [];
}

export async function confirmOrder(id: string): Promise<Order> {
  const { data } = await api.put<ApiOrder>(`/orders/${id}/confirm`);
  return adaptOrder(data);
}

export async function outForDelivery(id: string): Promise<Order> {
  const { data } = await api.put<ApiOrder>(`/orders/${id}/out-for-delivery`);
  return adaptOrder(data);
}

export async function deliverOrder(id: string): Promise<Order> {
  const { data } = await api.put<ApiOrder>(`/orders/${id}/delivered`);
  return adaptOrder(data);
}

export async function rejectOrder(id: string, reason: string): Promise<Order> {
  const { data } = await api.put<ApiOrder>(`/orders/${id}/reject`, { reason });
  return adaptOrder(data);
}

export async function updateTracking(id: string, trackingNumber: string): Promise<Order> {
  const { data } = await api.put<ApiOrder>(`/admin/orders/${id}/tracking`, { tracking_number: trackingNumber });
  return adaptOrder(data);
}
