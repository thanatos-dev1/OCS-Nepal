import api from "./client";
import type { AuthUser } from "@/stores/authStore";

type ApiUser = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
  purchase_badge?: boolean;
  role: "customer" | "staff" | "owner";
};

function adaptUser(u: ApiUser): AuthUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    address: u.address,
    avatarUrl: u.avatar_url,
    purchaseBadge: u.purchase_badge,
    role: u.role,
  };
}

export async function login(email: string, password: string): Promise<{ access_token: string; role: string }> {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function register(
  name: string,
  email: string,
  password: string,
  phone?: string,
  address?: string,
): Promise<{ message: string }> {
  const { data } = await api.post("/auth/register", { name, email, password, phone, address });
  return data;
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  const { data } = await api.get("/auth/verify", { params: { token } });
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function getProfile(): Promise<AuthUser> {
  const { data } = await api.get<ApiUser>("/me");
  return adaptUser(data);
}

export async function updateProfile(
  name: string,
  phone?: string,
  address?: string
): Promise<AuthUser> {
  const { data } = await api.put<ApiUser>("/me", { name, phone, address });
  return adaptUser(data);
}

export async function uploadAvatar(file: File): Promise<AuthUser> {
  const form = new FormData();
  form.append("avatar", file);
  const { data } = await api.post<ApiUser>("/me/avatar", form);
  return adaptUser(data);
}

export async function changePassword(
  current_password: string,
  new_password: string
): Promise<void> {
  await api.put("/auth/change-password", { current_password, new_password });
}
