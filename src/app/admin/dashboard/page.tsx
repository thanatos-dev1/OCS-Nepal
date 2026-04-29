"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendingUp, ShoppingBag, AlertTriangle, Package } from "lucide-react";
import {
  getRevenue,
  getOrdersByStatus,
  getTopProducts,
  getRecentOrders,
  getLowStock,
} from "@/lib/api/admin/analytics";
import { queryKeys } from "@/lib/queries";
import { formatNPR } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500",
  confirmed: "bg-blue-500",
  out_for_delivery: "bg-purple-500",
  delivered: "bg-success",
  cancelled: "bg-error",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 flex items-center gap-4 ${accent ? "bg-primary text-white border-primary" : "bg-bg-card border-border"}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent ? "bg-white/20" : "bg-primary/10"}`}>
        <Icon size={20} className={accent ? "text-white" : "text-primary"} />
      </div>
      <div>
        <p className={`text-xs font-medium mb-0.5 ${accent ? "text-white/70" : "text-text-muted"}`}>{label}</p>
        <p className={`text-xl font-bold ${accent ? "text-white" : "text-text"}`}>{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: revenue } = useQuery({
    queryKey: queryKeys.adminRevenue,
    queryFn: getRevenue,
  });

  const { data: ordersByStatus = [] } = useQuery({
    queryKey: queryKeys.adminOrdersByStatus,
    queryFn: getOrdersByStatus,
  });

  const { data: topProducts = [] } = useQuery({
    queryKey: queryKeys.adminTopProducts,
    queryFn: () => getTopProducts(5),
  });

  const { data: recentOrders = [] } = useQuery({
    queryKey: queryKeys.adminRecentOrders,
    queryFn: getRecentOrders,
  });

  const { data: lowStock = [] } = useQuery({
    queryKey: queryKeys.adminLowStock,
    queryFn: getLowStock,
  });

  const totalOrders = ordersByStatus.reduce((s, o) => s + o.count, 0);

  return (
    <div className="p-8 max-w-7xl">
      <h1 className="text-2xl font-bold text-text mb-8">Dashboard</h1>

      {/* Revenue cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Today's Revenue"
          value={formatNPR(revenue?.today ?? 0)}
          icon={TrendingUp}
          accent
        />
        <StatCard
          label="Last 7 Days"
          value={formatNPR(revenue?.last7Days ?? 0)}
          icon={TrendingUp}
        />
        <StatCard
          label="Last 30 Days"
          value={formatNPR(revenue?.last30Days ?? 0)}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Orders by status */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-text mb-4 flex items-center gap-2">
            <ShoppingBag size={16} className="text-primary" /> Orders by Status
          </h2>
          <div className="space-y-3">
            {ordersByStatus.map((item) => {
              const pct = totalOrders > 0 ? (item.count / totalOrders) * 100 : 0;
              return (
                <div key={item.status}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-text-muted">{STATUS_LABELS[item.status] ?? item.status}</span>
                    <span className="font-semibold text-text">{item.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-bg-subtle overflow-hidden">
                    <div
                      className={`h-full rounded-full ${STATUS_COLORS[item.status] ?? "bg-border-strong"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {ordersByStatus.length === 0 && (
              <p className="text-sm text-text-muted text-center py-4">No order data</p>
            )}
          </div>
        </div>

        {/* Low stock alert */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-text mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-error" /> Low Stock Alerts
          </h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">All products well stocked</p>
          ) : (
            <div className="space-y-2">
              {lowStock.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-sm p-2 rounded-lg bg-error-light border border-error/15"
                >
                  <span className="font-medium text-text truncate flex-1 mr-2">{p.name}</span>
                  <span className="text-error font-bold shrink-0">
                    {p.stock}/{p.lowStockThreshold} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-text mb-4 flex items-center gap-2">
            <Package size={16} className="text-primary" /> Top 5 Products
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-muted text-xs border-b border-border">
                <th className="text-left pb-2 font-medium">Product</th>
                <th className="text-right pb-2 font-medium">Units Sold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topProducts.map((p) => (
                <tr key={p.id}>
                  <td className="py-2.5 text-text truncate max-w-40">{p.name}</td>
                  <td className="py-2.5 text-right font-medium text-text">{p.unitsSold}</td>
                </tr>
              ))}
              {topProducts.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-text-muted">No data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent orders */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-text mb-4 flex items-center gap-2">
            <ShoppingBag size={16} className="text-primary" /> Recent Orders
          </h2>
          <div className="space-y-2">
            {recentOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="font-medium text-text">#{o.id}</p>
                  <p className="text-xs text-text-muted">{o.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-text">{formatNPR(o.total)}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                    o.status === "delivered" ? "bg-success-light text-success" :
                    o.status === "cancelled" ? "bg-error-light text-error" :
                    "bg-bg-subtle text-text-muted"
                  }`}>
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="text-sm text-text-muted text-center py-4">No recent orders</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
