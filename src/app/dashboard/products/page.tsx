'use client';

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import ProductModal from "@/components/admin/ProductModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useProductsQuery, useSaveProductMutation, useDeleteProductMutation } from "@/hooks/useProducts";
import { useCategoriesQuery } from "@/hooks/useCategories";
import type { Product } from "@/lib/api/types";

const TableSkeleton = () => (
  <div className="rounded-xl border border-border overflow-hidden">
    <table className="w-full text-sm">
      <thead className="bg-bg-subtle text-text-muted">
        <tr>
          <th className="text-left px-4 py-3 font-medium">Product</th>
          <th className="text-left px-4 py-3 font-medium">Category</th>
          <th className="text-left px-4 py-3 font-medium">Price</th>
          <th className="text-left px-4 py-3 font-medium">Stock</th>
          <th className="px-4 py-3" />
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <tr key={i} className="bg-bg">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-bg-subtle animate-pulse shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-32 bg-bg-subtle rounded animate-pulse" />
                  <div className="h-3 w-16 bg-bg-subtle rounded animate-pulse" />
                </div>
              </div>
            </td>
            <td className="px-4 py-3"><div className="h-3.5 w-20 bg-bg-subtle rounded animate-pulse" /></td>
            <td className="px-4 py-3"><div className="h-3.5 w-24 bg-bg-subtle rounded animate-pulse" /></td>
            <td className="px-4 py-3"><div className="h-3.5 w-8 bg-bg-subtle rounded animate-pulse" /></td>
            <td className="px-4 py-3"><div className="h-6 w-12 bg-bg-subtle rounded animate-pulse ml-auto" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function AdminProductsPage() {
  const [modal, setModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useProductsQuery();
  const { data: categories = [] } = useCategoriesQuery();
  const saveMutation = useSaveProductMutation(modal.product);
  const deleteMutation = useDeleteProductMutation();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text">Products</h1>
          <p className="text-sm text-text-muted mt-0.5">{products.length} total</p>
        </div>
        <Button size="sm" onClick={() => setModal({ open: true, product: null })}>
          <Plus size={15} /> Add Product
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : products.length === 0 ? (
        <p className="text-sm text-text-muted">No products yet.</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-subtle text-text-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Price</th>
                <th className="text-left px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.id} className="bg-bg hover:bg-bg-subtle transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt={p.name} className="w-9 h-9 rounded-md object-cover border border-border" />
                      ) : (
                        <div className="w-9 h-9 rounded-md bg-bg-subtle border border-border" />
                      )}
                      <div>
                        <p className="font-medium text-text">{p.name}</p>
                        {p.brand && <p className="text-xs text-text-muted">{p.brand}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{p.category || "—"}</td>
                  <td className="px-4 py-3 text-text">NPR {p.price.toLocaleString("en-NP")}</td>
                  <td className="px-4 py-3">
                    <span className={p.inStock ? "text-success" : "text-error"}>{p.stockCount}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setModal({ open: true, product: p })}
                        className="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-primary-light transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
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
        <ProductModal
          initial={modal.product}
          categories={categories}
          onSave={(form) => saveMutation.mutateAsync(form)}
          onClose={() => setModal({ open: false, product: null })}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete product?"
          description={`"${deleteTarget.name}" will be permanently removed.`}
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
