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
  ID: number;
  UserID: number;
  ProductID: number;
  Quantity: number;
  Product: {
    ID: number;
    Name: string;
    Price: number;
    ImageURL?: string;
    Stock?: number;
  };
};

function adaptItem(item: ApiCartItem): CartItem {
  return {
    id: item.ID,
    userId: item.UserID,
    productId: item.ProductID,
    quantity: item.Quantity,
    product: {
      id: item.Product.ID,
      name: item.Product.Name,
      price: item.Product.Price,
      imageUrl: item.Product.ImageURL,
      stock: item.Product.Stock,
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
