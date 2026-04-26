"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, ShieldOff, Package } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCustomerQuery, useCustomerOrdersQuery, useToggleBlockMutation } from "@/hooks/useCustomers";

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

function formatNPR(n: number) {
  return `NPR ${n.toLocaleString("en-NP")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NP", { year: "numeric", month: "short", day: "numeric" });
}

export default function CustomerDetailPage({ params }: PageProps<"/dashboard/customers/[id]">) {
  const { id } = use(params);
  const { data: customer, isLoading: loadingCustomer } = useCustomerQuery(id);
  const { data: orders = [], isLoading: loadingOrders } = useCustomerOrdersQuery(id);
  const toggle = useToggleBlockMutation(id);

  if (loadingCustomer) {
    return (
      <div className="max-w-2xl">
        <div className="h-6 w-32 bg-bg-subtle rounded animate-pulse mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-bg-subtle animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="max-w-2xl">
        <Link href="/dashboard/customers" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text mb-6">
          <ArrowLeft size={14} /> Back to Customers
        </Link>
        <p className="text-sm text-text-muted">Customer not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/customers" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text mb-6 w-fit">
        <ArrowLeft size={14} /> Back to Customers
      </Link>

      {/* Profile card */}
      <div className="rounded-xl border border-border bg-bg p-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-text">{customer.name}</h1>
            <p className="text-sm text-text-muted mt-0.5">{customer.email}</p>
            {customer.phone && <p className="text-sm text-text-muted">{customer.phone}</p>}
            <p className="text-xs text-text-muted mt-1">Joined {formatDate(customer.createdAt)}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${
              customer.isBlocked ? "bg-error-light text-error" : "bg-success-light text-success"
            }`}>
              {customer.isBlocked ? "Blocked" : "Active"}
            </span>
            <Button
              size="sm"
              variant={customer.isBlocked ? "outline" : "danger"}
              isLoading={toggle.isPending}
              onClick={() => toggle.mutate(!customer.isBlocked)}
            >
              {customer.isBlocked ? <><Shield size={13} /> Unblock</> : <><ShieldOff size={13} /> Block</>}
            </Button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-text-muted">Total Orders</p>
            <p className="text-lg font-bold text-text">{customer.orderCount}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Total Spent</p>
            <p className="text-lg font-bold text-text">{formatNPR(customer.totalSpent)}</p>
          </div>
        </div>
      </div>

      {/* Order history */}
      <h2 className="text-base font-semibold text-text mb-3">Order History</h2>

      {loadingOrders && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-bg-subtle animate-pulse" />
          ))}
        </div>
      )}

      {!loadingOrders && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-border rounded-xl">
          <Package size={28} className="text-text-disabled mb-2" />
          <p className="text-sm text-text-muted">No orders from this customer</p>
        </div>
      )}

      {!loadingOrders && orders.length > 0 && (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="block rounded-xl border border-border bg-bg p-4 hover:bg-bg-subtle transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-text">Order #{order.id}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[order.status] ?? "bg-bg-subtle text-text-muted"}`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{formatDate(order.createdAt)}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {order.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
                  </p>
                </div>
                <p className="text-sm font-bold text-text shrink-0">{formatNPR(order.total)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
