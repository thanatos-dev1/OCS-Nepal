import type { WishlistItem } from "./types";
import { adaptProduct, type ApiProduct } from "./products";
import api from "./client";

type ApiWishlistItem = {
  ID?: number;
  id?: number;
  product_id?: number;
  ProductID?: number;
  product?: ApiProduct;
  Product?: ApiProduct;
};

function adaptWishlistItem(w: ApiWishlistItem): WishlistItem {
  const productData = w.product ?? w.Product ?? {};
  const productId = w.product_id ?? w.ProductID ?? 0;
  return {
    id: w.ID ?? w.id,
    productId,
    product: adaptProduct(productData as ApiProduct),
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
