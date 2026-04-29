import adminApi from "../adminClient";
import type { Customer, Order } from "../types";
import { adaptOrder, type ApiOrder } from "../orders";

type ApiCustomer = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  is_blocked: boolean;
  created_at: string;
  order_count: number;
  total_spent: number;
};

function adaptCustomer(c: ApiCustomer): Customer {
  return {
    id: String(c.id),
    name: c.name,
    email: c.email,
    phone: c.phone,
    isBlocked: c.is_blocked,
    createdAt: c.created_at,
    orderCount: c.order_count,
    totalSpent: c.total_spent,
  };
}

export async function adminGetCustomers(q?: string): Promise<Customer[]> {
  const params: Record<string, string> = {};
  if (q) params.q = q;
  const { data } = await adminApi.get<ApiCustomer[]>("/admin/customers", { params });
  return Array.isArray(data) ? data.map(adaptCustomer) : [];
}

export async function adminGetCustomer(id: string): Promise<Customer> {
  const { data } = await adminApi.get<ApiCustomer>(`/admin/customers/${id}`);
  return adaptCustomer(data);
}

export async function adminGetCustomerOrders(id: string): Promise<Order[]> {
  const { data } = await adminApi.get<ApiOrder[]>(`/admin/customers/${id}/orders`);
  return Array.isArray(data) ? data.map(adaptOrder) : [];
}

export async function adminBlockCustomer(id: string): Promise<void> {
  await adminApi.put(`/admin/customers/${id}/block`);
}

export async function adminUnblockCustomer(id: string): Promise<void> {
  await adminApi.put(`/admin/customers/${id}/unblock`);
}
