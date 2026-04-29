"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { adminGetCustomer, adminGetCustomerOrders } from "@/lib/api/admin/customers";
import { queryKeys } from "@/lib/queries";

function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString("en-IN")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-success-light text-success",
  cancelled: "bg-error-light text-error",
};

export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: customer } = useQuery({
    queryKey: queryKeys.customer(id),
    queryFn: () => adminGetCustomer(id),
  });

  const { data: orders = [] } = useQuery({
    queryKey: queryKeys.customerOrders(id),
    queryFn: () => adminGetCustomerOrders(id),
  });

  if (!customer) return null;

  return (
    <div className="p-8 max-w-4xl">
      <Link href="/admin/customers" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Customers
      </Link>

      <div className="bg-bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-text">{customer.name}</h1>
            <p className="text-sm text-text-muted">{customer.email}</p>
            {customer.phone && <p className="text-sm text-text-muted">{customer.phone}</p>}
          </div>
          {customer.isBlocked && (
            <span className="px-2.5 py-1 text-xs font-bold bg-error-light text-error rounded-full">Blocked</span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-text-muted">Orders</p>
            <p className="text-xl font-bold text-text">{customer.orderCount}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Total Spent</p>
            <p className="text-xl font-bold text-text">{formatNPR(customer.totalSpent)}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Joined</p>
            <p className="text-sm font-medium text-text">{formatDate(customer.createdAt)}</p>
          </div>
        </div>
      </div>

      <h2 className="font-semibold text-text mb-3">Order History</h2>
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-subtle text-text-muted text-xs">
              <th className="text-left px-4 py-3 font-medium">Order</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-bg-subtle">
                <td className="px-4 py-3 font-medium text-text">#{o.id}</td>
                <td className="px-4 py-3 text-text-muted">{formatDate(o.createdAt)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[o.status] ?? "bg-bg-subtle text-text-muted"}`}>
                    {o.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-text">{formatNPR(o.total)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={4} className="text-center py-8 text-text-muted">No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
