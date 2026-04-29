import adminApi from "../adminClient";
import { adaptOrder, type ApiOrder } from "../orders";
import type { ApiProduct } from "../products";

export type RevenueData = {
  today: number;
  last7Days: number;
  last30Days: number;
};

export type OrdersByStatus = {
  status: string;
  count: number;
}[];

export type TopProduct = {
  id: number;
  name: string;
  unitsSold: number;
};

export type RecentOrder = {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  customerName: string;
};

export type LowStockProduct = {
  id: number;
  name: string;
  slug: string;
  stock: number;
  lowStockThreshold: number;
};

export async function getRevenue(): Promise<RevenueData> {
  const { data } = await adminApi.get<{ date: string; revenue: number }[]>(
    "/admin/analytics/revenue",
  );
  const entries = Array.isArray(data) ? data : [];

  const today = new Date().toISOString().split("T")[0];
  const d7 = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
  const d30 = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

  let todayRev = 0;
  let last7Rev = 0;
  let last30Rev = 0;

  for (const e of entries) {
    if (e.date === today) todayRev = e.revenue;
    if (e.date >= d7) last7Rev += e.revenue;
    if (e.date >= d30) last30Rev += e.revenue;
  }

  return { today: todayRev, last7Days: last7Rev, last30Days: last30Rev };
}

export async function getOrdersByStatus(): Promise<OrdersByStatus> {
  const { data } = await adminApi.get<{ status: string; count: number }[]>(
    "/admin/analytics/orders-by-status",
  );
  return Array.isArray(data) ? data : [];
}

export async function getTopProducts(limit = 5): Promise<TopProduct[]> {
  const { data } = await adminApi.get<{ product: ApiProduct; total_sold: number }[]>(
    `/admin/analytics/top-products?limit=${limit}`,
  );
  return Array.isArray(data)
    ? data.map((p) => ({
        id: p.product.ID ?? p.product.id ?? 0,
        name: p.product.Name ?? p.product.name ?? "",
        unitsSold: p.total_sold,
      }))
    : [];
}

export async function getRecentOrders(): Promise<RecentOrder[]> {
  const { data } = await adminApi.get<ApiOrder[]>("/admin/analytics/recent-orders");
  return Array.isArray(data)
    ? data.map((o) => {
        const order = adaptOrder(o);
        return {
          id: Number(order.id),
          status: order.status,
          total: order.total,
          createdAt: order.createdAt,
          customerName: order.user?.name ?? "Guest",
        };
      })
    : [];
}

export async function getLowStock(): Promise<LowStockProduct[]> {
  const { data } = await adminApi.get<ApiProduct[]>("/admin/analytics/low-stock");
  return Array.isArray(data)
    ? data.map((p) => ({
        id: p.ID ?? p.id ?? 0,
        name: p.Name ?? p.name ?? "",
        slug: p.Slug ?? p.slug ?? "",
        stock: p.Stock ?? p.stock ?? 0,
        lowStockThreshold: p.LowStockThreshold ?? p.low_stock_threshold ?? 0,
      }))
    : [];
}
