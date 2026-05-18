'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SpecValuesEditor from "@/components/admin/SpecValuesEditor";
import SpecExtrasEditor, { type ExtraRow } from "@/components/admin/SpecExtrasEditor";
import ProductImageGallery from "@/components/admin/ProductImageGallery";
import { useCategorySpecDefinitionsQuery } from "@/hooks/useSpecDefinitions";
import { useBrandsQuery } from "@/hooks/useBrands";
import { useSeriesByBrandQuery } from "@/hooks/useSeries";
import type { SpecInput, SpecExtraInput } from "@/lib/api/products";
import type { Category, Product } from "@/lib/api/types";

interface Props {
  initial?: Product | null;
  categories: Category[];
  onSave: (form: FormData, specs: SpecInput[], extras: SpecExtraInput[]) => Promise<void>;
  onClose: () => void;
}

type FieldErrors = Partial<Record<"name" | "price" | "stock" | "category", string>>;

export default function ProductModal({ initial, categories, onSave, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [stock, setStock] = useState(initial ? String(initial.stockCount) : "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [brandId, setBrandId] = useState(initial?.brandId ?? "");
  const [seriesId, setSeriesId] = useState(initial?.seriesId ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [isNewArrival, setIsNewArrival] = useState(initial?.isNewArrival ?? false);
  const [salePrice, setSalePrice] = useState(initial?.salePrice ? String(initial.salePrice) : "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initial?.images[0]?.url ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [specValues, setSpecValues] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    initial?.specs.forEach((s) => {
      if (s.value !== null && s.value !== undefined) {
        out[String(s.specDefinitionId)] = String(s.value);
      }
    });
    return out;
  });
  const [specErrors, setSpecErrors] = useState<Record<string, string>>({});
  const [extras, setExtras] = useState<ExtraRow[]>(
    () => initial?.specExtras.map((e) => ({ label: e.label, value: e.value })) ?? [],
  );
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Look up the selected category's slug; spec definitions are addressed by
  // slug on the backend.
  const categorySlug = useMemo(() => {
    if (!categoryId) return null;
    return categories.find((c) => c.id === categoryId)?.slug ?? null;
  }, [categoryId, categories]);

  const { data: specDefinitions = [] } = useCategorySpecDefinitionsQuery(categorySlug);
  const { data: brands = [] } = useBrandsQuery();
  const { data: brandSeries = [] } = useSeriesByBrandQuery(brandId ? parseInt(brandId, 10) : null);

  // When the brand changes, clear the series — series belongs to one brand,
  // and the previously-selected one no longer applies. Skip on the very first
  // render so editing a product with a brand+series doesn't immediately wipe.
  const initialBrand = initial?.brandId ?? "";
  useEffect(() => {
    if (brandId !== initialBrand) setSeriesId("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId]);

  // When the category changes during editing, drop any spec values whose
  // definition no longer belongs to the new category — they'd be rejected by
  // the backend's category-mismatch check anyway.
  useEffect(() => {
    if (specDefinitions.length === 0) return;
    const validIds = new Set(specDefinitions.map((d) => String(d.id)));
    setSpecValues((prev) => {
      const filtered: Record<string, string> = {};
      for (const [k, v] of Object.entries(prev)) {
        if (validIds.has(k)) filtered[k] = v;
      }
      return filtered;
    });
    setSpecErrors({});
  }, [specDefinitions]);

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
    if (salePrice) {
      const sp = parseFloat(salePrice);
      if (isNaN(sp) || sp <= 0) errs.price = "Sale price must be a positive number";
      else if (sp >= p) errs.price = "Sale price must be less than regular price";
    }
    const s = parseInt(stock, 10);
    if (stock && (isNaN(s) || s < 0)) errs.stock = "Must be 0 or more";
    if (!categoryId) errs.category = "Required";
    setErrors(errs);

    const sErrs: Record<string, string> = {};
    for (const def of specDefinitions) {
      if (def.required && !specValues[String(def.id)]) {
        sErrs[String(def.id)] = "Required";
      }
    }
    setSpecErrors(sErrs);

    return Object.keys(errs).length === 0 && Object.keys(sErrs).length === 0;
  }

  // Build the SpecInput payload from current state. Skips empty values
  // (= "no value set"). The backend coerces strings to the typed columns.
  function buildSpecPayload(): SpecInput[] {
    return specDefinitions
      .map((def) => {
        const v = specValues[String(def.id)] ?? "";
        if (v === "") return null;
        return { spec_definition_id: def.id, value: v };
      })
      .filter((x): x is SpecInput => x !== null);
  }

  // Skip rows whose label or value is blank — they'd be rejected server-side.
  // sort_order falls out of the array index so reordering in the UI is the
  // single source of truth.
  function buildExtrasPayload(): SpecExtraInput[] {
    return extras
      .map((row, i) => {
        const label = row.label.trim();
        const value = row.value.trim();
        if (!label || !value) return null;
        return { label, value, sort_order: i };
      })
      .filter((x): x is SpecExtraInput => x !== null);
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
    if (brandId) form.append("brand_id", brandId);
    if (seriesId) form.append("series_id", seriesId);
    if (categoryId) form.append("category_id", categoryId);
    form.append("is_featured", String(isFeatured));
    form.append("is_new_arrival", String(isNewArrival));
    if (salePrice) form.append("sale_price", salePrice);
    if (imageFile) form.append("image", imageFile);
    // pass existing image_url if no new file chosen (for updates)
    else if (initial?.images[0]?.url) form.append("image_url", initial.images[0].url);

    try {
      await onSave(form, buildSpecPayload(), buildExtrasPayload());
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
          {/* Images: new product gets a single-image picker (no ID yet for gallery uploads);
              existing product gets the full gallery. */}
          {initial ? (
            <ProductImageGallery
              productId={parseInt(initial.id, 10)}
              images={initial.images}
            />
          ) : (
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
              <p className="mt-1.5 text-xs text-text-muted">More images can be added after saving.</p>
            </div>
          )}

          <Input id="p-name" label="Name" value={name} onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: undefined })); }} error={errors.name} placeholder="RTX 4090" />

          <div className="grid grid-cols-2 gap-4">
            <Input id="p-price" label="Price (NPR)" type="number" min="0" step="0.01" value={price} onChange={(e) => { setPrice(e.target.value); setErrors((prev) => ({ ...prev, price: undefined })); }} error={errors.price} placeholder="250000" />
            <Input id="p-stock" label="Stock" type="number" min="0" value={stock} onChange={(e) => { setStock(e.target.value); setErrors((prev) => ({ ...prev, stock: undefined })); }} error={errors.stock} placeholder="10" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input id="p-sale-price" label="Sale Price (NPR)" type="number" min="0" step="0.01" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="Optional" />
              {salePrice && price && parseFloat(salePrice) > 0 && parseFloat(salePrice) < parseFloat(price) && (
                <p className="mt-1 text-xs text-success font-medium">
                  {Math.round(((parseFloat(price) - parseFloat(salePrice)) / parseFloat(price)) * 100)}% off
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="p-brand" className="text-sm font-medium text-text">Brand</label>
            <select
              id="p-brand"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3.5 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 hover:border-border-strong transition-colors"
            >
              <option value="">— None —</option>
              {brands.filter((b) => b.isActive).map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {brandId && brandSeries.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="p-series" className="text-sm font-medium text-text">Series (optional)</label>
              <select
                id="p-series"
                value={seriesId}
                onChange={(e) => setSeriesId(e.target.value)}
                className="w-full rounded-md border border-border bg-bg px-3.5 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 hover:border-border-strong transition-colors"
              >
                <option value="">— None —</option>
                {brandSeries.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="p-category" className="text-sm font-medium text-text">Category</label>
            <select
              id="p-category"
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setErrors((prev) => ({ ...prev, category: undefined })); }}
              className="w-full rounded-md border border-border bg-bg px-3.5 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 hover:border-border-strong transition-colors"
            >
              <option value="">— Select a category —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.category && <p className="text-sm text-error">{errors.category}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-border accent-accent"
              />
              <span className="text-sm font-medium text-text">Feature on homepage</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="w-4 h-4 rounded border-border accent-accent"
              />
              <span className="text-sm font-medium text-text">Mark as new arrival</span>
            </label>
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

          <SpecValuesEditor
            definitions={specDefinitions}
            values={specValues}
            errors={specErrors}
            onChange={(defId, value) => {
              setSpecValues((prev) => ({ ...prev, [String(defId)]: value }));
              setSpecErrors((prev) => {
                if (!prev[String(defId)]) return prev;
                const next = { ...prev };
                delete next[String(defId)];
                return next;
              });
            }}
          />

          <SpecExtrasEditor rows={extras} onChange={setExtras} />

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
