"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, AlertTriangle, ToggleLeft, ToggleRight, Star, Sparkles, Pencil } from "lucide-react";
import { adminGetProducts, adminUpdateStock, adminToggleFlag } from "@/lib/api/admin/products";
import { queryKeys } from "@/lib/queries";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { Product } from "@/lib/api/types";
import { useAdminAuthStore } from "@/stores/adminAuthStore";

function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString("en-NP")}`;
}

function StockEditor({ product }: { product: Product }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [qty, setQty] = useState(String(product.stockCount));
  const mutation = useMutation({
    mutationFn: (q: number) => adminUpdateStock(parseInt(product.id, 10), q),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.products });
      setEditing(false);
    },
  });

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 text-sm text-text hover:text-primary transition-colors group"
      >
        <span className={product.stockCount <= product.lowStockThreshold ? "text-error font-bold" : ""}>
          {product.stockCount}
        </span>
        <Pencil size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        className="w-16 h-7 px-2 text-xs border border-border rounded-md bg-bg focus:ring-1 focus:ring-primary/30 focus:border-primary outline-none"
      />
      <Button
        size="sm"
        variant="primary"
        isLoading={mutation.isPending}
        onClick={() => mutation.mutate(parseInt(qty, 10))}
        className="h-7 px-2 text-xs"
      >
        Save
      </Button>
      <button type="button" onClick={() => setEditing(false)} className="text-text-muted hover:text-text text-xs px-1">✕</button>
    </div>
  );
}

function FlagToggle({
  productId,
  flag,
  value,
  icon: Icon,
  title,
  role,
}: {
  productId: string;
  flag: "is_featured" | "is_new_arrival" | "is_active";
  value: boolean;
  icon: React.ElementType;
  title: string;
  role: string;
}) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => adminToggleFlag(parseInt(productId, 10), flag, !value),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products }),
  });
  const canEdit = role !== "staff" || flag !== "is_featured";

  return (
    <button
      type="button"
      title={title}
      onClick={() => canEdit && mutation.mutate()}
      disabled={mutation.isPending || !canEdit}
      className={`p-1 rounded transition-colors ${
        value ? "text-primary hover:text-primary-hover" : "text-border-strong hover:text-text-muted"
      } disabled:cursor-default`}
    >
      <Icon size={15} />
    </button>
  );
}

export default function AdminProductsPage() {
  const { admin } = useAdminAuthStore();
  const role = admin?.role ?? "staff";
  const [q, setQ] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: queryKeys.productsFiltered({ include_inactive: true, q }),
    queryFn: () => adminGetProducts({ q: q || undefined, include_inactive: true }),
  });

  const lowStockProducts = products.filter(
    (p) => p.stockCount <= p.lowStockThreshold,
  );

  return (
    <div className="p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">Products</h1>
          <p className="text-sm text-text-muted mt-1">{products.length} products</p>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="mb-6 p-4 bg-error-light border border-error/20 rounded-xl flex items-start gap-3">
          <AlertTriangle size={18} className="text-error mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-error mb-1">{lowStockProducts.length} low-stock product{lowStockProducts.length !== 1 ? "s" : ""}</p>
            <p className="text-xs text-text-muted">{lowStockProducts.map((p) => p.name).join(", ")}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-4 max-w-sm">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="w-full h-9 pl-9 pr-3 text-sm bg-bg border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-14 bg-bg-subtle rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-subtle text-text-muted text-xs">
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Category</th>
                <th className="text-right px-4 py-3 font-medium">Price</th>
                <th className="text-center px-4 py-3 font-medium">Stock</th>
                <th className="text-center px-4 py-3 font-medium hidden lg:table-cell">Flags</th>
                <th className="text-center px-4 py-3 font-medium hidden lg:table-cell">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-bg-subtle transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-text line-clamp-1">{p.name}</div>
                    {p.brand && <div className="text-xs text-text-muted">{p.brand}</div>}
                  </td>
                  <td className="px-4 py-3 text-text-muted hidden md:table-cell">{p.category}</td>
                  <td className="px-4 py-3 text-right">
                    {p.salePrice ? (
                      <div>
                        <span className="text-error font-semibold">{formatNPR(p.salePrice)}</span>
                        <span className="ml-1 text-xs text-text-muted line-through">{formatNPR(p.price)}</span>
                      </div>
                    ) : (
                      <span className="font-semibold text-text">{formatNPR(p.price)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {p.stockCount <= p.lowStockThreshold && (
                        <AlertTriangle size={12} className="text-error" />
                      )}
                      <StockEditor product={p} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    <div className="flex items-center justify-center gap-1">
                      <FlagToggle productId={p.id} flag="is_featured" value={p.isFeatured} icon={Star} title="Featured" role={role} />
                      <FlagToggle productId={p.id} flag="is_new_arrival" value={p.isNewArrival} icon={Sparkles} title="New Arrival" role={role} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    <FlagToggle productId={p.id} flag="is_active" value={p.isActive} icon={p.isActive ? ToggleRight : ToggleLeft} title={p.isActive ? "Active" : "Inactive"} role={role} />
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-muted">No products found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
