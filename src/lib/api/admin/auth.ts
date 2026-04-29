import axios from "axios";
import adminApi from "../adminClient";
import type { AdminRole } from "../types";

export type AdminAuthResult = {
  accessToken: string;
  adminId: number;
  role: AdminRole;
};

export async function adminLogin(email: string, password: string): Promise<AdminAuthResult> {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/auth/login`,
    { email, password },
  );
  const raw = res.data?.data ?? res.data;
  return {
    accessToken: raw.access_token,
    adminId: raw.admin_id,
    role: raw.role as AdminRole,
  };
}

type ApiAdminMe = {
  ID: number;
  Role: AdminRole;
  IsActive: boolean;
  UserID: number;
  User: {
    ID: number;
    Name: string;
    Email: string;
  };
};

export async function adminGetMe(): Promise<{ adminId: number; role: AdminRole; name: string; email: string }> {
  const { data } = await adminApi.get<ApiAdminMe>("/admin/auth/me");
  return {
    adminId: data.ID,
    role: data.Role,
    name: data.User.Name,
    email: data.User.Email,
  };
}
