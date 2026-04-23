"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/api/types";

const KEY = "ocs_recently_viewed";
const MAX = 8;

export function useRecentlyViewed() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setProducts(JSON.parse(raw));
    } catch {}
  }, []);

  return products;
}

export function trackRecentlyViewed(product: Product) {
  try {
    const raw = localStorage.getItem(KEY);
    const existing: Product[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((p) => p.id !== product.id);
    const updated = [product, ...filtered].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}
