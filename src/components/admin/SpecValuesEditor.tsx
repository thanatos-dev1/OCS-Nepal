'use client';

import type { SpecDefinition } from "@/lib/api/types";

interface Props {
  definitions: SpecDefinition[];
  // Map of spec_definition_id (as string) → raw string value. Empty string
  // means "no value set" (omitted from the submitted SpecInput[]).
  values: Record<string, string>;
  errors?: Record<string, string>;
  onChange: (defId: number, value: string) => void;
}

// SpecValuesEditor renders one input per category SpecDefinition. Raw values
// are stored as strings (matching what the backend's coercion accepts) so the
// parent can submit them straight to PUT /products/:id/specs without
// type-juggling.
export default function SpecValuesEditor({ definitions, values, errors = {}, onChange }: Props) {
  if (definitions.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-medium text-text">Specifications</h3>
        <p className="text-xs text-text-muted mt-0.5">Set the typed spec values for this product. Leave optional fields blank to skip.</p>
      </div>

      <div className="rounded-lg border border-border divide-y divide-border">
        {definitions.map((def) => (
          <div key={def.id} className="px-4 py-3">
            <SpecValueRow
              def={def}
              value={values[String(def.id)] ?? ""}
              error={errors[String(def.id)]}
              onChange={(v) => onChange(def.id, v)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function SpecValueRow({
  def,
  value,
  error,
  onChange,
}: {
  def: SpecDefinition;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-[150px,1fr] gap-3 items-start">
      <div className="pt-2">
        <label htmlFor={`spec-${def.id}`} className="text-sm font-medium text-text">
          {def.label}
          {def.required && <span className="text-error ml-0.5">*</span>}
        </label>
        {def.unit && <p className="text-xs text-text-muted">{def.unit}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <SpecInputControl def={def} value={value} onChange={onChange} />
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    </div>
  );
}

function SpecInputControl({
  def,
  value,
  onChange,
}: {
  def: SpecDefinition;
  value: string;
  onChange: (value: string) => void;
}) {
  const baseInputCls =
    "w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 hover:border-border-strong transition-colors";

  switch (def.dataType) {
    case "int":
      return (
        <input
          id={`spec-${def.id}`}
          type="number"
          step={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={def.unit ? `e.g. 16` : "Whole number"}
          className={baseInputCls}
        />
      );
    case "decimal":
      return (
        <input
          id={`spec-${def.id}`}
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={def.unit ? `e.g. 15.6` : "Number"}
          className={baseInputCls}
        />
      );
    case "string":
      return (
        <input
          id={`spec-${def.id}`}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Text value"
          className={baseInputCls}
        />
      );
    case "bool": {
      const options: { value: string; label: string }[] = [
        { value: "", label: "Unset" },
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ];
      return (
        <div className="flex gap-2">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                value === opt.value
                  ? "border-primary bg-primary-light text-primary"
                  : "border-border bg-bg text-text-muted hover:border-border-strong"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    }
    case "enum": {
      const options = def.enumOptions ?? [];
      return (
        <select
          id={`spec-${def.id}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputCls}
        >
          <option value="">— None —</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }
    default:
      return null;
  }
}
