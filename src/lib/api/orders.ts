import api from "./client";
import type { Order, OrderItem, OrderStatusLog, OrderItemSnapshot } from "./types";

type ApiOrderItemSnapshot = {
  name: string;
  brand: string;
  price: number;
  image_url: string;
};

type ApiOrderItem = {
  ID: number;
  ProductID: number;
  ProductName: string;
  Quantity: number;
  Price: number;
  Snapshot?: ApiOrderItemSnapshot;
};

type ApiStatusLog = {
  FromStatus: string;
  ToStatus: string;
  Note?: string;
  CreatedAt: string;
};

type ApiUser = { ID: number; Name: string; Email: string };

export type ApiOrder = {
  ID: number;
  CreatedAt: string;
  Status: string;
  Subtotal: number;
  ShippingAmount: number;
  Total: number;
  DeliveryAddress: string;
  Phone: string;
  Note?: string;
  RejectionReason?: string;
  TrackingNumber?: string | null;
  PaymentMethod?: string;
  GuestEmail?: string | null;
  ShippingAddressID?: number | null;
  CouponCode?: string;
  DiscountAmount?: number;
  StatusLogs?: ApiStatusLog[];
  Items?: ApiOrderItem[];
  User?: ApiUser;
};

function adaptItem(i: ApiOrderItem): OrderItem {
  let snapshot: OrderItemSnapshot | undefined;
  if (i.Snapshot) {
    snapshot = {
      name: i.Snapshot.name,
      brand: i.Snapshot.brand,
      price: i.Snapshot.price,
      imageUrl: i.Snapshot.image_url,
    };
  }
  return {
    id: String(i.ID),
    productId: String(i.ProductID),
    productName: i.ProductName,
    name: i.ProductName,
    price: i.Price,
    qty: i.Quantity,
    snapshot,
  };
}

export function adaptOrder(o: ApiOrder): Order {
  const statusLogs: OrderStatusLog[] = (o.StatusLogs ?? []).map((l) => ({
    fromStatus: l.FromStatus,
    toStatus: l.ToStatus,
    note: l.Note,
    createdAt: l.CreatedAt,
  }));

  return {
    id: String(o.ID),
    status: o.Status as Order["status"],
    total: o.Total,
    subtotal: o.Subtotal ?? o.Total,
    shippingAmount: o.ShippingAmount ?? 0,
    createdAt: o.CreatedAt,
    deliveryAddress: o.DeliveryAddress,
    phone: o.Phone,
    note: o.Note,
    rejectionReason: o.RejectionReason,
    trackingNumber: o.TrackingNumber ?? undefined,
    guestEmail: o.GuestEmail ?? undefined,
    shippingAddressId: o.ShippingAddressID ?? undefined,
    couponCode: o.CouponCode,
    discountAmount: o.DiscountAmount,
    statusLogs,
    items: (o.Items ?? []).map(adaptItem),
    user: o.User ? { id: o.User.ID, name: o.User.Name, email: o.User.Email } : undefined,
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
  deliveryAddress: string;
  phone: string;
  items: { product_id: number; quantity: number }[];
  couponCode?: string;
  note?: string;
  paymentMethod?: string;
}): Promise<Order> {
  const { data } = await api.post<ApiOrder>("/orders/guest", {
    guest_email: payload.guestEmail,
    delivery_address: payload.deliveryAddress,
    phone: payload.phone,
    items: payload.items,
    coupon_code: payload.couponCode,
    note: payload.note,
    payment_method: payload.paymentMethod ?? "cod",
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

type ApiMyReturn = {
  ID: number;
  OrderID: number;
  OrderItemID: number;
  Reason: string;
  Status: "pending" | "approved" | "rejected";
  Notes?: string;
  CreatedAt: string;
  ResolvedAt?: string | null;
};

export type MyReturn = {
  id: number;
  orderId: string;
  orderItemId: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  createdAt: string;
  resolvedAt?: string | null;
};

export async function getMyReturns(): Promise<MyReturn[]> {
  const { data } = await api.get<ApiMyReturn[]>("/me/returns");
  return Array.isArray(data)
    ? data.map((r) => ({
        id: r.ID,
        orderId: String(r.OrderID),
        orderItemId: r.OrderItemID,
        reason: r.Reason,
        status: r.Status,
        notes: r.Notes,
        createdAt: r.CreatedAt,
        resolvedAt: r.ResolvedAt,
      }))
    : [];
}
