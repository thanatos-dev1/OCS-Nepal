import type { WishlistItem } from "./types";
import { adaptProduct, type ApiProduct } from "./products";
import api from "./client";

type ApiWishlistItem = {
  product_id: number;
  product: ApiProduct;
};

function adaptWishlistItem(w: ApiWishlistItem): WishlistItem {
  return {
    productId: w.product_id,
    product: adaptProduct(w.product),
  };
}

export async function getWishlist(): Promise<WishlistItem[]> {
  const { data } = await api.get<ApiWishlistItem[]>("/me/wishlist");
  return Array.isArray(data) ? data.map(adaptWishlistItem) : [];
}

export async function addToWishlist(productId: number): Promise<void> {
  await api.post("/me/wishlist", { product_id: productId });
}

export async function removeFromWishlist(productId: number): Promise<void> {
  await api.delete(`/me/wishlist/${productId}`);
}
