'use client';

import { useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Category } from "@/lib/api/types";
import type { CategoryInput } from "@/lib/api/categories";

interface Props {
  initial?: Category | null;
  categories?: Category[];
  onSave: (data: CategoryInput) => Promise<void>;
  onClose: () => void;
}

export default function CategoryModal({ initial, categories = [], onSave, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [parentId, setParentId] = useState<string>(initial?.parentId ?? "");
  const [showInBar, setShowInBar] = useState(initial?.showInBar ?? false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const parentOptions = categories.filter((c) => c.id !== initial?.id && !c.parentId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    setLoading(true);
    try {
      await onSave({
        Name: name.trim(),
        ShowInBar: showInBar,
        Description: description.trim() || undefined,
        ParentID: parentId ? parseInt(parentId, 10) : null,
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
      <div className="bg-bg rounded-xl shadow-lg w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text">
            {initial ? "Edit Category" : "New Category"}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <Input
            id="cat-name"
            label="Name"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            error={error}
            placeholder="e.g. Graphics Cards"
            autoFocus
          />

          {parentOptions.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cat-parent" className="text-sm font-medium text-text">Parent Category</label>
              <select
                id="cat-parent"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full rounded-md border border-border bg-bg px-3.5 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 hover:border-border-strong transition-colors"
              >
                <option value="">— None (top-level) —</option>
                {parentOptions.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="cat-desc" className="text-sm font-medium text-text">Description</label>
            <textarea
              id="cat-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional short description…"
              className="w-full rounded-md border border-border bg-bg px-3.5 py-2.5 text-sm text-text placeholder:text-text-disabled resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 hover:border-border-strong transition-colors"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showInBar}
              onChange={(e) => setShowInBar(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-accent"
            />
            <span className="text-sm font-medium text-text">Show in category bar</span>
          </label>

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
