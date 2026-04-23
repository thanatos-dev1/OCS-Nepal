"use client";

import { useEffect } from "react";
import { trackRecentlyViewed } from "@/hooks/useRecentlyViewed";
import type { Product } from "@/lib/api/types";

export default function TrackView({ product }: { product: Product }) {
  useEffect(() => {
    trackRecentlyViewed(product);
  }, [product]);

  return null;
}
