export const queryKeys = {
  products: ["products"] as const,
  product: (id: string) => ["products", id] as const,
  categories: ["categories"] as const,
  cart: ["cart"] as const,
  profile: ["profile"] as const,
  orders: ["orders"] as const,
  order: (id: string) => ["orders", id] as const,
  allOrders: ["allOrders"] as const,
};
