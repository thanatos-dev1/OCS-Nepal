"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProductImage from "@/components/shop/ProductImage";
import { cn, formatNPR } from "@/lib/utils";
import type { Product } from "@/lib/api/types";
import { useAddToCartMutation, useCartQuery } from "@/hooks/useCart";
import { useAuthStore } from "@/stores/authStore";
import {
  useWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from "@/hooks/useWishlist";

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

  const { data: wishlist = [] } = useWishlistQuery();
  const addToWishlist = useAddToWishlistMutation();
  const removeFromWishlist = useRemoveFromWishlistMutation();
  const inWishlist = wishlist.some((w) => w.productId === parseInt(product.id, 10));

  const isShopUser = !user || user.role === "customer";
  const cartQty =
    cartItems.find((i) => i.productId === parseInt(product.id, 10))?.quantity ?? 0;
  const atStockLimit = cartQty >= product.stockCount;

  const primaryImage = product.images?.[0]?.url;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock || atStockLimit) return;
    if (!token) {
      router.push("/account/login");
      return;
    }
    addToCart.mutate(
      { productId: parseInt(product.id, 10), quantity: 1 },
      {
        onSuccess: () => {
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        },
      },
    );
  }

  function handleWishlistToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      router.push("/account/login");
      return;
    }
    const pid = parseInt(product.id, 10);
    if (inWishlist) {
      removeFromWishlist.mutate(pid);
    } else {
      addToWishlist.mutate(pid);
    }
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group bg-bg-card border border-border rounded-xl overflow-hidden hover:shadow-card hover:border-border-strong transition-all"
    >
      <div className="relative h-44 overflow-hidden pt-2">
        <ProductImage src={primaryImage} alt={product.name} category={product.category} />

        {/* Badges — left side */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.salePrice ? (
            <Badge label="Sale" />
          ) : product.badge ? (
            <Badge label={product.badge} />
          ) : null}
          {product.isFeatured && !product.salePrice && (
            <Badge label="Featured" className="bg-primary/10 text-primary border-primary/20" />
          )}
          {product.isNewArrival && (
            <Badge label="New" className="bg-success/10 text-success border-success/20" />
          )}
        </div>

        {/* Out of stock */}
        {!product.inStock && (
          <span className="absolute top-3 right-10 px-2 py-0.5 text-xs font-semibold bg-bg text-text-disabled border border-border rounded-sm">
            Out of Stock
          </span>
        )}

        {/* Wishlist */}
        {isShopUser && (
          <button
            type="button"
            onClick={handleWishlistToggle}
            className={cn(
              "absolute top-2 right-2 p-1.5 rounded-full bg-bg/80 backdrop-blur-sm border border-border transition-colors",
              inWishlist
                ? "text-error border-error/30 hover:bg-error-light"
                : "text-text-disabled hover:text-error hover:border-error/30",
            )}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={14} fill={inWishlist ? "currentColor" : "none"} />
          </button>
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

        {product.salePrice ? (
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-base font-bold text-error">{formatNPR(product.salePrice)}</span>
            <span className="text-sm text-text-muted line-through">{formatNPR(product.price)}</span>
          </div>
        ) : (
          <p className="mt-3 text-base font-bold text-text">{formatNPR(product.price)}</p>
        )}

        {isShopUser && (
          <Button
            variant="cta"
            size="sm"
            className="mt-3 w-full"
            disabled={!product.inStock || atStockLimit}
            onClick={handleAddToCart}
          >
            {!product.inStock
              ? "Out of Stock"
              : atStockLimit
                ? "Max Qty in Cart"
                : added
                  ? "Added!"
                  : "Add to Cart"}
          </Button>
        )}
      </div>
    </Link>
  );
}
