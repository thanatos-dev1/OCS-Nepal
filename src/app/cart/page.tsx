"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, ShoppingBag, Minus, Plus, LogIn } from "lucide-react";
import { useCartQuery, useUpdateCartItemMutation, useRemoveCartItemMutation, useClearCartMutation } from "@/hooks/useCart";
import { useAuthStore } from "@/stores/authStore";
import Button from "@/components/ui/Button";
import ProductImage from "@/components/shop/ProductImage";

function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString("en-NP")}`;
}

export default function CartPage() {
  const token = useAuthStore((s) => s.token);
  const isInitialized = useAuthStore((s) => s._isInitialized);

  const { data: items = [], isLoading } = useCartQuery();
  const updateItem = useUpdateCartItemMutation();
  const removeItem = useRemoveCartItemMutation();
  const clearCart = useClearCartMutation();

  // Track which productIds have in-flight requests for per-row disabled state
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  function addPending(id: number) {
    setPendingIds((prev) => new Set(prev).add(id));
  }
  function removePending(id: number) {
    setPendingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }

  function handleUpdate(productId: number, quantity: number) {
    addPending(productId);
    updateItem.mutate({ productId, quantity }, {
      onSettled: () => removePending(productId),
    });
  }

  function handleRemove(productId: number) {
    addPending(productId);
    removeItem.mutate(productId, {
      onSettled: () => removePending(productId),
    });
  }

  // Decrement to 1 → removes the item instead of disabling
  function handleDecrement(productId: number, currentQty: number) {
    if (currentQty <= 1) {
      handleRemove(productId);
    } else {
      handleUpdate(productId, currentQty - 1);
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalQty = items.reduce((n, i) => n + i.quantity, 0);

  // Unauthenticated state
  if (isInitialized && !token) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4">
        <LogIn size={48} className="text-border-strong" />
        <div className="text-center">
          <p className="text-lg font-semibold text-text">Sign in to view your cart</p>
          <p className="mt-1 text-sm text-text-muted">
            Your cart is saved to your account.
          </p>
        </div>
        <Link href="/account/login">
          <Button variant="primary">Sign In</Button>
        </Link>
      </main>
    );
  }

  if (!isInitialized || isLoading) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-8 w-32 bg-bg-subtle rounded animate-pulse mb-8" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 bg-bg-card border border-border rounded-xl p-4">
              <div className="w-16 h-16 rounded-lg bg-bg-subtle animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-bg-subtle rounded animate-pulse" />
                <div className="h-3.5 w-24 bg-bg-subtle rounded animate-pulse" />
              </div>
              <div className="w-24 h-8 bg-bg-subtle rounded-lg animate-pulse" />
              <div className="w-20 h-4 bg-bg-subtle rounded animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4">
        <ShoppingBag size={56} className="text-border-strong" />
        <div className="text-center">
          <p className="text-lg font-semibold text-text">Your cart is empty</p>
          <p className="mt-1 text-sm text-text-muted">Add some products to get started.</p>
        </div>
        <Link href="/products">
          <Button variant="primary">Browse Products</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-text mb-8">Your Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Item list */}
        <div className="flex-1 flex flex-col gap-4">
          {items.map((item) => {
            const isPending = pendingIds.has(item.productId);
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-bg-card border border-border rounded-xl p-4"
              >
                <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-border">
                  <ProductImage
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    category=""
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.productId}`}
                    className="text-sm font-semibold text-text hover:text-primary transition-colors line-clamp-2"
                  >
                    {item.product.name}
                  </Link>
                  <p className="mt-0.5 text-sm font-medium text-text-muted">
                    {formatNPR(item.product.price)}
                  </p>
                </div>

                <div className="flex items-center border border-border rounded-lg overflow-hidden shrink-0">
                  <button
                    onClick={() => handleDecrement(item.productId, item.quantity)}
                    disabled={isPending}
                    className="w-8 h-8 flex items-center justify-center text-text-muted hover:bg-bg-subtle hover:text-text transition-colors disabled:opacity-40"
                    aria-label={item.quantity === 1 ? "Remove item" : "Decrease quantity"}
                  >
                    {item.quantity === 1 ? <Trash2 size={13} /> : <Minus size={14} />}
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-text select-none">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdate(item.productId, item.quantity + 1)}
                    disabled={isPending}
                    className="w-8 h-8 flex items-center justify-center text-text-muted hover:bg-bg-subtle hover:text-text transition-colors disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <p className="w-24 text-right text-sm font-bold text-text shrink-0">
                  {formatNPR(item.product.price * item.quantity)}
                </p>

                <button
                  onClick={() => handleRemove(item.productId)}
                  disabled={isPending}
                  className="p-1.5 text-text-disabled hover:text-error transition-colors shrink-0 disabled:opacity-40"
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}

          <button
            onClick={() => clearCart.mutate()}
            disabled={clearCart.isPending}
            className="self-start text-xs text-text-muted hover:text-error transition-colors mt-1 disabled:opacity-40"
          >
            {clearCart.isPending ? "Clearing…" : "Clear cart"}
          </button>
        </div>

        {/* Order summary */}
        <div className="lg:w-72 shrink-0">
          <div className="bg-bg-card border border-border rounded-xl p-5 sticky top-24">
            <h2 className="text-base font-semibold text-text mb-4">Order Summary</h2>

            <div className="flex justify-between text-sm text-text-muted mb-2">
              <span>Subtotal ({totalQty} items)</span>
              <span className="text-text font-medium">{formatNPR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-text-muted mb-4">
              <span>Shipping</span>
              <span className="text-text font-medium">Calculated at checkout</span>
            </div>

            <div className="border-t border-border pt-4 flex justify-between font-bold text-text mb-5">
              <span>Total</span>
              <span>{formatNPR(subtotal)}</span>
            </div>

            <Link href="/checkout">
              <Button variant="cta" size="lg" className="w-full">
                Proceed to Checkout
              </Button>
            </Link>

            <Link
              href="/products"
              className="block text-center mt-3 text-sm text-text-muted hover:text-primary transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
