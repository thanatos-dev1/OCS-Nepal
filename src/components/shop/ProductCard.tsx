"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProductImage from "@/components/shop/ProductImage";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/api/types";
import { useCartStore } from "@/stores/cartStore";

function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString("en-NP")}`;
}

interface ProductCardProps {
  product: Product;
  showCategory?: boolean;
}

export default function ProductCard({
  product,
  showCategory = true,
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0],
      category: product.category,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Link
      href={`/products/${product.id}`}
      className="group bg-bg-card border border-border rounded-xl overflow-hidden hover:shadow-card hover:border-border-strong transition-all"
    >
      <div className="relative h-44 overflow-hidden pt-2 ble">
        <ProductImage
          src={product.images?.[0]}
          alt={product.name}
          category={product.category}
        />
        {product.badge && (
          <Badge label={product.badge} className="absolute top-3 left-3" />
        )}
        {!product.inStock && (
          <span className="absolute top-3 right-3 px-2 py-0.5 text-xs font-semibold bg-bg text-text-disabled border border-border rounded-sm">
            Out of Stock
          </span>
        )}
      </div>
      <div className="p-4">
        {showCategory && (
          <p className="text-xs text-text-disabled uppercase tracking-wide mb-1">
            {product.category}
          </p>
        )}
        <h3
          className={cn(
            "text-sm font-semibold leading-snug transition-colors text-text group-hover:text-primary",
            !showCategory && "mt-0",
          )}
        >
          {product.name}
        </h3>
        <p className="mt-3 text-base font-bold text-text">
          {formatNPR(product.price)}
        </p>
        <Button
          variant={"cta"}
          size="sm"
          className="mt-3 w-full"
          disabled={!product.inStock}
          onClick={handleAddToCart}
        >
          {!product.inStock ? "Out of Stock" : added ? "Added!" : "Add to Cart"}
        </Button>
      </div>
    </Link>
  );
}
