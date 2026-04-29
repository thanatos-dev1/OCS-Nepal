"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Search, ChevronRight, ShieldOff, Shield } from "lucide-react";
import { useCustomersQuery, useToggleBlockMutation } from "@/hooks/useCustomers";
import type { Customer } from "@/lib/api/types";
import { formatNPR } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

function CustomerRow({ customer }: { customer: Customer }) {
  const toggle = useToggleBlockMutation(customer.id);

  return (
    <tr className="bg-bg hover:bg-bg-subtle transition-colors">
      <td className="px-4 py-3">
        <div>
          <p className="font-medium text-text">{customer.name}</p>
          <p className="text-xs text-text-muted">{customer.email}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-text-muted">{customer.phone ?? "—"}</td>
      <td className="px-4 py-3 text-text-muted">{formatDate(customer.createdAt)}</td>
      <td className="px-4 py-3 text-text">{customer.orderCount}</td>
      <td className="px-4 py-3 font-medium text-text">{formatNPR(customer.totalSpent)}</td>
      <td className="px-4 py-3">
        <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
          customer.isBlocked
            ? "bg-error-light text-error"
            : "bg-success-light text-success"
        }`}>
          {customer.isBlocked ? "Blocked" : "Active"}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => toggle.mutate(!customer.isBlocked)}
            disabled={toggle.isPending}
            title={customer.isBlocked ? "Unblock" : "Block"}
            className={`p-1.5 rounded-md transition-colors disabled:opacity-50 ${
              customer.isBlocked
                ? "text-text-muted hover:text-success hover:bg-success-light"
                : "text-text-muted hover:text-error hover:bg-error-light"
            }`}
          >
            {customer.isBlocked ? <Shield size={14} /> : <ShieldOff size={14} />}
          </button>
          <Link
            href={`/dashboard/customers/${customer.id}`}
            className="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-primary-light transition-colors"
          >
            <ChevronRight size={14} />
          </Link>
        </div>
      </td>
    </tr>
  );
}

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const { data: customers = [], isLoading } = useCustomersQuery();

  const filtered = search.trim()
    ? customers.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
      )
    : customers;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text">Customers</h1>
          <p className="text-sm text-text-muted mt-0.5">{customers.length} total</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="pl-8 pr-3 py-1.5 text-sm rounded-md border border-border bg-bg text-text placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 hover:border-border-strong transition-colors w-64"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-subtle text-text-muted">
              <tr>
                {["Customer", "Phone", "Joined", "Orders", "Total Spent", "Status", ""].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="bg-bg">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3.5 w-20 bg-bg-subtle rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users size={32} className="text-text-disabled mb-3" />
          <p className="text-sm font-medium text-text">
            {search ? "No customers match your search" : "No customers yet"}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-subtle text-text-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Phone</th>
                <th className="text-left px-4 py-3 font-medium">Joined</th>
                <th className="text-left px-4 py-3 font-medium">Orders</th>
                <th className="text-left px-4 py-3 font-medium">Total Spent</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <CustomerRow key={c.id} customer={c} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
