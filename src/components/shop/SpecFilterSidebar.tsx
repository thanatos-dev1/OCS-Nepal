'use client';

import { useCallback } from "react";
import { X } from "lucide-react";
import type { SpecDefinition } from "@/lib/api/types";

interface Props {
  definitions: SpecDefinition[];
  filters: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}

// SpecFilterSidebar renders one filter control per filterable spec definition.
// State shape mirrors the backend's query-string format: keys carry the
// suffix (`ram_gb_min`, `panel`, etc.) so the parent can pass `filters` to
// getProducts({ specFilters }) directly with no translation.
export default function SpecFilterSidebar({ definitions, filters, onChange }: Props) {
  const setFilter = useCallback(
    (key: string, value: string) => {
      const next = { ...filters };
      if (value === "" || value === undefined) {
        delete next[key];
      } else {
        next[key] = value;
      }
      onChange(next);
    },
    [filters, onChange],
  );

  const filterableDefs = definitions.filter((d) => d.filterable && d.dataType !== "string");
  const activeCount = Object.values(filters).filter((v) => v !== "").length;

  if (filterableDefs.length === 0) {
    return null;
  }

  return (
    <aside className="w-64 shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-text">Filters</h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => onChange({})}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-error transition-colors"
          >
            <X size={12} /> Clear ({activeCount})
          </button>
        )}
      </div>

      <div className="flex flex-col gap-5">
        {filterableDefs.map((def) => (
          <FilterControl key={def.id} def={def} filters={filters} setFilter={setFilter} />
        ))}
      </div>
    </aside>
  );
}

function FilterControl({
  def,
  filters,
  setFilter,
}: {
  def: SpecDefinition;
  filters: Record<string, string>;
  setFilter: (key: string, value: string) => void;
}) {
  switch (def.dataType) {
    case "int":
    case "decimal":
      return <RangeFilter def={def} filters={filters} setFilter={setFilter} />;
    case "enum":
      return <EnumFilter def={def} filters={filters} setFilter={setFilter} />;
    case "bool":
      return <BoolFilter def={def} filters={filters} setFilter={setFilter} />;
    default:
      return null;
  }
}

function FilterLabel({ def }: { def: SpecDefinition }) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-text-muted">
        {def.label}
        {def.unit && <span className="ml-1 text-text-disabled normal-case font-normal">({def.unit})</span>}
      </label>
    </div>
  );
}

function RangeFilter({
  def,
  filters,
  setFilter,
}: {
  def: SpecDefinition;
  filters: Record<string, string>;
  setFilter: (key: string, value: string) => void;
}) {
  const minKey = `${def.key}_min`;
  const maxKey = `${def.key}_max`;
  return (
    <div>
      <FilterLabel def={def} />
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          placeholder="Min"
          value={filters[minKey] ?? ""}
          onChange={(e) => setFilter(minKey, e.target.value)}
          className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-text placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
        />
        <span className="text-text-muted text-xs">—</span>
        <input
          type="number"
          inputMode="decimal"
          placeholder="Max"
          value={filters[maxKey] ?? ""}
          onChange={(e) => setFilter(maxKey, e.target.value)}
          className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-text placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
        />
      </div>
    </div>
  );
}

function EnumFilter({
  def,
  filters,
  setFilter,
}: {
  def: SpecDefinition;
  filters: Record<string, string>;
  setFilter: (key: string, value: string) => void;
}) {
  const selected = (filters[def.key] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const toggle = (opt: string) => {
    const next = selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt];
    setFilter(def.key, next.join(","));
  };

  const options = def.enumOptions ?? [];
  if (options.length === 0) return null;

  return (
    <div>
      <FilterLabel def={def} />
      <div className="flex flex-col gap-1.5">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer select-none text-sm text-text">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => toggle(opt)}
              className="w-4 h-4 rounded border-border accent-accent"
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function BoolFilter({
  def,
  filters,
  setFilter,
}: {
  def: SpecDefinition;
  filters: Record<string, string>;
  setFilter: (key: string, value: string) => void;
}) {
  const current = filters[def.key] ?? "";
  const options: { value: string; label: string }[] = [
    { value: "", label: "Any" },
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
  ];
  return (
    <div>
      <FilterLabel def={def} />
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilter(def.key, opt.value)}
            className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
              current === opt.value
                ? "border-primary bg-primary-light text-primary"
                : "border-border bg-bg text-text-muted hover:border-border-strong"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
