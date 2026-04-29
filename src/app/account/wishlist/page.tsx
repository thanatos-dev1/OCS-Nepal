"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, X } from "lucide-react";
import ProductImage from "@/components/shop/ProductImage";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/stores/authStore";
import { useWishlistQuery, useRemoveFromWishlistMutation } from "@/hooks/useWishlist";
import { useAddToCartMutation, useCartQuery } from "@/hooks/useCart";
import { formatNPR } from "@/lib/utils";

export default function WishlistPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s._isInitialized);
  const token = useAuthStore((s) => s.token);

  const { data: wishlist = [], isLoading } = useWishlistQuery();
  const removeFromWishlist = useRemoveFromWishlistMutation();
  const addToCart = useAddToCartMutation();
  const { data: cartItems = [] } = useCartQuery();

  useEffect(() => {
    if (isInitialized && !token) router.replace("/account/login");
  }, [isInitialized, token, router]);

  if (!isInitialized || !user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Heart size={22} className="text-error" />
        <div>
          <h1 className="text-2xl font-bold text-text">My Wishlist</h1>
          <p className="text-sm text-text-muted mt-0.5">{wishlist.length} saved item{wishlist.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-bg-subtle rounded-xl animate-pulse" />
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <Heart size={40} className="mx-auto text-text-disabled mb-3" />
          <p className="font-semibold text-text text-lg">Your wishlist is empty</p>
          <p className="text-sm text-text-muted mt-2 mb-6">Save products you love for later</p>
          <Link href="/products">
            <Button variant="primary" size="md">Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {wishlist.map((item) => {
            const p = item.product;
            const primaryImage = p.images?.[0]?.url;
            const cartQty = cartItems.find((ci) => ci.productId === item.productId)?.quantity ?? 0;
            const atStockLimit = cartQty >= p.stockCount;

            return (
              <div
                key={item.productId}
                className="bg-bg-card border border-border rounded-xl overflow-hidden group"
              >
                <div className="relative h-44 overflow-hidden">
                  <Link href={`/products/${p.slug}`}>
                    <ProductImage src={primaryImage} alt={p.name} category={p.category} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeFromWishlist.mutate(item.productId)}
                    disabled={removeFromWishlist.isPending}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 border border-border text-error hover:bg-error-light transition-colors"
                    title="Remove from wishlist"
                  >
                    <X size={14} />
                  </button>
                  {p.salePrice && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 text-xs font-bold bg-error text-white rounded">
                      SALE
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <p className="text-xs text-text-disabled uppercase tracking-wide mb-1">{p.category}</p>
                  <Link href={`/products/${p.slug}`}>
                    <h3 className="text-sm font-semibold text-text leading-snug hover:text-primary transition-colors line-clamp-2">
                      {p.name}
                    </h3>
                  </Link>

                  {p.salePrice ? (
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-base font-bold text-error">{formatNPR(p.salePrice)}</span>
                      <span className="text-sm text-text-muted line-through">{formatNPR(p.price)}</span>
                    </div>
                  ) : (
                    <p className="mt-2 text-base font-bold text-text">{formatNPR(p.price)}</p>
                  )}

                  <Button
                    variant="cta"
                    size="sm"
                    className="mt-3 w-full"
                    disabled={!p.inStock || atStockLimit}
                    onClick={() => addToCart.mutate({ productId: item.productId, quantity: 1 })}
                  >
                    {!p.inStock ? "Out of Stock" : atStockLimit ? "Max Qty in Cart" : "Add to Cart"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
