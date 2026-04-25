"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAddToCartMutation } from "@/hooks/useCart";
import { useAuthStore } from "@/stores/authStore";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    inStock: boolean;
    images?: string[];
    category?: string;
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const addToCart = useAddToCartMutation();
  const [added, setAdded] = useState(false);

  function handleClick() {
    if (!product.inStock) return;
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
      disabled={!product.inStock || added}
      isLoading={addToCart.isPending}
      onClick={handleClick}
    >
      {added ? (
        <><Check size={16} /> Added</>
      ) : (
        <><ShoppingCart size={16} /> {product.inStock ? "Add to Cart" : "Out of Stock"}</>
      )}
    </Button>
  );
}
