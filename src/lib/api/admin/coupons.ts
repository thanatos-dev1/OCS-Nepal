import adminApi from "../adminClient";
import type { Coupon, CouponInput } from "../types";

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

export async function adminGetCoupons(): Promise<Coupon[]> {
  const { data } = await adminApi.get<ApiCoupon[]>("/api/v1/admin/coupons");
  return Array.isArray(data) ? data.map(adaptCoupon) : [];
}

export async function adminCreateCoupon(input: CouponInput): Promise<Coupon> {
  const { data } = await adminApi.post<ApiCoupon>("/api/v1/admin/coupons", input);
  return adaptCoupon(data);
}

export async function adminUpdateCoupon(id: number, input: CouponInput): Promise<Coupon> {
  const { data } = await adminApi.put<ApiCoupon>(`/api/v1/admin/coupons/${id}`, input);
  return adaptCoupon(data);
}

export async function adminDeleteCoupon(id: number): Promise<void> {
  await adminApi.delete(`/api/v1/admin/coupons/${id}`);
}
