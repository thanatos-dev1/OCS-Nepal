"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Coupon, CouponInput } from "@/lib/api/types";

interface Props {
  initial?: Coupon | null;
  onSave: (input: CouponInput) => Promise<unknown>;
  onClose: () => void;
}

function toDatetimeLocal(iso?: string) {
  if (!iso) return "";
  return iso.slice(0, 16);
}

export default function CouponModal({ initial, onSave, onClose }: Props) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [type, setType] = useState<"percent" | "fixed">(initial?.type ?? "percent");
  const [value, setValue] = useState(initial ? String(initial.value) : "");
  const [minOrder, setMinOrder] = useState(initial?.minOrder ? String(initial.minOrder) : "");
  const [maxUses, setMaxUses] = useState(initial?.maxUses ? String(initial.maxUses) : "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [expiresAt, setExpiresAt] = useState(toDatetimeLocal(initial?.expiresAt));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) { setError("Enter a coupon code"); return; }
    const numValue = parseFloat(value);
    if (!value || isNaN(numValue) || numValue <= 0) { setError("Enter a valid discount value"); return; }
    if (type === "percent" && numValue > 100) { setError("Percent discount cannot exceed 100"); return; }

    setError("");
    setLoading(true);
    try {
      await onSave({
        code: code.trim().toUpperCase(),
        type,
        value: numValue,
        min_order: minOrder ? parseFloat(minOrder) : undefined,
        max_uses: maxUses ? parseInt(maxUses, 10) : undefined,
        is_active: isActive,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-overlay flex items-center justify-center bg-black/40 p-4">
      <div className="bg-bg rounded-xl shadow-lg w-full max-w-md flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text">
            {initial ? "Edit Coupon" : "New Coupon"}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <X size={18} />
          </button>
        </div>

        <form id="coupon-form" onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <Input
            id="c-code"
            label="Code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. SAVE20"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text">Discount Type</label>
            <div className="flex rounded-md border border-border overflow-hidden">
              {(["percent", "fixed"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    type === t
                      ? "bg-primary text-white"
                      : "bg-bg text-text-muted hover:bg-bg-subtle"
                  }`}
                >
                  {t === "percent" ? "Percent (%)" : "Fixed (NPR)"}
                </button>
              ))}
            </div>
          </div>

          <Input
            id="c-value"
            label={type === "percent" ? "Discount %" : "Discount Amount (NPR)"}
            type="number"
            min="0"
            max={type === "percent" ? "100" : undefined}
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={type === "percent" ? "e.g. 20" : "e.g. 500"}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="c-min-order"
              label={<>Min Order <span className="text-text-muted font-normal">(optional)</span></>}
              type="number"
              min="0"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              placeholder="NPR"
            />
            <Input
              id="c-max-uses"
              label={<>Max Uses <span className="text-text-muted font-normal">(optional)</span></>}
              type="number"
              min="1"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder="Unlimited"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="c-expires" className="text-sm font-medium text-text">
              Expires At <span className="text-text-muted font-normal">(optional)</span>
            </label>
            <input
              id="c-expires"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 hover:border-border-strong transition-colors"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-primary"
            />
            <span className="text-sm font-medium text-text">Active</span>
          </label>

          {error && <p className="text-sm text-error">{error}</p>}
        </form>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="coupon-form" size="sm" isLoading={loading}>
            Save Coupon
          </Button>
        </div>
      </div>
    </div>
  );
}
