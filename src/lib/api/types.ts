export type Brand = {
  id: string;
  name: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
};

export type ProductSpec = {
  label: string;
  value: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  category: string;
  categorySlug: string;
  price: number;
  inStock: boolean;
  stockCount: number;
  brand?: string;
  badge?: string;
  description: string;
  specs: ProductSpec[];
  images: string[];
};

export type Order = {
  id: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  total: number;
  items: { productId: string; name: string; price: number; qty: number }[];
};
