"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { adminGetCoupons, adminCreateCoupon, adminUpdateCoupon, adminDeleteCoupon } from "@/lib/api/admin/coupons";
import { queryKeys } from "@/lib/queries";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Coupon, CouponInput } from "@/lib/api/types";
import { formatNPR } from "@/lib/utils";

const EMPTY: CouponInput = {
  code: "",
  type: "percent",
  value: 0,
  min_order: undefined,
  max_uses: undefined,
  is_active: true,
  expires_at: undefined,
};

function CouponFormModal({
  editing,
  onClose,
}: {
  editing: Coupon | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<CouponInput>(
    editing
      ? {
          code: editing.code,
          type: editing.type,
          value: editing.value,
          min_order: editing.minOrder,
          max_uses: editing.maxUses,
          is_active: editing.isActive,
          expires_at: editing.expiresAt ? editing.expiresAt.split("T")[0] : undefined,
        }
      : EMPTY,
  );
  const [error, setError] = useState("");

  const save = useMutation({
    mutationFn: () =>
      editing
        ? adminUpdateCoupon(parseInt(editing.id, 10), form)
        : adminCreateCoupon(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.adminCoupons });
      onClose();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Failed to save coupon");
    },
  });

  function set(field: keyof CouponInput, value: unknown) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-bg rounded-2xl border border-border shadow-xl w-full max-w-md p-6">
        <h2 className="font-bold text-text text-lg mb-5">{editing ? "Edit Coupon" : "New Coupon"}</h2>
        <div className="flex flex-col gap-4">
          <Input
            id="c-code"
            label="Code"
            value={form.code}
            onChange={(e) => set("code", e.target.value.toUpperCase())}
            placeholder="SAVE10"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-text mb-1.5 block">Type</label>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className="w-full h-10 px-3 text-sm bg-bg border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed (NPR)</option>
              </select>
            </div>
            <Input
              id="c-value"
              label={form.type === "percent" ? "Discount %" : "Discount NPR"}
              type="number"
              value={String(form.value)}
              onChange={(e) => set("value", parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="c-min"
              label="Min Order (optional)"
              type="number"
              value={form.min_order != null ? String(form.min_order) : ""}
              onChange={(e) => set("min_order", e.target.value ? parseInt(e.target.value, 10) : undefined)}
            />
            <Input
              id="c-max"
              label="Max Uses (optional)"
              type="number"
              value={form.max_uses != null ? String(form.max_uses) : ""}
              onChange={(e) => set("max_uses", e.target.value ? parseInt(e.target.value, 10) : undefined)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text mb-1.5 block">Expires (optional)</label>
            <input
              type="date"
              value={form.expires_at ?? ""}
              onChange={(e) => set("expires_at", e.target.value || undefined)}
              className="w-full h-10 px-3 text-sm bg-bg border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              className="accent-primary"
            />
            <span className="text-sm text-text">Active</span>
          </label>
          {error && <p className="text-xs text-error">{error}</p>}
          <div className="flex gap-3 pt-1">
            <Button variant="primary" size="md" isLoading={save.isPending} onClick={() => save.mutate()}>
              Save Coupon
            </Button>
            <Button variant="outline" size="md" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminCouponsPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);

  const { data: coupons = [] } = useQuery({
    queryKey: queryKeys.adminCoupons,
    queryFn: adminGetCoupons,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminDeleteCoupon(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.adminCoupons }),
  });

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Coupons</h1>
        <Button variant="primary" size="sm" onClick={() => { setEditing(null); setModalOpen(true); }}>
          <Plus size={14} /> New Coupon
        </Button>
      </div>

      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-subtle text-text-muted text-xs">
              <th className="text-left px-4 py-3 font-medium">Code</th>
              <th className="text-left px-4 py-3 font-medium">Discount</th>
              <th className="text-center px-4 py-3 font-medium hidden md:table-cell">Used</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Expires</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-bg-subtle transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-primary">{c.code}</td>
                <td className="px-4 py-3 font-medium text-text">
                  {c.type === "percent" ? `${c.value}%` : formatNPR(c.value)}
                  {c.minOrder && <span className="text-xs text-text-muted ml-2">min {formatNPR(c.minOrder)}</span>}
                </td>
                <td className="px-4 py-3 text-center text-text-muted hidden md:table-cell">
                  {c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""}
                </td>
                <td className="px-4 py-3 text-text-muted hidden lg:table-cell">
                  {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  {c.isActive ? (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-success-light text-success">Active</span>
                  ) : (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-bg-subtle text-text-muted">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => { setEditing(c); setModalOpen(true); }}
                      className="p-1.5 text-text-muted hover:text-primary transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(parseInt(c.id, 10))}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 text-text-muted hover:text-error transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-text-muted">No coupons yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <CouponFormModal editing={editing} onClose={() => { setModalOpen(false); setEditing(null); }} />
      )}
    </div>
  );
}
