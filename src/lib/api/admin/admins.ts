import adminApi from "../adminClient";
import type { AdminUser, AdminRole, AuditLog } from "../types";

type ApiAdminUser = {
  ID: number;
  Role: AdminRole;
  IsActive: boolean;
  User: {
    ID: number;
    Name: string;
    Email: string;
  };
  CreatedAt?: string;
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
    id: a.ID,
    userId: a.User.ID,
    name: a.User.Name,
    email: a.User.Email,
    role: a.Role,
    isActive: a.IsActive,
    createdAt: a.CreatedAt ?? "",
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
  const { data } = await adminApi.get<ApiAdminUser[]>("/admin/admins");
  return Array.isArray(data) ? data.map(adaptAdminUser) : [];
}

export async function adminInviteAdmin(userId: number, role: AdminRole): Promise<AdminUser> {
  const { data } = await adminApi.post<ApiAdminUser>("/admin/admins/invite", {
    user_id: userId,
    role,
  });
  return adaptAdminUser(data);
}

export async function adminDeactivateAdmin(id: number): Promise<void> {
  await adminApi.put(`/admin/admins/${id}/deactivate`);
}

export async function adminGetAuditLogs(limit = 50, offset = 0): Promise<AuditLog[]> {
  const { data } = await adminApi.get<ApiAuditLog[]>(
    `/admin/audit-logs?limit=${limit}&offset=${offset}`,
  );
  return Array.isArray(data) ? data.map(adaptAuditLog) : [];
}
