"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Ticket } from "lucide-react";
import Button from "@/components/ui/Button";
import CouponModal from "@/components/admin/CouponModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useCouponsQuery, useSaveCouponMutation, useDeleteCouponMutation } from "@/hooks/useCoupons";
import type { Coupon } from "@/lib/api/types";
import { formatNPR } from "@/lib/utils";

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const TableSkeleton = () => (
  <div className="rounded-xl border border-border overflow-hidden">
    <table className="w-full text-sm">
      <thead className="bg-bg-subtle text-text-muted">
        <tr>
          {["Code", "Type", "Value", "Min Order", "Uses", "Expires", "Status", ""].map((h, i) => (
            <th key={i} className="text-left px-4 py-3 font-medium">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <tr key={i} className="bg-bg">
            {Array.from({ length: 8 }).map((_, j) => (
              <td key={j} className="px-4 py-3">
                <div className="h-3.5 w-16 bg-bg-subtle rounded animate-pulse" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function AdminCouponsPage() {
  const [modal, setModal] = useState<{ open: boolean; coupon: Coupon | null }>({ open: false, coupon: null });
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);

  const { data: coupons = [], isLoading } = useCouponsQuery();
  const saveMutation = useSaveCouponMutation(modal.coupon);
  const deleteMutation = useDeleteCouponMutation();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text">Coupons</h1>
          <p className="text-sm text-text-muted mt-0.5">{coupons.length} total</p>
        </div>
        <Button size="sm" onClick={() => setModal({ open: true, coupon: null })}>
          <Plus size={15} /> New Coupon
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Ticket size={32} className="text-text-disabled mb-3" />
          <p className="text-sm font-medium text-text">No coupons yet</p>
          <p className="text-xs text-text-muted mt-1">Create coupon codes for discounts and promotions</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-subtle text-text-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Code</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Value</th>
                <th className="text-left px-4 py-3 font-medium">Min Order</th>
                <th className="text-left px-4 py-3 font-medium">Uses</th>
                <th className="text-left px-4 py-3 font-medium">Expires</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map((c) => (
                <tr key={c.id} className="bg-bg hover:bg-bg-subtle transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-text">{c.code}</td>
                  <td className="px-4 py-3 text-text-muted capitalize">{c.type}</td>
                  <td className="px-4 py-3 font-semibold text-text">
                    {c.type === "percent" ? `${c.value}%` : formatNPR(c.value)}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {c.minOrder ? formatNPR(c.minOrder) : "—"}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{formatDate(c.expiresAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                      c.isActive ? "bg-success-light text-success" : "bg-bg-subtle text-text-muted"
                    }`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setModal({ open: true, coupon: c })}
                        className="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-primary-light transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="p-1.5 rounded-md text-text-muted hover:text-error hover:bg-error-light transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <CouponModal
          initial={modal.coupon}
          onSave={(input) => saveMutation.mutateAsync(input)}
          onClose={() => setModal({ open: false, coupon: null })}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete coupon?"
          description={`Coupon "${deleteTarget.code}" will be permanently removed.`}
          loading={deleteMutation.isPending}
          onConfirm={async () => {
            await deleteMutation.mutateAsync(parseInt(deleteTarget.id, 10));
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
