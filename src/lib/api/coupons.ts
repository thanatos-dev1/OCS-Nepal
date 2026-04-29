import type { Coupon, CouponInput } from "./types";
import api from "./client";

type ApiCoupon = {
  ID: number;
  Code: string;
  Type: string;
  Value: number;
  MinOrder?: number;
  MaxUses?: number;
  UsedCount: number;
  IsActive: boolean;
  ExpiresAt?: string;
};

function adaptCoupon(c: ApiCoupon): Coupon {
  return {
    id: String(c.ID),
    code: c.Code,
    type: c.Type as Coupon["type"],
    value: c.Value,
    minOrder: c.MinOrder,
    maxUses: c.MaxUses,
    usedCount: c.UsedCount,
    isActive: c.IsActive,
    expiresAt: c.ExpiresAt,
  };
}

export async function getCoupons(): Promise<Coupon[]> {
  const { data } = await api.get<ApiCoupon[]>("/admin/coupons");
  return Array.isArray(data) ? data.map(adaptCoupon) : [];
}

export async function createCoupon(input: CouponInput): Promise<Coupon> {
  const { data } = await api.post<ApiCoupon>("/admin/coupons", input);
  return adaptCoupon(data);
}

export async function updateCoupon(id: number, input: CouponInput): Promise<Coupon> {
  const { data } = await api.put<ApiCoupon>(`/admin/coupons/${id}`, input);
  return adaptCoupon(data);
}

export async function deleteCoupon(id: number): Promise<void> {
  await api.delete(`/admin/coupons/${id}`);
}

export type CouponValidationResult = {
  discountAmount: number;
  couponCode: string;
  coupon: Coupon;
};

export async function validateCoupon(
  code: string,
  cartTotal: number,
): Promise<CouponValidationResult> {
  const { data } = await api.post<{
    valid: boolean;
    discount_amount: number;
    coupon: ApiCoupon;
  }>("/coupons/validate", { code, cart_total: cartTotal });
  return {
    discountAmount: data.discount_amount,
    couponCode: data.coupon.Code,
    coupon: adaptCoupon(data.coupon),
  };
}
