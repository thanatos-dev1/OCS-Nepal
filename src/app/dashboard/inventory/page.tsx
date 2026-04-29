"use client";

import { useState } from "react";
import { Boxes, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useProductsQuery } from "@/hooks/useProducts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateStock } from "@/lib/api/products";
import { queryKeys } from "@/lib/queries";

const LOW_STOCK_THRESHOLD = 5;

type Filter = "all" | "low" | "out";

function StockCell({ productId, initial }: { productId: number; initial: number }) {
  const [value, setValue] = useState(String(initial));
  const [saved, setSaved] = useState(false);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (stock: number) => updateStock(productId, stock),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.products });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    },
  });

  function handleBlur() {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0 || num === initial) return;
    mutation.mutate(num);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        disabled={mutation.isPending}
        className="w-20 rounded-md border border-border bg-bg px-2 py-1 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 hover:border-border-strong transition-colors disabled:opacity-50"
      />
      {mutation.isPending && (
        <span className="text-xs text-text-muted">Saving…</span>
      )}
      {saved && (
        <span className="text-xs text-success">Saved</span>
      )}
    </div>
  );
}

export default function AdminInventoryPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const { data: products = [], isLoading } = useProductsQuery();

  const filtered = products.filter((p) => {
    if (filter === "out") return p.stockCount === 0;
    if (filter === "low") return p.stockCount > 0 && p.stockCount <= LOW_STOCK_THRESHOLD;
    return true;
  });

  const outCount = products.filter((p) => p.stockCount === 0).length;
  const lowCount = products.filter((p) => p.stockCount > 0 && p.stockCount <= LOW_STOCK_THRESHOLD).length;

  const filterOptions: { key: Filter; label: string; count?: number }[] = [
    { key: "all", label: "All", count: products.length },
    { key: "low", label: "Low Stock", count: lowCount },
    { key: "out", label: "Out of Stock", count: outCount },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Boxes size={20} className="text-primary" />
        <div>
          <h1 className="text-xl font-bold text-text">Inventory</h1>
          <p className="text-sm text-text-muted mt-0.5">Click a stock number to edit it inline</p>
        </div>
      </div>

      {/* Summary chips */}
      {!isLoading && (
        <div className="flex gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-2 text-sm bg-error-light text-error rounded-lg px-3 py-2">
            <XCircle size={14} />
            <span className="font-semibold">{outCount}</span> out of stock
          </div>
          <div className="flex items-center gap-2 text-sm bg-amber-50 text-amber-700 rounded-lg px-3 py-2">
            <AlertTriangle size={14} />
            <span className="font-semibold">{lowCount}</span> low stock (≤{LOW_STOCK_THRESHOLD})
          </div>
          <div className="flex items-center gap-2 text-sm bg-success-light text-success rounded-lg px-3 py-2">
            <CheckCircle size={14} />
            <span className="font-semibold">{products.length - outCount - lowCount}</span> healthy
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 border-b border-border">
        {filterOptions.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              filter === key
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            {label}
            {count !== undefined && (
              <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${
                filter === key ? "bg-primary text-white" : "bg-bg-subtle text-text-muted"
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-subtle text-text-muted">
              <tr>
                {["Product", "Category", "Price", "Status", "Stock"].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="bg-bg">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3.5 w-20 bg-bg-subtle rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-border rounded-xl">
          <CheckCircle size={28} className="text-success mb-2" />
          <p className="text-sm font-medium text-text">No products in this category</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-subtle text-text-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Price</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id} className={`transition-colors ${
                  p.stockCount === 0 ? "bg-error-light/30" :
                  p.stockCount <= LOW_STOCK_THRESHOLD ? "bg-amber-50/50" :
                  "bg-bg hover:bg-bg-subtle"
                }`}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-text">{p.name}</p>
                      {p.brand && <p className="text-xs text-text-muted">{p.brand}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{p.category || "—"}</td>
                  <td className="px-4 py-3 text-text">NPR {p.price.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    {p.stockCount === 0 ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-error">
                        <XCircle size={12} /> Out of Stock
                      </span>
                    ) : p.stockCount <= LOW_STOCK_THRESHOLD ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-amber-700">
                        <AlertTriangle size={12} /> Low Stock
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-success">
                        <CheckCircle size={12} /> In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StockCell productId={parseInt(p.id, 10)} initial={p.stockCount} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
