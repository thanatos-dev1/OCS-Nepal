"use client";

import Link from "next/link";
import { Trash2, ShoppingBag, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import Button from "@/components/ui/Button";
import ProductImage from "@/components/shop/ProductImage";

function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString("en-NP")}`;
}

export default function CartPage() {
  const { items, updateQty, removeItem, clearCart } = useCartStore();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (items.length === 0) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4">
        <ShoppingBag size={56} className="text-border-strong" />
        <div className="text-center">
          <p className="text-lg font-semibold text-text">Your cart is empty</p>
          <p className="mt-1 text-sm text-text-muted">
            Add some products to get started.
          </p>
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
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 bg-bg-card border border-border rounded-xl p-4"
            >
              {/* Thumbnail */}
              <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-border">
                <ProductImage
                  src={item.image}
                  alt={item.name}
                  category={item.category}
                />
              </div>

              {/* Name + price */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.id}`}
                  className="text-sm font-semibold text-text hover:text-primary transition-colors line-clamp-2"
                >
                  {item.name}
                </Link>
                <p className="mt-0.5 text-sm font-medium text-text-muted">
                  {formatNPR(item.price)}
                </p>
              </div>

              {/* Qty stepper */}
              <div className="flex items-center border border-border rounded-lg overflow-hidden shrink-0">
                <button
                  onClick={() => updateQty(item.id, item.qty - 1)}
                  className="w-8 h-8 flex items-center justify-center text-text-muted hover:bg-bg-subtle hover:text-text transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-text select-none">
                  {item.qty}
                </span>
                <button
                  onClick={() => updateQty(item.id, item.qty + 1)}
                  className="w-8 h-8 flex items-center justify-center text-text-muted hover:bg-bg-subtle hover:text-text transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Line total */}
              <p className="w-24 text-right text-sm font-bold text-text shrink-0">
                {formatNPR(item.price * item.qty)}
              </p>

              {/* Remove */}
              <button
                onClick={() => removeItem(item.id)}
                className="p-1.5 text-text-disabled hover:text-error transition-colors shrink-0"
                aria-label="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="self-start text-xs text-text-muted hover:text-error transition-colors mt-1"
          >
            Clear cart
          </button>
        </div>

        {/* Order summary */}
        <div className="lg:w-72 shrink-0">
          <div className="bg-bg-card border border-border rounded-xl p-5 sticky top-24">
            <h2 className="text-base font-semibold text-text mb-4">
              Order Summary
            </h2>

            <div className="flex justify-between text-sm text-text-muted mb-2">
              <span>
                Subtotal ({items.reduce((n, i) => n + i.qty, 0)} items)
              </span>
              <span className="text-text font-medium">
                {formatNPR(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-text-muted mb-4">
              <span>Shipping</span>
              <span className="text-text font-medium">
                Calculated at checkout
              </span>
            </div>

            <div className="border-t border-border pt-4 flex justify-between font-bold text-text mb-5">
              <span>Total</span>
              <span>{formatNPR(subtotal)}</span>
            </div>

            <Button variant="cta" size="lg" className="w-full">
              Proceed to Checkout
            </Button>

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
