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
  showInBar: boolean;
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
  isFeatured: boolean;
  isNewArrival: boolean;
  salePrice?: number;
};

export type Offer = {
  id: string;
  productId: string;
  product: Product;
  salePrice: number;
  discountPercent: number;
  startsAt: string;
  endsAt?: string;
  label?: string;
};

export type OfferInput = {
  product_id: number;
  sale_price: number;
  starts_at: string;
  ends_at?: string;
  label?: string;
};

export type OrderStatus = "pending" | "confirmed" | "out_for_delivery" | "delivered" | "cancelled";

export type Order = {
  id: string;
  status: OrderStatus;
  createdAt: string;
  total: number;
  deliveryAddress: string;
  phone: string;
  note?: string;
  rejectionReason?: string;
  trackingNumber?: string;
  items: { productId: string; name: string; price: number; qty: number }[];
  user?: { id: number; name: string; email: string };
};

export type CouponType = "percent" | "fixed";

export type Coupon = {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrder?: number;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
};

export type CouponInput = {
  code: string;
  type: CouponType;
  value: number;
  min_order?: number;
  max_uses?: number;
  is_active: boolean;
  expires_at?: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isBlocked: boolean;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
};
