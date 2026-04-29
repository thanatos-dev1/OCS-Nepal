"use client";

import { useState } from "react";
import { Package, Check, X, Truck, PackageCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import {
  useAllOrdersQuery,
  useConfirmOrderMutation,
  useOutForDeliveryMutation,
  useDeliverOrderMutation,
  useRejectOrderMutation,
} from "@/hooks/useOrders";
import type { Order } from "@/lib/api/types";
import { formatNPR } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

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

function OrderRow({ order }: { order: Order }) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const confirm = useConfirmOrderMutation();
  const outForDelivery = useOutForDeliveryMutation();
  const deliver = useDeliverOrderMutation();
  const reject = useRejectOrderMutation();

  function handleReject() {
    if (!reason.trim()) return;
    reject.mutate({ id: order.id, reason: reason.trim() }, {
      onSuccess: () => { setRejectOpen(false); setReason(""); },
    });
  }

  return (
    <div className="border border-border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-text">Order #{order.id}</p>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLES[order.status] ?? "bg-bg-subtle text-text-muted"}`}>
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-0.5">{formatDate(order.createdAt)}</p>
          {order.user && (
            <p className="text-xs text-text-muted mt-0.5">
              {order.user.name} · {order.user.email}
            </p>
          )}
          <p className="text-xs text-text-muted mt-0.5">{order.deliveryAddress} · {order.phone}</p>
          <p className="text-xs text-text-muted mt-1">
            {order.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
          </p>
          {order.note && <p className="text-xs text-text-muted mt-0.5">Note: {order.note}</p>}
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-text">{formatNPR(order.total)}</p>
          <p className="text-xs text-text-muted">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {order.status === "pending" && (
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="primary" isLoading={confirm.isPending} onClick={() => confirm.mutate(order.id)}>
            <Check size={14} /> Confirm
          </Button>
          <Button size="sm" variant="danger" onClick={() => setRejectOpen((v) => !v)} disabled={reject.isPending}>
            <X size={14} /> Reject
          </Button>
        </div>
      )}

      {order.status === "confirmed" && (
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="primary" isLoading={outForDelivery.isPending} onClick={() => outForDelivery.mutate(order.id)}>
            <Truck size={14} /> Out for Delivery
          </Button>
          <Button size="sm" variant="danger" onClick={() => setRejectOpen((v) => !v)} disabled={reject.isPending}>
            <X size={14} /> Cancel
          </Button>
        </div>
      )}

      {order.status === "out_for_delivery" && (
        <div className="flex gap-2">
          <Button size="sm" variant="primary" isLoading={deliver.isPending} onClick={() => deliver.mutate(order.id)}>
            <PackageCheck size={14} /> Mark Delivered
          </Button>
        </div>
      )}

      {rejectOpen && (
        <div className="flex flex-col gap-2">
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for cancellation…"
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

      {order.status === "cancelled" && order.rejectionReason && (
        <p className="text-xs text-error bg-error-light rounded-md px-3 py-2">
          Reason: {order.rejectionReason}
        </p>
      )}
    </div>
  );
}

export default function DashboardOrdersPage() {
  const { data: orders = [], isLoading } = useAllOrdersQuery();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Package size={20} className="text-primary" />
        <h1 className="text-xl font-bold text-text">Orders</h1>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-bg-subtle animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <div className="text-center py-16">
          <Package size={40} className="mx-auto mb-3 text-border-strong" />
          <p className="text-base font-semibold text-text">No orders yet</p>
          <p className="text-sm text-text-muted mt-1">Orders will appear here once customers place them.</p>
        </div>
      )}

      {!isLoading && orders.length > 0 && (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
