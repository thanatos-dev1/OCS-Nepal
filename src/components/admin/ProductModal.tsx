'use client';

import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Product } from "@/lib/api/types";
import type { Category } from "@/lib/api/types";

interface Props {
  initial?: Product | null;
  categories: Category[];
  onSave: (form: FormData) => Promise<void>;
  onClose: () => void;
}

type FieldErrors = Partial<Record<"name" | "price" | "stock", string>>;

export default function ProductModal({ initial, categories, onSave, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [stock, setStock] = useState(initial ? String(initial.stockCount) : "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initial?.images[0] ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => { if (imagePreview && imageFile) URL.revokeObjectURL(imagePreview); };
  }, [imagePreview, imageFile]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function validate(): boolean {
    const errs: FieldErrors = {};
    if (!name.trim()) errs.name = "Required";
    const p = parseFloat(price);
    if (!price || isNaN(p) || p <= 0) errs.price = "Must be a positive number";
    const s = parseInt(stock, 10);
    if (stock && (isNaN(s) || s < 0)) errs.stock = "Must be 0 or more";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setApiError("");
    setLoading(true);

    const form = new FormData();
    form.append("name", name.trim());
    form.append("price", price);
    if (stock) form.append("stock", stock);
    if (description.trim()) form.append("description", description.trim());
    if (brand.trim()) form.append("brand", brand.trim());
    if (categoryId) form.append("category_id", categoryId);
    if (imageFile) form.append("image", imageFile);
    // pass existing image_url if no new file chosen (for updates)
    else if (initial?.images[0]) form.append("image_url", initial.images[0]);

    try {
      await onSave(form);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setApiError(msg ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-overlay flex items-center justify-center bg-black/40 p-4">
      <div className="bg-bg rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-semibold text-text">
            {initial ? "Edit Product" : "New Product"}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form id="product-form" onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {/* Image upload */}
          <div>
            <span className="text-sm font-medium text-text block mb-1.5">Image</span>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full h-36 rounded-lg border-2 border-dashed border-border hover:border-accent transition-colors flex flex-col items-center justify-center gap-2 overflow-hidden relative"
            >
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="preview" className="absolute inset-0 w-full h-full object-contain p-2" />
              ) : (
                <>
                  <ImagePlus size={24} className="text-text-muted" />
                  <span className="text-sm text-text-muted">Click to upload image</span>
                </>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          <Input id="p-name" label="Name" value={name} onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: undefined })); }} error={errors.name} placeholder="RTX 4090" />

          <div className="grid grid-cols-2 gap-4">
            <Input id="p-price" label="Price (NPR)" type="number" min="0" step="0.01" value={price} onChange={(e) => { setPrice(e.target.value); setErrors((prev) => ({ ...prev, price: undefined })); }} error={errors.price} placeholder="250000" />
            <Input id="p-stock" label="Stock" type="number" min="0" value={stock} onChange={(e) => { setStock(e.target.value); setErrors((prev) => ({ ...prev, stock: undefined })); }} error={errors.stock} placeholder="10" />
          </div>

          <Input id="p-brand" label="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="NVIDIA" />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="p-category" className="text-sm font-medium text-text">Category</label>
            <select
              id="p-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3.5 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 hover:border-border-strong transition-colors"
            >
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="p-desc" className="text-sm font-medium text-text">Description</label>
            <textarea
              id="p-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short product description…"
              className="w-full rounded-md border border-border bg-bg px-3.5 py-2.5 text-sm text-text placeholder:text-text-disabled resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 hover:border-border-strong transition-colors"
            />
          </div>

          {apiError && <p className="text-sm text-error">{apiError}</p>}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border shrink-0">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="product-form" size="sm" isLoading={loading}>
            Save Product
          </Button>
        </div>
      </div>
    </div>
  );
}
