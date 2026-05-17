'use client';

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import BrandModal from "@/components/admin/BrandModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useBrandsQuery, useSaveBrandMutation, useDeleteBrandMutation } from "@/hooks/useBrands";
import type { Brand } from "@/lib/api/types";

const TableSkeleton = () => (
  <div className="rounded-xl border border-border overflow-hidden">
    <table className="w-full text-sm">
      <thead className="bg-bg-subtle text-text-muted">
        <tr>
          <th className="text-left px-4 py-3 font-medium">Name</th>
          <th className="text-left px-4 py-3 font-medium">Slug</th>
          <th className="text-left px-4 py-3 font-medium">Products</th>
          <th className="text-left px-4 py-3 font-medium">Status</th>
          <th className="px-4 py-3" />
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <tr key={i} className="bg-bg">
            <td className="px-4 py-3"><div className="h-3.5 w-24 bg-bg-subtle rounded animate-pulse" /></td>
            <td className="px-4 py-3"><div className="h-3.5 w-28 bg-bg-subtle rounded animate-pulse" /></td>
            <td className="px-4 py-3"><div className="h-3.5 w-8 bg-bg-subtle rounded animate-pulse" /></td>
            <td className="px-4 py-3"><div className="h-3.5 w-12 bg-bg-subtle rounded animate-pulse" /></td>
            <td className="px-4 py-3" />
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function AdminBrandsPage() {
  const [modal, setModal] = useState<{ open: boolean; brand: Brand | null }>({ open: false, brand: null });
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);

  const { data: brands = [], isLoading } = useBrandsQuery();
  const saveMutation = useSaveBrandMutation(modal.brand);
  const deleteMutation = useDeleteBrandMutation();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text">Brands</h1>
          <p className="text-sm text-text-muted mt-0.5">{brands.length} total</p>
        </div>
        <Button size="sm" onClick={() => setModal({ open: true, brand: null })}>
          <Plus size={15} /> Add Brand
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : brands.length === 0 ? (
        <div className="rounded-xl border border-border border-dashed p-8 text-center">
          <p className="text-sm text-text-muted mb-4">No brands yet.</p>
          <Button size="sm" onClick={() => setModal({ open: true, brand: null })}>
            <Plus size={15} /> Add the first one
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-subtle text-text-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Slug</th>
                <th className="text-left px-4 py-3 font-medium">Products</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {brands.map((b) => (
                <tr key={b.id} className="bg-bg hover:bg-bg-subtle transition-colors">
                  <td className="px-4 py-3 font-medium text-text">{b.name}</td>
                  <td className="px-4 py-3 text-text-muted font-mono text-xs">{b.slug}</td>
                  <td className="px-4 py-3 text-text-muted">{b.productCount}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${b.isActive ? "text-success bg-success-light" : "text-text-muted bg-bg-subtle"}`}>
                      {b.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setModal({ open: true, brand: b })}
                        className="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-primary-light transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(b)}
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
        <BrandModal
          initial={modal.brand}
          onSave={(data) => saveMutation.mutateAsync(data)}
          onClose={() => setModal({ open: false, brand: null })}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete brand?"
          description={`"${deleteTarget.name}" will be permanently removed. ${deleteTarget.productCount > 0 ? `${deleteTarget.productCount} product(s) will be unlinked from this brand but remain in the catalog.` : ""}`}
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
