'use client';

import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

export interface ExtraRow {
  label: string;
  value: string;
}

interface Props {
  rows: ExtraRow[];
  onChange: (rows: ExtraRow[]) => void;
}

// SpecExtrasEditor manages a flat list of freeform label/value rows for things
// the typed spec system shouldn't hold ("What's in the box", "Warranty notes").
// Order is preserved through the row's array index; sort_order is assigned on
// submit by the parent.
export default function SpecExtrasEditor({ rows, onChange }: Props) {
  const update = (i: number, patch: Partial<ExtraRow>) => {
    const next = rows.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  const remove = (i: number) => {
    onChange(rows.filter((_, idx) => idx !== i));
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const next = rows.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const add = () => {
    onChange([...rows, { label: "", value: "" }]);
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-medium text-text">Extra details</h3>
        <p className="text-xs text-text-muted mt-0.5">
          Freeform rows shown beneath the spec table on the product page. Use for non-filterable copy like &quot;What&apos;s in the box&quot; or warranty info.
        </p>
      </div>

      {rows.length > 0 && (
        <div className="rounded-lg border border-border divide-y divide-border">
          {rows.map((row, i) => (
            <div key={i} className="px-3 py-3 flex items-start gap-2">
              <div className="flex flex-col gap-0.5 pt-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="p-0.5 rounded text-text-muted hover:text-primary disabled:opacity-30 disabled:hover:text-text-muted transition-colors"
                  title="Move up"
                >
                  <ArrowUp size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === rows.length - 1}
                  className="p-0.5 rounded text-text-muted hover:text-primary disabled:opacity-30 disabled:hover:text-text-muted transition-colors"
                  title="Move down"
                >
                  <ArrowDown size={12} />
                </button>
              </div>
              <div className="flex-1 grid grid-cols-[140px,1fr] gap-2">
                <input
                  type="text"
                  value={row.label}
                  onChange={(e) => update(i, { label: e.target.value })}
                  placeholder="Label"
                  className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-text placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
                />
                <input
                  type="text"
                  value={row.value}
                  onChange={(e) => update(i, { value: e.target.value })}
                  placeholder="Value"
                  className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-text placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
                />
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="p-1.5 rounded-md text-text-muted hover:text-error hover:bg-error-light transition-colors"
                title="Remove"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={add}
        className="flex items-center justify-center gap-1.5 w-full rounded-md border border-dashed border-border px-3 py-2 text-sm text-text-muted hover:border-primary hover:text-primary transition-colors"
      >
        <Plus size={14} /> Add row
      </button>
    </div>
  );
}
