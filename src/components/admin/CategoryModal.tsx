'use client';

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Category } from "@/lib/api/types";

interface Props {
  initial?: Category | null;
  onSave: (data: { name: string; showInBar: boolean }) => Promise<void>;
  onClose: () => void;
}

export default function CategoryModal({ initial, onSave, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [showInBar, setShowInBar] = useState(initial?.showInBar ?? false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    setLoading(true);
    try {
      await onSave({ name: name.trim(), showInBar });
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-overlay flex items-center justify-center bg-black/40">
      <div className="bg-bg rounded-xl shadow-lg w-full max-w-sm mx-4">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text">
            {initial ? "Edit Category" : "New Category"}
          </h2>
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
