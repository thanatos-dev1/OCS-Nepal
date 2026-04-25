export const queryKeys = {
  products: ["products"] as const,
  product: (id: string) => ["products", id] as const,
  categories: ["categories"] as const,
  cart: ["cart"] as const,
  profile: ["profile"] as const,
};
