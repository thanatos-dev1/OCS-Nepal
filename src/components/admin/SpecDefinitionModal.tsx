'use client';

import { useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { SpecDataType, SpecDefinition } from "@/lib/api/types";
import type { SpecDefinitionInput } from "@/lib/api/specDefinitions";

interface Props {
  initial?: SpecDefinition | null;
  onSave: (data: SpecDefinitionInput) => Promise<unknown>;
  onClose: () => void;
}

const DATA_TYPE_OPTIONS: { value: SpecDataType; label: string; hint: string }[] = [
  { value: "string", label: "String", hint: "Freeform text (e.g. CPU model)" },
  { value: "int", label: "Integer", hint: "Whole number, filterable (e.g. RAM in GB)" },
  { value: "decimal", label: "Decimal", hint: "Number with fractional part (e.g. 15.6 inches)" },
  { value: "bool", label: "Boolean", hint: "Yes/No (e.g. Backlight)" },
  { value: "enum", label: "Enum", hint: "Pick from a fixed list (e.g. IPS/OLED/VA)" },
];

export default function SpecDefinitionModal({ initial, onSave, onClose }: Props) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [key, setKey] = useState(initial?.key ?? "");
  const [unit, setUnit] = useState(initial?.unit ?? "");
  const [dataType, setDataType] = useState<SpecDataType>(initial?.dataType ?? "string");
  const [enumOptionsText, setEnumOptionsText] = useState(
    initial?.enumOptions?.join(", ") ?? "",
  );
  const [filterable, setFilterable] = useState(initial?.filterable ?? false);
  const [comparable, setComparable] = useState(initial?.comparable ?? true);
  const [required, setRequired] = useState(initial?.required ?? false);
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [labelError, setLabelError] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError("");
    if (!label.trim()) {
      setLabelError("Required");
      return;
    }

    const input: SpecDefinitionInput = {
      label: label.trim(),
      key: key.trim() || undefined,
      unit: unit.trim() || undefined,
      data_type: dataType,
      filterable,
      comparable,
      required,
      sort_order: parseInt(sortOrder, 10) || 0,
    };
    if (dataType === "enum") {
      input.enum_options = enumOptionsText
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);
      if (input.enum_options.length === 0) {
        setApiError("Enum options can't be empty");
        return;
      }
    }

    setLoading(true);
    try {
      await onSave(input);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setApiError(msg ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const dataTypeHint = DATA_TYPE_OPTIONS.find((o) => o.value === dataType)?.hint ?? "";

  return (
    <div className="fixed inset-0 z-overlay flex items-center justify-center bg-black/40 p-4">
      <div className="bg-bg rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text">
            {initial ? "Edit Spec Definition" : "New Spec Definition"}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <Input
            id="spec-label"
            label="Label"
            value={label}
            onChange={(e) => { setLabel(e.target.value); setLabelError(""); }}
            error={labelError}
            placeholder="e.g. RAM"
            autoFocus
          />

          <div className="flex flex-col gap-1">
            <Input
              id="spec-key"
              label="Key (optional)"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="auto-derived from label"
            />
            <p className="text-xs text-text-muted">snake_case identifier used in URL filters (e.g. <code>ram_gb</code>)</p>
          </div>

          <Input
            id="spec-unit"
            label="Unit (optional)"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="GB, Hz, in…"
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="spec-data-type" className="text-sm font-medium text-text">Data type</label>
            <select
              id="spec-data-type"
              value={dataType}
              onChange={(e) => setDataType(e.target.value as SpecDataType)}
              className="w-full rounded-md border border-border bg-bg px-3.5 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 hover:border-border-strong transition-colors"
            >
              {DATA_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <p className="text-xs text-text-muted">{dataTypeHint}</p>
          </div>

          {dataType === "enum" && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="spec-enum-options" className="text-sm font-medium text-text">Options (comma-separated)</label>
              <textarea
                id="spec-enum-options"
                rows={2}
                value={enumOptionsText}
                onChange={(e) => setEnumOptionsText(e.target.value)}
                placeholder="IPS, OLED, VA, TN"
                className="w-full rounded-md border border-border bg-bg px-3.5 py-2.5 text-sm text-text placeholder:text-text-disabled resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 hover:border-border-strong transition-colors"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <Input
              id="spec-sort-order"
              label="Sort order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              placeholder="0"
            />
            <p className="text-xs text-text-muted">Lower numbers appear first on the product page and filter sidebar.</p>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterable}
                onChange={(e) => setFilterable(e.target.checked)}
                className="w-4 h-4 rounded border-border accent-accent"
              />
              <span className="text-sm font-medium text-text">Filterable</span>
              <span className="text-xs text-text-muted">— shoppers can filter by this on the category page</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={comparable}
                onChange={(e) => setComparable(e.target.checked)}
                className="w-4 h-4 rounded border-border accent-accent"
              />
              <span className="text-sm font-medium text-text">Comparable</span>
              <span className="text-xs text-text-muted">— appears in side-by-side product comparisons</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
                className="w-4 h-4 rounded border-border accent-accent"
              />
              <span className="text-sm font-medium text-text">Required</span>
              <span className="text-xs text-text-muted">— products in this category must set a value</span>
            </label>
          </div>

          {apiError && <p className="text-sm text-error">{apiError}</p>}

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={loading}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
