import api from "./client";
import type { AuthUser } from "@/stores/authStore";

export async function login(email: string, password: string): Promise<{ access_token: string; role: string }> {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<{ message: string }> {
  const { data } = await api.post("/auth/register", { name, email, password });
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
  const { data } = await api.get("/me");
  return data;
}

export async function updateProfile(name: string, phone?: string): Promise<AuthUser> {
  const { data } = await api.put("/me", { name, phone });
  return data;
}

export async function changePassword(
  current_password: string,
  new_password: string
): Promise<void> {
  await api.put("/auth/change-password", { current_password, new_password });
}
