import { create } from "zustand";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

type CartStore = {
  items: CartItem[];
  itemCount: number;
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  itemCount: 0,

  addItem: (item) => {
    const existing = get().items.find((i) => i.id === item.id);
    const updated = existing
      ? get().items.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      : [...get().items, { ...item, qty: 1 }];
    set({ items: updated, itemCount: updated.reduce((n, i) => n + i.qty, 0) });
  },

  removeItem: (id) => {
    const updated = get().items.filter((i) => i.id !== id);
    set({ items: updated, itemCount: updated.reduce((n, i) => n + i.qty, 0) });
  },

  updateQty: (id, qty) => {
    const updated = qty <= 0
      ? get().items.filter((i) => i.id !== id)
      : get().items.map((i) => i.id === id ? { ...i, qty } : i);
    set({ items: updated, itemCount: updated.reduce((n, i) => n + i.qty, 0) });
  },

  clearCart: () => set({ items: [], itemCount: 0 }),
}));
