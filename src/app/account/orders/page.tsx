"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useOrdersQuery } from "@/hooks/useOrders";

function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString("en-NP")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NP", { year: "numeric", month: "short", day: "numeric" });
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-success-light text-success",
  cancelled: "bg-error-light text-error",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Order placed — waiting for seller to confirm",
  confirmed: "Confirmed — seller will call you shortly",
  out_for_delivery: "On the way to you",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_BADGE: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrdersPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s._isInitialized);
  const { data: orders = [], isLoading } = useOrdersQuery();

  useEffect(() => {
    if (isInitialized && !user) router.replace("/account/login");
  }, [isInitialized, user, router]);

  if (!isInitialized || !user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/account" className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-bg-subtle transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text">My Orders</h1>
          <p className="mt-0.5 text-sm text-text-muted">Track and view all your orders</p>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-bg-subtle animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <div className="text-center py-20">
          <Package size={44} className="mx-auto mb-4 text-border-strong" />
          <p className="text-base font-semibold text-text">No orders yet</p>
          <p className="text-sm text-text-muted mt-1 mb-6">Your orders will appear here once you place them.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Shop Now
          </Link>
        </div>
      )}

      {!isLoading && orders.length > 0 && (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-text">Order #{order.id}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {formatDate(order.createdAt)} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">{order.deliveryAddress}</p>
                  <p className="text-xs text-text-muted mt-1 italic">
                    {STATUS_LABELS[order.status] ?? order.status}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] ?? "bg-bg-subtle text-text-muted"}`}>
                    {STATUS_BADGE[order.status] ?? order.status}
                  </span>
                  <span className="text-sm font-bold text-text">{formatNPR(order.total)}</span>
                </div>
              </div>
              <p className="text-xs text-text-muted mt-2">
                {order.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
              </p>
              {order.status === "cancelled" && order.rejectionReason && (
                <p className="mt-2 text-xs text-error bg-error-light rounded-md px-3 py-2">
                  Reason: {order.rejectionReason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
