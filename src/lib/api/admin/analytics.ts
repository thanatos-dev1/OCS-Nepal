import adminApi from "../adminClient";

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
  revenue: number;
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
  const { data } = await adminApi.get<{
    today: number;
    last_7_days: number;
    last_30_days: number;
  }>("/api/v1/admin/analytics/revenue");
  return {
    today: data.today,
    last7Days: data.last_7_days,
    last30Days: data.last_30_days,
  };
}

export async function getOrdersByStatus(): Promise<OrdersByStatus> {
  const { data } = await adminApi.get<{ status: string; count: number }[]>(
    "/api/v1/admin/analytics/orders-by-status",
  );
  return Array.isArray(data) ? data : [];
}

export async function getTopProducts(limit = 5): Promise<TopProduct[]> {
  const { data } = await adminApi.get<
    { id: number; name: string; revenue: number; units_sold: number }[]
  >(`/api/v1/admin/analytics/top-products?limit=${limit}`);
  return Array.isArray(data)
    ? data.map((p) => ({ id: p.id, name: p.name, revenue: p.revenue, unitsSold: p.units_sold }))
    : [];
}

export async function getRecentOrders(): Promise<RecentOrder[]> {
  const { data } = await adminApi.get<
    { id: number; status: string; total: number; created_at: string; customer_name: string }[]
  >("/api/v1/admin/analytics/recent-orders");
  return Array.isArray(data)
    ? data.map((o) => ({
        id: o.id,
        status: o.status,
        total: o.total,
        createdAt: o.created_at,
        customerName: o.customer_name,
      }))
    : [];
}

export async function getLowStock(): Promise<LowStockProduct[]> {
  const { data } = await adminApi.get<
    { id: number; name: string; slug: string; stock: number; low_stock_threshold: number }[]
  >("/api/v1/admin/analytics/low-stock");
  return Array.isArray(data)
    ? data.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        stock: p.stock,
        lowStockThreshold: p.low_stock_threshold,
      }))
    : [];
}
