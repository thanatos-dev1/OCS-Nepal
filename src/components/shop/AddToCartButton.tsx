"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAddToCartMutation, useCartQuery } from "@/hooks/useCart";
import { useAuthStore } from "@/stores/authStore";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    inStock: boolean;
    stockCount?: number;
    images?: string[];
    category?: string;
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const addToCart = useAddToCartMutation();
  const { data: cartItems = [] } = useCartQuery();
  const [added, setAdded] = useState(false);

  if (user?.role === "owner" || user?.role === "staff") return null;

  const cartQty = cartItems.find((i) => i.productId === parseInt(product.id, 10))?.quantity ?? 0;
  const atStockLimit = product.stockCount != null && cartQty >= product.stockCount;
  const isDisabled = !product.inStock || added || atStockLimit;

  function handleClick() {
    if (isDisabled) return;
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
    <Button
      variant="cta"
      size="lg"
      className="flex-1 transition-all"
      disabled={isDisabled}
      isLoading={addToCart.isPending}
      onClick={handleClick}
    >
      {added ? (
        <><Check size={16} /> Added</>
      ) : atStockLimit ? (
        <><ShoppingCart size={16} /> Max Qty in Cart</>
      ) : (
        <><ShoppingCart size={16} /> {product.inStock ? "Add to Cart" : "Out of Stock"}</>
      )}
    </Button>
  );
}
