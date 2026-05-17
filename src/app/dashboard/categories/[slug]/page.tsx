'use client';

import { use, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, Pencil, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import SpecDefinitionModal from "@/components/admin/SpecDefinitionModal";
import { useCategoriesQuery } from "@/hooks/useCategories";
import {
  useCategorySpecDefinitionsQuery,
  useSaveSpecDefinitionMutation,
  useDeleteSpecDefinitionMutation,
} from "@/hooks/useSpecDefinitions";
import type { SpecDefinition } from "@/lib/api/types";

const DATA_TYPE_LABELS: Record<string, string> = {
  string: "String",
  int: "Integer",
  decimal: "Decimal",
  bool: "Boolean",
  enum: "Enum",
};

const TableSkeleton = () => (
  <div className="rounded-xl border border-border overflow-hidden">
    <table className="w-full text-sm">
      <thead className="bg-bg-subtle text-text-muted">
        <tr>
          <th className="text-left px-4 py-3 font-medium">Label</th>
          <th className="text-left px-4 py-3 font-medium">Key</th>
          <th className="text-left px-4 py-3 font-medium">Type</th>
          <th className="text-left px-4 py-3 font-medium">Unit</th>
          <th className="text-left px-4 py-3 font-medium">Flags</th>
          <th className="px-4 py-3" />
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <tr key={i} className="bg-bg">
            <td className="px-4 py-3"><div className="h-3.5 w-24 bg-bg-subtle rounded animate-pulse" /></td>
            <td className="px-4 py-3"><div className="h-3.5 w-20 bg-bg-subtle rounded animate-pulse" /></td>
            <td className="px-4 py-3"><div className="h-3.5 w-16 bg-bg-subtle rounded animate-pulse" /></td>
            <td className="px-4 py-3"><div className="h-3.5 w-10 bg-bg-subtle rounded animate-pulse" /></td>
            <td className="px-4 py-3"><div className="h-3.5 w-28 bg-bg-subtle rounded animate-pulse" /></td>
            <td className="px-4 py-3" />
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

function FlagBadges({ def }: { def: SpecDefinition }) {
  const flags = [
    def.filterable && "Filterable",
    def.comparable && "Comparable",
    def.required && "Required",
  ].filter(Boolean) as string[];
  if (flags.length === 0) return <span className="text-xs text-text-muted">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {flags.map((f) => (
        <span
          key={f}
          className="inline-block px-2 py-0.5 text-xs font-medium rounded-full text-primary bg-primary-light"
        >
          {f}
        </span>
      ))}
    </div>
  );
}

export default function CategorySpecsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const { data: categories = [], isLoading: catsLoading } = useCategoriesQuery();
  const category = categories.find((c) => c.slug === slug);
  const categoryId = category ? parseInt(category.id, 10) : 0;

  const { data: defs = [], isLoading: defsLoading } = useCategorySpecDefinitionsQuery(slug);

  const [modal, setModal] = useState<{ open: boolean; def: SpecDefinition | null }>({ open: false, def: null });
  const [deleteTarget, setDeleteTarget] = useState<SpecDefinition | null>(null);

  const saveMutation = useSaveSpecDefinitionMutation(slug, categoryId, modal.def);
  const deleteMutation = useDeleteSpecDefinitionMutation(slug);

  if (catsLoading) {
    return <div className="text-sm text-text-muted">Loading…</div>;
  }
  if (!category) {
    return (
      <div>
        <Link
          href="/dashboard/categories"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary transition-colors mb-4"
        >
          <ChevronLeft size={14} /> Back to categories
        </Link>
        <p className="text-sm text-error">Category not found.</p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/dashboard/categories"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary transition-colors mb-4"
      >
        <ChevronLeft size={14} /> Back to categories
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text">{category.name}</h1>
          <p className="text-sm text-text-muted mt-0.5">
            <span className="font-mono text-xs">{category.slug}</span>
            {" · "}
            {defs.length} spec definition{defs.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button size="sm" onClick={() => setModal({ open: true, def: null })}>
          <Plus size={15} /> Add Spec
        </Button>
      </div>

      <div className="mb-6 p-4 rounded-lg bg-bg-subtle border border-border">
        <p className="text-sm text-text">
          Spec definitions are the template that drives <strong>filtering</strong>, <strong>comparison</strong>, and the spec table on product pages for products in <strong>{category.name}</strong>. Define each spec once here, then set values per product.
        </p>
      </div>

      {defsLoading ? (
        <TableSkeleton />
      ) : defs.length === 0 ? (
        <div className="rounded-xl border border-border border-dashed p-8 text-center">
          <p className="text-sm text-text-muted mb-4">No spec definitions yet.</p>
          <Button size="sm" onClick={() => setModal({ open: true, def: null })}>
            <Plus size={15} /> Add the first one
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-subtle text-text-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Label</th>
                <th className="text-left px-4 py-3 font-medium">Key</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Unit</th>
                <th className="text-left px-4 py-3 font-medium">Flags</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {defs.map((d) => (
                <tr key={d.id} className="bg-bg hover:bg-bg-subtle transition-colors">
                  <td className="px-4 py-3 font-medium text-text">{d.label}</td>
                  <td className="px-4 py-3 text-text-muted font-mono text-xs">{d.key}</td>
                  <td className="px-4 py-3 text-text">
                    {DATA_TYPE_LABELS[d.dataType] ?? d.dataType}
                    {d.dataType === "enum" && d.enumOptions && d.enumOptions.length > 0 && (
                      <span className="text-xs text-text-muted ml-1.5">({d.enumOptions.length} options)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{d.unit || "—"}</td>
                  <td className="px-4 py-3"><FlagBadges def={d} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setModal({ open: true, def: d })}
                        className="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-primary-light transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(d)}
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
        <SpecDefinitionModal
          initial={modal.def}
          onSave={(data) => saveMutation.mutateAsync(data)}
          onClose={() => setModal({ open: false, def: null })}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete spec definition?"
          description={`"${deleteTarget.label}" will be permanently removed. Any product values for this spec will be lost.`}
          loading={deleteMutation.isPending}
          onConfirm={async () => {
            await deleteMutation.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
