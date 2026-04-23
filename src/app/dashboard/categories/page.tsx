'use client';

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import CategoryModal from "@/components/admin/CategoryModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useCategoriesQuery, useSaveCategoryMutation, useDeleteCategoryMutation } from "@/hooks/useCategories";
import type { Category } from "@/lib/api/types";

const TableSkeleton = () => (
  <div className="rounded-xl border border-border overflow-hidden">
    <table className="w-full text-sm">
      <thead className="bg-bg-subtle text-text-muted">
        <tr>
          <th className="text-left px-4 py-3 font-medium">Name</th>
          <th className="text-left px-4 py-3 font-medium">Slug</th>
          <th className="text-left px-4 py-3 font-medium">In Bar</th>
          <th className="px-4 py-3" />
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <tr key={i} className="bg-bg">
            <td className="px-4 py-3"><div className="h-3.5 w-28 bg-bg-subtle rounded animate-pulse" /></td>
            <td className="px-4 py-3"><div className="h-3.5 w-36 bg-bg-subtle rounded animate-pulse" /></td>
            <td className="px-4 py-3"><div className="h-6 w-12 bg-bg-subtle rounded animate-pulse ml-auto" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function AdminCategoriesPage() {
  const [modal, setModal] = useState<{ open: boolean; category: Category | null }>({ open: false, category: null });
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const { data: categories = [], isLoading } = useCategoriesQuery();
  const saveMutation = useSaveCategoryMutation(modal.category);
  const deleteMutation = useDeleteCategoryMutation();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text">Categories</h1>
          <p className="text-sm text-text-muted mt-0.5">{categories.length} total</p>
        </div>
        <Button size="sm" onClick={() => setModal({ open: true, category: null })}>
          <Plus size={15} /> Add Category
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : categories.length === 0 ? (
        <p className="text-sm text-text-muted">No categories yet.</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-subtle text-text-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Slug</th>
                <th className="text-left px-4 py-3 font-medium">In Bar</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((c) => (
                <tr key={c.id} className="bg-bg hover:bg-bg-subtle transition-colors">
                  <td className="px-4 py-3 font-medium text-text">{c.name}</td>
                  <td className="px-4 py-3 text-text-muted font-mono text-xs">{c.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${c.showInBar ? "text-success bg-success-light" : "text-text-muted bg-bg-subtle"}`}>
                      {c.showInBar ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setModal({ open: true, category: c })}
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
        <CategoryModal
          initial={modal.category}
          onSave={(data) => saveMutation.mutateAsync(data)}
          onClose={() => setModal({ open: false, category: null })}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete category?"
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
