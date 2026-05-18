'use client';

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import {
  useSeriesByBrandQuery,
  useCreateSeriesMutation,
  useUpdateSeriesMutation,
  useDeleteSeriesMutation,
} from "@/hooks/useSeries";

interface Props {
  brandId: number;
}

// Inline-edit row for one series. Saves on Enter or check; cancels on Esc or X.
function SeriesRow({
  id,
  initialName,
  initialSort,
  onSave,
  onCancel,
  onDelete,
  loading,
  showDelete,
}: {
  id: number;
  initialName: string;
  initialSort: number;
  onSave: (name: string, sort: number) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
  loading: boolean;
  showDelete: boolean;
}) {
  const [name, setName] = useState(initialName);
  const [sort, setSort] = useState(String(initialSort));

  async function commit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    await onSave(trimmed, parseInt(sort, 10) || 0);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        autoFocus={!initialName}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); commit(); }
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Series name (e.g. ROG)"
        className="flex-1 rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <input
        type="number"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } }}
        className="w-16 rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
        title="Sort order"
      />
      <button
        type="button"
        onClick={commit}
        disabled={loading || !name.trim()}
        className="p-1.5 rounded-md text-success hover:bg-success-light disabled:opacity-40"
        title="Save"
      >
        <Check size={14} />
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="p-1.5 rounded-md text-text-muted hover:bg-bg-subtle"
        title="Cancel"
      >
        <X size={14} />
      </button>
      {showDelete && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={loading}
          className="p-1.5 rounded-md text-error hover:bg-error-light"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      )}
      <span className="text-xs text-text-disabled font-mono">#{id || "new"}</span>
    </div>
  );
}

export default function BrandSeriesManager({ brandId }: Props) {
  const { data: series = [], isLoading } = useSeriesByBrandQuery(brandId);
  const createMutation = useCreateSeriesMutation(brandId);
  const updateMutation = useUpdateSeriesMutation(brandId);
  const deleteMutation = useDeleteSeriesMutation(brandId);

  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const busy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text">Series</span>
        <button
          type="button"
          onClick={() => { setAddingNew(true); setEditingId(null); }}
          disabled={addingNew || busy}
          className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover disabled:opacity-40"
        >
          <Plus size={13} /> Add series
        </button>
      </div>

      {isLoading ? (
        <p className="text-xs text-text-muted">Loading…</p>
      ) : series.length === 0 && !addingNew ? (
        <p className="text-xs text-text-muted italic">No series yet.</p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        {series.map((s) =>
          editingId === s.id ? (
            <SeriesRow
              key={s.id}
              id={s.id}
              initialName={s.name}
              initialSort={s.sortOrder}
              loading={busy}
              showDelete
              onSave={async (name, sort) => {
                await updateMutation.mutateAsync({ id: s.id, input: { name, sort_order: sort } });
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
              onDelete={async () => {
                await deleteMutation.mutateAsync(s.id);
                setEditingId(null);
              }}
            />
          ) : (
            <div key={s.id} className="flex items-center gap-2 group">
              <span className="flex-1 text-sm text-text">{s.name}</span>
              <span className="w-16 text-xs text-text-muted">#{s.sortOrder}</span>
              <button
                type="button"
                onClick={() => { setEditingId(s.id); setAddingNew(false); }}
                disabled={busy}
                className="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-primary-light opacity-0 group-hover:opacity-100 transition-opacity"
                title="Edit"
              >
                <Pencil size={13} />
              </button>
            </div>
          ),
        )}

        {addingNew && (
          <SeriesRow
            id={0}
            initialName=""
            initialSort={0}
            loading={busy}
            showDelete={false}
            onSave={async (name, sort) => {
              await createMutation.mutateAsync({ name, sort_order: sort });
              setAddingNew(false);
            }}
            onCancel={() => setAddingNew(false)}
          />
        )}
      </div>
    </div>
  );
}
