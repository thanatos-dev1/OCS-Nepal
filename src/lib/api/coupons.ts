import type { Coupon, CouponInput } from "./types";
import api from "./client";

type ApiCoupon = {
  id: number;
  code: string;
  type: string;
  value: number;
  min_order?: number;
  max_uses?: number;
  used_count: number;
  is_active: boolean;
  expires_at?: string;
};

function adaptCoupon(c: ApiCoupon): Coupon {
  return {
    id: String(c.id),
    code: c.code,
    type: c.type as Coupon["type"],
    value: c.value,
    minOrder: c.min_order,
    maxUses: c.max_uses,
    usedCount: c.used_count,
    isActive: c.is_active,
    expiresAt: c.expires_at,
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
  valid: boolean;
  discountAmount: number;
  finalTotal: number;
  couponCode: string;
};

export async function validateCoupon(
  code: string,
  orderTotal: number,
): Promise<CouponValidationResult> {
  const { data } = await api.post<{
    valid: boolean;
    discount_amount: number;
    final_total: number;
  }>("/coupons/validate", { code, order_total: orderTotal });
  return {
    valid: data.valid,
    discountAmount: data.discount_amount,
    finalTotal: data.final_total,
    couponCode: code,
  };
}
