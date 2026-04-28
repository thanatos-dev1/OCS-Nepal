import adminApi from "../adminClient";
import type { AdminUser, AdminRole, AuditLog } from "../types";

type ApiAdminUser = {
  id: number;
  user_id: number;
  name: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
};

type ApiAuditLog = {
  id: number;
  admin_id: number;
  admin_name: string;
  action: string;
  entity: string;
  entity_id: number;
  ip: string;
  created_at: string;
};

function adaptAdminUser(a: ApiAdminUser): AdminUser {
  return {
    id: a.id,
    userId: a.user_id,
    name: a.name,
    email: a.email,
    role: a.role,
    isActive: a.is_active,
    createdAt: a.created_at,
  };
}

function adaptAuditLog(l: ApiAuditLog): AuditLog {
  return {
    id: l.id,
    adminId: l.admin_id,
    adminName: l.admin_name,
    action: l.action,
    entity: l.entity,
    entityId: l.entity_id,
    ip: l.ip,
    createdAt: l.created_at,
  };
}

export async function adminGetAdmins(): Promise<AdminUser[]> {
  const { data } = await adminApi.get<ApiAdminUser[]>("/api/v1/admin/admins");
  return Array.isArray(data) ? data.map(adaptAdminUser) : [];
}

export async function adminInviteAdmin(userId: number, role: AdminRole): Promise<AdminUser> {
  const { data } = await adminApi.post<ApiAdminUser>("/api/v1/admin/admins/invite", {
    user_id: userId,
    role,
  });
  return adaptAdminUser(data);
}

export async function adminDeactivateAdmin(id: number): Promise<void> {
  await adminApi.put(`/api/v1/admin/admins/${id}/deactivate`);
}

export async function adminGetAuditLogs(limit = 50, offset = 0): Promise<AuditLog[]> {
  const { data } = await adminApi.get<ApiAuditLog[]>(
    `/api/v1/admin/audit-logs?limit=${limit}&offset=${offset}`,
  );
  return Array.isArray(data) ? data.map(adaptAuditLog) : [];
}
