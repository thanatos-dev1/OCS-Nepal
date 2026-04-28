import axios from "axios";
import type { AdminRole } from "../types";

export type AdminAuthResult = {
  accessToken: string;
  adminId: number;
  role: AdminRole;
};

export async function adminLogin(email: string, password: string): Promise<AdminAuthResult> {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/auth/login`,
    { email, password },
  );
  const raw = res.data?.data ?? res.data;
  return {
    accessToken: raw.access_token,
    adminId: raw.admin_id,
    role: raw.role as AdminRole,
  };
}
