import api from "./client";

export type CartItem = {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
    stock?: number;
  };
};

type ApiCartItem = {
  id?: number;
  ID?: number;
  user_id?: number;
  UserID?: number;
  product_id?: number;
  ProductID?: number;
  quantity?: number;
  Quantity?: number;
  product?: {
    id?: number;
    ID?: number;
    name?: string;
    Name?: string;
    price?: number;
    Price?: number;
    image_url?: string;
    ImageURL?: string;
    stock?: number;
    Stock?: number;
  };
  Product?: {
    ID?: number;
    Name?: string;
    Price?: number;
    ImageURL?: string;
    Stock?: number;
  };
};

function adaptItem(item: ApiCartItem): CartItem {
  const p = item.product ?? item.Product ?? {};
  return {
    id: item.id ?? item.ID ?? 0,
    userId: item.user_id ?? item.UserID ?? 0,
    productId: item.product_id ?? item.ProductID ?? 0,
    quantity: item.quantity ?? item.Quantity ?? 0,
    product: {
      id: (p as {id?: number; ID?: number}).id ?? (p as {id?: number; ID?: number}).ID ?? 0,
      name: (p as {name?: string; Name?: string}).name ?? (p as {name?: string; Name?: string}).Name ?? "",
      price: (p as {price?: number; Price?: number}).price ?? (p as {price?: number; Price?: number}).Price ?? 0,
      imageUrl: (p as {image_url?: string; ImageURL?: string}).image_url ?? (p as {image_url?: string; ImageURL?: string}).ImageURL,
      stock: (p as {stock?: number; Stock?: number}).stock ?? (p as {stock?: number; Stock?: number}).Stock,
    },
  };
}

export async function getCart(): Promise<CartItem[]> {
  const { data } = await api.get<ApiCartItem[]>("/cart");
  return Array.isArray(data) ? data.map(adaptItem) : [];
}

export async function addToCart(productId: number, quantity: number): Promise<CartItem> {
  const { data } = await api.post<ApiCartItem>("/cart/items", { product_id: productId, quantity });
  return adaptItem(data);
}

export async function updateCartItem(productId: number, quantity: number): Promise<CartItem> {
  const { data } = await api.put<ApiCartItem>(`/cart/items/${productId}`, { quantity });
  return adaptItem(data);
}

export async function removeCartItem(productId: number): Promise<void> {
  await api.delete(`/cart/items/${productId}`);
}

export async function clearCart(): Promise<void> {
  await api.delete("/cart");
}
