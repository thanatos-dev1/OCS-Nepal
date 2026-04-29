"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import Button from "@/components/ui/Button";
import OfferModal from "@/components/admin/OfferModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useOffersQuery, useSaveOfferMutation, useDeleteOfferMutation } from "@/hooks/useOffers";
import { useProductsQuery } from "@/hooks/useProducts";
import type { Offer } from "@/lib/api/types";
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
          {["Product", "Original", "Sale Price", "Discount", "Label", "Ends At", ""].map((h, i) => (
            <th key={i} className="text-left px-4 py-3 font-medium">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {Array.from({ length: 4 }).map((_, i) => (
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
);

export default function AdminOffersPage() {
  const [modal, setModal] = useState<{ open: boolean; offer: Offer | null }>({ open: false, offer: null });
  const [deleteTarget, setDeleteTarget] = useState<Offer | null>(null);

  const { data: offers = [], isLoading } = useOffersQuery();
  const { data: products = [] } = useProductsQuery();
  const saveMutation = useSaveOfferMutation(modal.offer);
  const deleteMutation = useDeleteOfferMutation();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text">Offers</h1>
          <p className="text-sm text-text-muted mt-0.5">{offers.length} active</p>
        </div>
        <Button size="sm" onClick={() => setModal({ open: true, offer: null })}>
          <Plus size={15} /> New Offer
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : offers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Tag size={32} className="text-text-disabled mb-3" />
          <p className="text-sm font-medium text-text">No offers yet</p>
          <p className="text-xs text-text-muted mt-1">Create your first offer to show deals on the homepage</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-subtle text-text-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium">Original</th>
                <th className="text-left px-4 py-3 font-medium">Sale Price</th>
                <th className="text-left px-4 py-3 font-medium">Discount</th>
                <th className="text-left px-4 py-3 font-medium">Label</th>
                <th className="text-left px-4 py-3 font-medium">Ends At</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {offers.map((offer) => (
                <tr key={offer.id} className="bg-bg hover:bg-bg-subtle transition-colors">
                  <td className="px-4 py-3 font-medium text-text max-w-48 truncate">{offer.product.name}</td>
                  <td className="px-4 py-3 text-text-muted">{formatNPR(offer.product.price)}</td>
                  <td className="px-4 py-3 font-semibold text-error">{formatNPR(offer.salePrice)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 text-xs font-semibold text-success bg-success-light rounded-full">
                      {offer.discountPercent}% off
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{offer.label ?? "—"}</td>
                  <td className="px-4 py-3 text-text-muted">{formatDate(offer.endsAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setModal({ open: true, offer })}
                        className="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-primary-light transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(offer)}
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
        <OfferModal
          initial={modal.offer}
          products={products}
          onSave={(input) => saveMutation.mutateAsync(input)}
          onClose={() => setModal({ open: false, offer: null })}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete offer?"
          description={`The offer for "${deleteTarget.product.name}" will be permanently removed.`}
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
