"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/stores/cartStore";

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
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  function handleClick() {
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
    <Button
      variant={"cta"}
      size="lg"
      className="flex-1 transition-all"
      disabled={!product.inStock || added}
      onClick={handleClick}
    >
      {added ? (
        <>
          <Check size={16} />
          Added
        </>
      ) : (
        <>
          <ShoppingCart size={16} />
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </>
      )}
    </Button>
  );
}
