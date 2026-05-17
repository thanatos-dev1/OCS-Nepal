import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/lib/api/cart";

// GuestProductSnapshot captures everything the cart UI needs to render a row
// without re-fetching the product. Stock is included so quantity-limit checks
// keep working in the cart page even when the user is unauthenticated.
export type GuestProductSnapshot = {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  stock?: number;
};

type GuestCartStore = {
  items: CartItem[];
  add: (product: GuestProductSnapshot, quantity: number) => void;
  update: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

let nextLocalId = -1;

// Local-only Cart rows use negative IDs so they're trivially distinguishable
// from server-issued positive IDs if a guest later logs in and we want to
// merge carts (out of scope here, but the option stays open).
function makeRow(product: GuestProductSnapshot, quantity: number): CartItem {
  return {
    id: nextLocalId--,
    userId: 0,
    productId: product.id,
    quantity,
    product: {
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
    },
  };
}

export const useGuestCartStore = create<GuestCartStore>()(
  persist(
    (set) => ({
      items: [],
      add: (product, quantity) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            };
          }
          return { items: [...state.items, makeRow(product, quantity)] };
        }),
      update: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i,
          ),
        })),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "ocs-guest-cart",
      storage: createJSONStorage(() => (typeof window === "undefined" ? undefined : localStorage) as Storage),
      partialize: (s) => ({ items: s.items }),
    },
  ),
);
