'use client';

import { useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import BrandSeriesManager from "@/components/admin/BrandSeriesManager";
import BrandCategoryLinks from "@/components/admin/BrandCategoryLinks";
import type { Brand } from "@/lib/api/types";
import type { BrandInput } from "@/lib/api/brands";

interface Props {
  initial?: Brand | null;
  onSave: (data: BrandInput) => Promise<void>;
  onClose: () => void;
}

export default function BrandModal({ initial, onSave, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [logoURL, setLogoURL] = useState(initial?.logoUrl ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    setLoading(true);
    try {
      await onSave({
        Name: name.trim(),
        LogoURL: logoURL.trim() || undefined,
        Website: website.trim() || undefined,
        SortOrder: parseInt(sortOrder, 10) || 0,
        IsActive: isActive,
      });
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const brandId = initial ? parseInt(initial.id, 10) : null;

  return (
    <div className="fixed inset-0 z-overlay flex items-center justify-center bg-black/40 p-4">
      <div className={`bg-bg rounded-xl shadow-lg w-full max-h-[90vh] flex flex-col ${initial ? "max-w-2xl" : "max-w-sm"}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-semibold text-text">
            {initial ? "Edit Brand" : "New Brand"}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 flex flex-col gap-4">
          <Input
            id="brand-name"
            label="Name"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            error={error}
            placeholder="e.g. ASUS"
            autoFocus
          />

          <Input
            id="brand-logo"
            label="Logo URL (optional)"
            value={logoURL}
            onChange={(e) => setLogoURL(e.target.value)}
            placeholder="https://…"
          />

          <Input
            id="brand-website"
            label="Website (optional)"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://…"
          />

          <Input
            id="brand-sort"
            label="Sort order"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            placeholder="0"
          />

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-accent"
            />
            <span className="text-sm font-medium text-text">Active</span>
          </label>

          {brandId && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-border">
              <BrandCategoryLinks brandId={brandId} />
              <BrandSeriesManager brandId={brandId} />
            </div>
          )}

          {!brandId && (
            <p className="text-xs text-text-muted pt-2 border-t border-border">
              Save the brand first to manage its series and category links.
            </p>
          )}

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
