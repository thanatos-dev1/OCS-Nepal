"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Offer, OfferInput } from "@/lib/api/types";
import type { Product } from "@/lib/api/types";

interface Props {
  initial?: Offer | null;
  products: Product[];
  onSave: (input: OfferInput) => Promise<unknown>;
  onClose: () => void;
}

function toDatetimeLocal(iso?: string) {
  if (!iso) return "";
  return iso.slice(0, 16);
}

export default function OfferModal({ initial, products, onSave, onClose }: Props) {
  const [productId, setProductId] = useState(initial?.productId ?? "");
  const [salePrice, setSalePrice] = useState(initial ? String(initial.salePrice) : "");
  const [label, setLabel] = useState(initial?.label ?? "");
  const [startsAt, setStartsAt] = useState(toDatetimeLocal(initial?.startsAt) || toDatetimeLocal(new Date().toISOString()));
  const [endsAt, setEndsAt] = useState(toDatetimeLocal(initial?.endsAt));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedProduct = products.find((p) => p.id === productId);
  const discountPercent =
    selectedProduct && salePrice
      ? Math.round(((selectedProduct.price - parseFloat(salePrice)) / selectedProduct.price) * 100)
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId) { setError("Select a product"); return; }
    const price = parseFloat(salePrice);
    if (!salePrice || isNaN(price) || price <= 0) { setError("Enter a valid sale price"); return; }
    if (selectedProduct && price >= selectedProduct.price) { setError("Sale price must be less than original price"); return; }
    if (!startsAt) { setError("Set a start date"); return; }

    setError("");
    setLoading(true);
    try {
      await onSave({
        product_id: parseInt(productId, 10),
        sale_price: price,
        label: label.trim() || undefined,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: endsAt ? new Date(endsAt).toISOString() : undefined,
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
            {initial ? "Edit Offer" : "New Offer"}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <X size={18} />
          </button>
        </div>

        <form id="offer-form" onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* Product */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="o-product" className="text-sm font-medium text-text">Product</label>
            <select
              id="o-product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3.5 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 hover:border-border-strong transition-colors"
            >
              <option value="">— Select product —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — NPR {p.price.toLocaleString("en-NP")}
                </option>
              ))}
            </select>
          </div>

          {/* Sale price + discount preview */}
          <div>
            <Input
              id="o-sale-price"
              label="Sale Price (NPR)"
              type="number"
              min="0"
              step="0.01"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="e.g. 1500"
            />
            {discountPercent !== null && discountPercent > 0 && (
              <p className="mt-1 text-xs text-success font-medium">{discountPercent}% off</p>
            )}
            {discountPercent !== null && discountPercent <= 0 && (
              <p className="mt-1 text-xs text-error">Must be less than original price</p>
            )}
          </div>

          {/* Label */}
          <Input
            id="o-label"
            label="Label (optional)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Flash Sale, Weekend Deal"
          />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="o-starts" className="text-sm font-medium text-text">Starts At</label>
              <input
                id="o-starts"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 hover:border-border-strong transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="o-ends" className="text-sm font-medium text-text">Ends At <span className="text-text-muted font-normal">(optional)</span></label>
              <input
                id="o-ends"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 hover:border-border-strong transition-colors"
              />
            </div>
          </div>

          {error && <p className="text-sm text-error">{error}</p>}
        </form>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="offer-form" size="sm" isLoading={loading}>
            Save Offer
          </Button>
        </div>
      </div>
    </div>
  );
}
