import type { Customer, Order } from "./types";
import { adaptOrder } from "./orders";
import api from "./client";

type ApiCustomer = {
  ID: number;
  Name: string;
  Email: string;
  Phone?: string;
  IsBlocked: boolean;
  CreatedAt: string;
  OrderCount: number;
  TotalSpent: number;
};

function adaptCustomer(c: ApiCustomer): Customer {
  return {
    id: String(c.ID),
    name: c.Name,
    email: c.Email,
    phone: c.Phone,
    isBlocked: c.IsBlocked,
    createdAt: c.CreatedAt,
    orderCount: c.OrderCount,
    totalSpent: c.TotalSpent,
  };
}

export async function getCustomers(): Promise<Customer[]> {
  const { data } = await api.get<ApiCustomer[]>("/admin/customers");
  return Array.isArray(data) ? data.map(adaptCustomer) : [];
}

export async function getCustomer(id: string): Promise<Customer> {
  const { data } = await api.get<ApiCustomer>(`/admin/customers/${id}`);
  return adaptCustomer(data);
}

export async function getCustomerOrders(id: string): Promise<Order[]> {
  const { data } = await api.get<Parameters<typeof adaptOrder>[0][]>(`/admin/customers/${id}/orders`);
  return Array.isArray(data) ? data.map(adaptOrder) : [];
}

export async function blockCustomer(id: string): Promise<Customer> {
  const { data } = await api.put<ApiCustomer>(`/admin/customers/${id}/block`);
  return adaptCustomer(data);
}

export async function unblockCustomer(id: string): Promise<Customer> {
  const { data } = await api.put<ApiCustomer>(`/admin/customers/${id}/unblock`);
  return adaptCustomer(data);
}
