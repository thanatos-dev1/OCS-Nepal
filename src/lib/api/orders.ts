import api from "./client";
import type { Order, OrderItem, OrderStatusLog, OrderItemSnapshot } from "./types";

type ApiOrderItemSnapshot = {
  name: string;
  sku: string;
  price: number;
  image_url: string;
};

type ApiOrderItem = {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  snapshot?: ApiOrderItemSnapshot;
};

type ApiStatusLog = {
  from_status: string;
  to_status: string;
  note?: string;
  created_at: string;
};

type ApiUser = { id: number; name: string; email: string };

export type ApiOrder = {
  id: number;
  created_at: string;
  status: string;
  subtotal: number;
  shipping_amount: number;
  total: number;
  delivery_address: string;
  phone: string;
  note?: string;
  rejection_reason?: string;
  tracking_number?: string;
  payment_method?: string;
  guest_email?: string;
  shipping_address_id?: number;
  coupon_code?: string;
  discount_amount?: number;
  status_logs?: ApiStatusLog[];
  items: ApiOrderItem[];
  user?: ApiUser;
};

function adaptItem(i: ApiOrderItem): OrderItem {
  let snapshot: OrderItemSnapshot | undefined;
  if (i.snapshot) {
    snapshot = {
      name: i.snapshot.name,
      sku: i.snapshot.sku,
      price: i.snapshot.price,
      imageUrl: i.snapshot.image_url,
    };
  }
  return {
    id: String(i.id),
    productId: String(i.product_id),
    productName: i.product_name,
    name: i.product_name,
    price: i.price,
    qty: i.quantity,
    snapshot,
  };
}

export function adaptOrder(o: ApiOrder): Order {
  const statusLogs: OrderStatusLog[] = (o.status_logs ?? []).map((l) => ({
    fromStatus: l.from_status,
    toStatus: l.to_status,
    note: l.note,
    createdAt: l.created_at,
  }));

  return {
    id: String(o.id),
    status: o.status as Order["status"],
    total: o.total,
    subtotal: o.subtotal ?? o.total,
    shippingAmount: o.shipping_amount ?? 0,
    createdAt: o.created_at,
    deliveryAddress: o.delivery_address,
    phone: o.phone,
    note: o.note,
    rejectionReason: o.rejection_reason,
    trackingNumber: o.tracking_number,
    guestEmail: o.guest_email,
    shippingAddressId: o.shipping_address_id,
    couponCode: o.coupon_code,
    discountAmount: o.discount_amount,
    statusLogs,
    items: (o.items ?? []).map(adaptItem),
    user: o.user ? { id: o.user.id, name: o.user.name, email: o.user.email } : undefined,
  };
}

export async function createOrder(payload: {
  deliveryAddress: string;
  phone: string;
  note?: string;
  couponCode?: string;
  discountAmount?: number;
  shippingAddressId?: number;
}): Promise<Order> {
  const { data } = await api.post<ApiOrder>("/orders", {
    delivery_address: payload.deliveryAddress,
    phone: payload.phone,
    note: payload.note,
    payment_method: "cod",
    coupon_code: payload.couponCode,
    discount_amount: payload.discountAmount,
    shipping_address_id: payload.shippingAddressId,
  });
  return adaptOrder(data);
}

export async function createGuestOrder(payload: {
  guestEmail: string;
  items: { product_id: number; quantity: number }[];
  paymentMethod?: string;
  couponCode?: string;
  note?: string;
}): Promise<Order> {
  const { data } = await api.post<ApiOrder>("/orders/guest", {
    guest_email: payload.guestEmail,
    items: payload.items,
    payment_method: payload.paymentMethod ?? "cod",
    coupon_code: payload.couponCode,
    note: payload.note,
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

export async function updateTracking(id: string, trackingNumber: string, carrier?: string): Promise<Order> {
  const { data } = await api.put<ApiOrder>(`/admin/orders/${id}/tracking`, {
    tracking_number: trackingNumber,
    carrier,
  });
  return adaptOrder(data);
}

export async function requestReturn(
  orderId: string,
  orderItemId: number,
  reason: string,
): Promise<void> {
  await api.post(`/orders/${orderId}/returns`, { order_item_id: orderItemId, reason });
}
