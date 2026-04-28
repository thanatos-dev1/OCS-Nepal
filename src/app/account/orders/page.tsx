"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/stores/authStore";
import { useOrdersQuery, useRequestReturnMutation } from "@/hooks/useOrders";
import type { Order, OrderItem } from "@/lib/api/types";

function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString("en-NP")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-success-light text-success",
  cancelled: "bg-error-light text-error",
};

const STATUS_BADGE: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const TIMELINE_STEPS = [
  { key: "pending", label: "Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "out_for_delivery", label: "On the Way", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

const STATUS_ORDER = ["pending", "confirmed", "out_for_delivery", "delivered"];

function OrderTimeline({ order }: { order: Order }) {
  if (order.status === "cancelled") {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-error">
        <XCircle size={16} /> Order was cancelled
        {order.rejectionReason && <span className="text-text-muted">— {order.rejectionReason}</span>}
      </div>
    );
  }

  const currentIdx = STATUS_ORDER.indexOf(order.status);

  return (
    <div className="flex items-center gap-0 mt-4 mb-2">
      {TIMELINE_STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                  done ? "bg-success border-success text-white" : "bg-bg border-border text-text-disabled"
                }`}
              >
                <Icon size={14} />
              </div>
              <span className={`text-xs whitespace-nowrap ${done ? "text-success font-medium" : "text-text-disabled"}`}>
                {step.label}
              </span>
            </div>
            {idx < TIMELINE_STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 mb-5 rounded ${idx < currentIdx ? "bg-success" : "bg-border"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ReturnForm({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const requestReturn = useRequestReturnMutation();
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItemId) { setError("Select an item to return"); return; }
    if (!reason.trim()) { setError("Please provide a reason"); return; }
    setError("");
    try {
      await requestReturn.mutateAsync({
        orderId: order.id,
        orderItemId: selectedItemId,
        reason: reason.trim(),
      });
      onClose();
    } catch {
      setError("Failed to submit return request");
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <h4 className="text-sm font-semibold text-text mb-3">Request a Return</h4>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="text-xs font-medium text-text-muted mb-1.5 block">Select item</label>
          <div className="space-y-2">
            {order.items.map((item: OrderItem) => (
              <label key={item.id} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="return-item"
                  value={item.id}
                  checked={selectedItemId === parseInt(item.id, 10)}
                  onChange={() => setSelectedItemId(parseInt(item.id, 10))}
                  className="accent-primary"
                />
                <span className="text-sm text-text">
                  {item.productName} ×{item.qty}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="return-reason" className="text-xs font-medium text-text-muted mb-1.5 block">
            Reason
          </label>
          <textarea
            id="return-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe why you want to return this item…"
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-disabled resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" variant="primary" size="sm" isLoading={requestReturn.isPending}>
            Submit Return
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-text">Order #{order.id}</p>
          <p className="text-xs text-text-muted mt-0.5">
            {formatDate(order.createdAt)} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] ?? "bg-bg-subtle text-text-muted"}`}
          >
            {STATUS_BADGE[order.status] ?? order.status}
          </span>
          <span className="text-sm font-bold text-text">{formatNPR(order.total)}</span>
          <button
            type="button"
            onClick={() => { setExpanded((v) => !v); setShowReturnForm(false); }}
            className="p-1 text-text-muted hover:text-primary transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      <p className="text-xs text-text-muted mt-1.5">
        {order.items.map((i) => `${i.productName} ×${i.qty}`).join(", ")}
      </p>

      {expanded && (
        <div className="mt-4">
          <OrderTimeline order={order} />

          {/* Price breakdown */}
          <div className="mt-4 pt-4 border-t border-border text-sm flex flex-col gap-1.5 text-text-muted">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-text">{formatNPR(order.subtotal)}</span>
            </div>
            {order.shippingAmount > 0 && (
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-text">{formatNPR(order.shippingAmount)}</span>
              </div>
            )}
            {(order.discountAmount ?? 0) > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                <span>−{formatNPR(order.discountAmount!)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-text pt-1 border-t border-border">
              <span>Total</span>
              <span>{formatNPR(order.total)}</span>
            </div>
          </div>

          {/* Tracking */}
          {order.trackingNumber && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <Truck size={15} className="text-primary" />
              <span className="text-text-muted">Tracking:</span>
              <span className="font-medium text-text">{order.trackingNumber}</span>
            </div>
          )}

          {/* Return request */}
          {order.status === "delivered" && !showReturnForm && (
            <div className="mt-4 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setShowReturnForm(true)}
                className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors"
              >
                <RotateCcw size={14} /> Request a Return
              </button>
            </div>
          )}
          {showReturnForm && (
            <ReturnForm order={order} onClose={() => setShowReturnForm(false)} />
          )}
        </div>
      )}
    </div>
  );
}

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
        <Link
          href="/account"
          className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-bg-subtle transition-colors"
        >
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
          <p className="text-sm text-text-muted mt-1 mb-6">
            Your orders will appear here once you place them.
          </p>
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
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
