"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Search, ShieldOff, ShieldCheck } from "lucide-react";
import { adminGetCustomers, adminBlockCustomer, adminUnblockCustomer } from "@/lib/api/admin/customers";
import { queryKeys } from "@/lib/queries";
import Button from "@/components/ui/Button";

function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString("en-NP")}`;
}

export default function AdminCustomersPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const { data: customers = [], isLoading } = useQuery({
    queryKey: queryKeys.adminCustomers(q),
    queryFn: () => adminGetCustomers(q || undefined),
  });

  const blockMutation = useMutation({
    mutationFn: (id: string) => adminBlockCustomer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminCustomers"] }),
  });
  const unblockMutation = useMutation({
    mutationFn: (id: string) => adminUnblockCustomer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminCustomers"] }),
  });

  return (
    <div className="p-8 max-w-7xl">
      <h1 className="text-2xl font-bold text-text mb-6">Customers</h1>

      <div className="mb-4 max-w-sm">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full h-9 pl-9 pr-3 text-sm bg-bg border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-bg-subtle rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-subtle text-text-muted text-xs">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Email</th>
                <th className="text-center px-4 py-3 font-medium hidden lg:table-cell">Orders</th>
                <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">Spent</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-bg-subtle transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/customers/${c.id}`} className="font-medium text-text hover:text-primary transition-colors">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-muted hidden md:table-cell">{c.email}</td>
                  <td className="px-4 py-3 text-center text-text-muted hidden lg:table-cell">{c.orderCount}</td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell font-medium text-text">{formatNPR(c.totalSpent)}</td>
                  <td className="px-4 py-3 text-center">
                    {c.isBlocked ? (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-error-light text-error">Blocked</span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-success-light text-success">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {c.isBlocked ? (
                      <Button
                        variant="outline"
                        size="sm"
                        isLoading={unblockMutation.isPending}
                        onClick={() => unblockMutation.mutate(c.id)}
                        className="text-success border-success hover:bg-success-light"
                      >
                        <ShieldCheck size={13} /> Unblock
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        isLoading={blockMutation.isPending}
                        onClick={() => blockMutation.mutate(c.id)}
                        className="text-error border-error hover:bg-error-light"
                      >
                        <ShieldOff size={13} /> Block
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-text-muted">No customers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
