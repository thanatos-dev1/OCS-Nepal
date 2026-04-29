export type Brand = {
  id: string;
  name: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  sortOrder: number;
  parentId: string | null;
  productCount: number;
  showInBar: boolean;
};

export type ProductImage = {
  id: number;
  url: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
};

export type ProductSpec = {
  key: string;
  value: string;
  sortOrder: number;
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
  lowStockThreshold: number;
  brand?: string;
  badge?: string;
  description: string;
  specs: ProductSpec[];
  images: ProductImage[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isActive: boolean;
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

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type OrderStatusLog = {
  fromStatus: string;
  toStatus: string;
  note?: string;
  createdAt: string;
};

export type OrderItemSnapshot = {
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
};

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  name: string;
  price: number;
  qty: number;
  snapshot?: OrderItemSnapshot;
};

export type Order = {
  id: string;
  status: OrderStatus;
  createdAt: string;
  subtotal: number;
  shippingAmount: number;
  total: number;
  deliveryAddress: string;
  phone: string;
  note?: string;
  rejectionReason?: string;
  trackingNumber?: string;
  guestEmail?: string;
  shippingAddressId?: number;
  couponCode?: string;
  discountAmount?: number;
  statusLogs: OrderStatusLog[];
  items: OrderItem[];
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

// Addresses
export type Address = {
  id: number;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export type AddressInput = {
  full_name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

// Wishlist
export type WishlistItem = {
  id?: number;
  productId: number;
  product: Product;
};

// Reviews
export type Review = {
  id: number;
  rating: number;
  title: string;
  body: string;
  user: { id?: number; name: string; avatarUrl?: string };
  isVerified: boolean;
  createdAt: string;
};

export type ReviewInput = {
  rating: number;
  title: string;
  body: string;
};

// Returns
export type ReturnStatus = "pending" | "approved" | "rejected";

export type Return = {
  id: number;
  orderId: string;
  orderItemId: number;
  reason: string;
  status: ReturnStatus;
  notes?: string;
  createdAt: string;
  resolvedAt?: string | null;
  order?: Partial<Order>;
  item?: Partial<OrderItem>;
};

// Admin
export type AdminRole = "super_admin" | "manager" | "staff";

export type AdminUser = {
  id: number;
  userId: number;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
};

export type AuditLog = {
  id: number;
  adminId: number;
  adminName: string;
  action: string;
  entity: string;
  entityId: number;
  ip: string;
  createdAt: string;
};
