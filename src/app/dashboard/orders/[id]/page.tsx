"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Check, X, Truck, PackageCheck,
  MapPin, Phone, MessageSquare, Package,
} from "lucide-react";
import Button from "@/components/ui/Button";
import {
  useAllOrdersQuery,
  useConfirmOrderMutation,
  useOutForDeliveryMutation,
  useDeliverOrderMutation,
  useRejectOrderMutation,
  useUpdateTrackingMutation,
} from "@/hooks/useOrders";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-success-light text-success",
  cancelled: "bg-error-light text-error",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STEPS = ["pending", "confirmed", "out_for_delivery", "delivered"] as const;

function formatNPR(n: number) {
  return `NPR ${n.toLocaleString("en-IN")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function StatusTimeline({ status }: { status: string }) {
  const isCancelled = status === "cancelled";
  const currentStep = STEPS.indexOf(status as typeof STEPS[number]);

  return (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((step, i) => {
        const done = isCancelled ? false : i <= currentStep;
        const active = !isCancelled && i === currentStep;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className={`flex flex-col items-center gap-1 ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                isCancelled
                  ? "border-error bg-error-light text-error"
                  : done
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-bg text-text-muted"
              }`}>
                {isCancelled ? <X size={12} /> : done ? <Check size={12} /> : i + 1}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${
                active ? "text-primary" : done ? "text-text" : "text-text-muted"
              }`}>
                {STATUS_LABELS[step]}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-4 ${
                !isCancelled && i < currentStep ? "bg-primary" : "bg-border"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: orders = [], isLoading } = useAllOrdersQuery();
  const order = orders.find((o) => o.id === id);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [tracking, setTracking] = useState("");
  const [trackingOpen, setTrackingOpen] = useState(false);

  const confirm = useConfirmOrderMutation();
  const outForDelivery = useOutForDeliveryMutation();
  const deliver = useDeliverOrderMutation();
  const reject = useRejectOrderMutation();
  const updateTrack = useUpdateTrackingMutation(id);

  if (isLoading) {
    return (
      <div className="max-w-2xl">
        <div className="h-5 w-28 bg-bg-subtle rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-bg-subtle animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl">
        <Link href="/dashboard/orders" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text mb-6">
          <ArrowLeft size={14} /> Back to Orders
        </Link>
        <p className="text-sm text-text-muted">Order not found.</p>
      </div>
    );
  }

  function handleReject() {
    if (!reason.trim()) return;
    reject.mutate({ id: order!.id, reason: reason.trim() }, {
      onSuccess: () => { setRejectOpen(false); setReason(""); },
    });
  }

  function handleTracking() {
    if (!tracking.trim()) return;
    updateTrack.mutate({ trackingNumber: tracking.trim() }, {
      onSuccess: () => { setTrackingOpen(false); setTracking(""); },
    });
  }

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/orders" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text mb-6 w-fit">
        <ArrowLeft size={14} /> Back to Orders
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-text">Order #{order.id}</h1>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLES[order.status] ?? "bg-bg-subtle text-text-muted"}`}>
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>
          <p className="text-sm text-text-muted mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <p className="text-xl font-bold text-text">{formatNPR(order.total)}</p>
      </div>

      {/* Status timeline */}
      <StatusTimeline status={order.status} />

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap mb-6">
        {order.status === "pending" && (
          <>
            <Button size="sm" variant="primary" isLoading={confirm.isPending} onClick={() => confirm.mutate(order.id)}>
              <Check size={14} /> Confirm Order
            </Button>
            <Button size="sm" variant="danger" onClick={() => setRejectOpen((v) => !v)}>
              <X size={14} /> Reject
            </Button>
          </>
        )}
        {order.status === "confirmed" && (
          <>
            <Button size="sm" variant="primary" isLoading={outForDelivery.isPending} onClick={() => outForDelivery.mutate(order.id)}>
              <Truck size={14} /> Out for Delivery
            </Button>
            <Button size="sm" variant="outline" onClick={() => setTrackingOpen((v) => !v)}>
              Add Tracking
            </Button>
            <Button size="sm" variant="danger" onClick={() => setRejectOpen((v) => !v)}>
              <X size={14} /> Cancel
            </Button>
          </>
        )}
        {order.status === "out_for_delivery" && (
          <>
            <Button size="sm" variant="primary" isLoading={deliver.isPending} onClick={() => deliver.mutate(order.id)}>
              <PackageCheck size={14} /> Mark Delivered
            </Button>
            <Button size="sm" variant="outline" onClick={() => setTrackingOpen((v) => !v)}>
              {order.trackingNumber ? "Update Tracking" : "Add Tracking"}
            </Button>
          </>
        )}
      </div>

      {/* Tracking input */}
      {trackingOpen && (
        <div className="rounded-xl border border-border p-4 mb-4 flex flex-col gap-2">
          <p className="text-sm font-medium text-text">Tracking Number</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="e.g. NP123456789"
              className="flex-1 rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 hover:border-border-strong transition-colors"
            />
            <Button size="sm" isLoading={updateTrack.isPending} onClick={handleTracking}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => { setTrackingOpen(false); setTracking(""); }}>Cancel</Button>
          </div>
          {order.trackingNumber && (
            <p className="text-xs text-text-muted">Current: <span className="font-mono text-text">{order.trackingNumber}</span></p>
          )}
        </div>
      )}

      {/* Rejection input */}
      {rejectOpen && (
        <div className="rounded-xl border border-border p-4 mb-4 flex flex-col gap-2">
          <p className="text-sm font-medium text-text">Reason for cancellation</p>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Let the customer know why…"
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text resize-none focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
          />
          <div className="flex gap-2">
            <Button size="sm" variant="danger" isLoading={reject.isPending} onClick={handleReject}>
              Confirm Cancellation
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setRejectOpen(false); setReason(""); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Cancellation reason */}
      {order.status === "cancelled" && order.rejectionReason && (
        <div className="rounded-xl bg-error-light border border-error/20 px-4 py-3 mb-4">
          <p className="text-xs font-semibold text-error mb-0.5">Cancellation Reason</p>
          <p className="text-sm text-error">{order.rejectionReason}</p>
        </div>
      )}

      {/* Customer info */}
      {order.user && (
        <div className="rounded-xl border border-border p-4 mb-4">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Customer</p>
          <Link
            href={`/dashboard/customers/${order.user.id}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {order.user.name}
          </Link>
          <p className="text-sm text-text-muted">{order.user.email}</p>
        </div>
      )}

      {/* Delivery details */}
      <div className="rounded-xl border border-border p-4 mb-4 flex flex-col gap-2">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Delivery Details</p>
        <div className="flex items-start gap-2 text-sm text-text">
          <MapPin size={14} className="text-text-muted mt-0.5 shrink-0" />
          {order.deliveryAddress}
        </div>
        <div className="flex items-center gap-2 text-sm text-text">
          <Phone size={14} className="text-text-muted shrink-0" />
          {order.phone}
        </div>
        {order.note && (
          <div className="flex items-start gap-2 text-sm text-text-muted">
            <MessageSquare size={14} className="mt-0.5 shrink-0" />
            {order.note}
          </div>
        )}
        {order.trackingNumber && (
          <div className="flex items-center gap-2 text-sm text-text">
            <Truck size={14} className="text-text-muted shrink-0" />
            Tracking: <span className="font-mono font-semibold">{order.trackingNumber}</span>
          </div>
        )}
      </div>

      {/* Order items */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 bg-bg-subtle border-b border-border">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
            Items ({order.items.length})
          </p>
        </div>
        <div className="divide-y divide-border">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-bg-subtle border border-border flex items-center justify-center">
                  <Package size={14} className="text-text-muted" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text">{item.name}</p>
                  <p className="text-xs text-text-muted">×{item.qty} · {formatNPR(item.price)} each</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-text">{formatNPR(item.price * item.qty)}</p>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 bg-bg-subtle border-t border-border flex justify-between">
          <p className="text-sm font-semibold text-text">Total</p>
          <p className="text-sm font-bold text-text">{formatNPR(order.total)}</p>
        </div>
      </div>
    </div>
  );
}
