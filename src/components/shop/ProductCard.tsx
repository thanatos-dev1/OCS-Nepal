"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProductImage from "@/components/shop/ProductImage";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/api/types";
import { useAddToCartMutation, useCartQuery } from "@/hooks/useCart";
import { useAuthStore } from "@/stores/authStore";

function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString("en-NP")}`;
}

interface ProductCardProps {
  product: Product;
  showCategory?: boolean;
}

export default function ProductCard({ product, showCategory = true }: ProductCardProps) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const addToCart = useAddToCartMutation();
  const { data: cartItems = [] } = useCartQuery();
  const [added, setAdded] = useState(false);

  const isShopUser = !user || user.role === "customer";
  const cartQty = cartItems.find((i) => i.productId === parseInt(product.id, 10))?.quantity ?? 0;
  const atStockLimit = cartQty >= product.stockCount;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock || atStockLimit) return;
    if (!token) { router.push("/account/login"); return; }
    addToCart.mutate(
      { productId: parseInt(product.id, 10), quantity: 1 },
      {
        onSuccess: () => {
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        },
      }
    );
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
        <h3 className={cn("text-sm font-semibold leading-snug transition-colors text-text group-hover:text-primary", !showCategory && "mt-0")}>
          {product.name}
        </h3>
        <p className="mt-3 text-base font-bold text-text">{formatNPR(product.price)}</p>
        {isShopUser && (
          <Button
            variant="cta"
            size="sm"
            className="mt-3 w-full"
            disabled={!product.inStock || atStockLimit}
            onClick={handleAddToCart}
          >
            {!product.inStock ? "Out of Stock" : atStockLimit ? "Max Qty in Cart" : added ? "Added!" : "Add to Cart"}
          </Button>
        )}
      </div>
    </Link>
  );
}
