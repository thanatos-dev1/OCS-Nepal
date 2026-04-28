"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Truck, X } from "lucide-react";
import {
  adminGetOrders,
  adminConfirmOrder,
  adminOutForDelivery,
  adminDeliverOrder,
  adminRejectOrder,
  adminUpdateTracking,
} from "@/lib/api/admin/orders";
import { queryKeys } from "@/lib/queries";
import Button from "@/components/ui/Button";
import type { Order } from "@/lib/api/types";

function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString("en-NP")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NP", { dateStyle: "medium", timeStyle: "short" });
}

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-success-light text-success",
  cancelled: "bg-error-light text-error",
};

function OrderDetailDrawer({ order, onClose }: { order: Order; onClose: () => void }) {
  const qc = useQueryClient();
  const [rejectReason, setRejectReason] = useState("");
  const [trackingNum, setTrackingNum] = useState(order.trackingNumber ?? "");
  const [carrier, setCarrier] = useState("");

  const confirm = useMutation({
    mutationFn: () => adminConfirmOrder(order.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.adminOrders() }); onClose(); },
  });
  const outForDelivery = useMutation({
    mutationFn: () => adminOutForDelivery(order.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.adminOrders() }); onClose(); },
  });
  const deliver = useMutation({
    mutationFn: () => adminDeliverOrder(order.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.adminOrders() }); onClose(); },
  });
  const reject = useMutation({
    mutationFn: () => adminRejectOrder(order.id, rejectReason),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.adminOrders() }); onClose(); },
  });
  const tracking = useMutation({
    mutationFn: () => adminUpdateTracking(order.id, trackingNum, carrier || undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.adminOrders() }),
  });

  return (
    <div className="fixed inset-0 z-modal flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-bg h-full overflow-y-auto shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-text text-lg">Order #{order.id}</h2>
          <button onClick={onClose} className="p-1 text-text-muted hover:text-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-5 flex flex-col gap-5">
          {/* Items */}
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase mb-3">Items</h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-text">
                    {item.snapshot?.name ?? item.productName} ×{item.qty}
                  </span>
                  <span className="text-text font-medium">{formatNPR(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="border-t border-border pt-4 space-y-1.5 text-sm text-text-muted">
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
                <span>Discount</span>
                <span>−{formatNPR(order.discountAmount!)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-text border-t border-border pt-2">
              <span>Total</span>
              <span>{formatNPR(order.total)}</span>
            </div>
          </div>

          {/* Customer */}
          <div className="border-t border-border pt-4 text-sm">
            <h3 className="text-xs font-semibold text-text-muted uppercase mb-2">Customer</h3>
            {order.user ? (
              <>
                <p className="text-text font-medium">{order.user.name}</p>
                <p className="text-text-muted">{order.user.email}</p>
              </>
            ) : order.guestEmail ? (
              <p className="text-text-muted">{order.guestEmail} (Guest)</p>
            ) : null}
            <p className="text-text-muted mt-1">{order.phone}</p>
            <p className="text-text-muted">{order.deliveryAddress}</p>
          </div>

          {/* Status timeline */}
          {order.statusLogs.length > 0 && (
            <div className="border-t border-border pt-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase mb-3">Status History</h3>
              <div className="space-y-2">
                {order.statusLogs.map((log, i) => (
                  <div key={i} className="text-xs flex gap-2">
                    <span className="text-text-muted">{new Date(log.createdAt).toLocaleString("en-NP")}</span>
                    <span className="text-text">{log.fromStatus} → {log.toStatus}</span>
                    {log.note && <span className="text-text-muted">({log.note})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tracking */}
          <div className="border-t border-border pt-4">
            <h3 className="text-xs font-semibold text-text-muted uppercase mb-3">
              <Truck size={12} className="inline mr-1" />Tracking
            </h3>
            <div className="flex flex-col gap-2">
              <input
                value={trackingNum}
                onChange={(e) => setTrackingNum(e.target.value)}
                placeholder="Tracking number"
                className="h-9 px-3 text-sm border border-border rounded-md bg-bg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
              <input
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="Carrier (optional)"
                className="h-9 px-3 text-sm border border-border rounded-md bg-bg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
              <Button
                variant="outline"
                size="sm"
                isLoading={tracking.isPending}
                onClick={() => tracking.mutate()}
                disabled={!trackingNum.trim()}
              >
                Update Tracking
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-border pt-4 flex flex-col gap-2">
            {order.status === "pending" && (
              <Button variant="primary" size="md" isLoading={confirm.isPending} onClick={() => confirm.mutate()}>
                Confirm Order
              </Button>
            )}
            {order.status === "confirmed" && (
              <Button variant="primary" size="md" isLoading={outForDelivery.isPending} onClick={() => outForDelivery.mutate()}>
                Mark Out for Delivery
              </Button>
            )}
            {order.status === "out_for_delivery" && (
              <Button variant="primary" size="md" isLoading={deliver.isPending} onClick={() => deliver.mutate()}>
                Mark Delivered
              </Button>
            )}
            {(order.status === "pending" || order.status === "confirmed") && (
              <div className="flex flex-col gap-2">
                <input
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Rejection reason"
                  className="h-9 px-3 text-sm border border-border rounded-md bg-bg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={reject.isPending}
                  onClick={() => reject.mutate()}
                  disabled={!rejectReason.trim()}
                  className="border-error text-error hover:bg-error-light"
                >
                  Reject Order
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: queryKeys.adminOrders(activeTab === "all" ? undefined : activeTab),
    queryFn: () => adminGetOrders(activeTab === "all" ? undefined : activeTab),
  });

  return (
    <div className="p-8 max-w-7xl">
      <h1 className="text-2xl font-bold text-text mb-6">Orders</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-border pb-0">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 text-sm font-medium transition-colors rounded-t-md border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-bg-subtle rounded-lg animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-subtle text-text-muted text-xs">
                <th className="text-left px-4 py-3 font-medium">Order</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Customer</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Date</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="hover:bg-bg-subtle transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-text">#{order.id}</td>
                  <td className="px-4 py-3 text-text-muted hidden md:table-cell">
                    {order.user?.name ?? order.guestEmail ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-text-muted hidden lg:table-cell">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[order.status] ?? "bg-bg-subtle text-text-muted"}`}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-text">
                    {formatNPR(order.total)}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-text-muted">No orders</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
