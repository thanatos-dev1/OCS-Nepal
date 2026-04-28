"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserMinus } from "lucide-react";
import { adminGetAdmins, adminInviteAdmin, adminDeactivateAdmin, adminGetAuditLogs } from "@/lib/api/admin/admins";
import { queryKeys } from "@/lib/queries";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { AdminRole } from "@/lib/api/types";
import { useAdminAuthStore } from "@/stores/adminAuthStore";

const ROLES: AdminRole[] = ["super_admin", "manager", "staff"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NP", { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminManagementPage() {
  const qc = useQueryClient();
  const { admin } = useAdminAuthStore();
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<AdminRole>("staff");
  const [inviteError, setInviteError] = useState("");

  const { data: admins = [] } = useQuery({
    queryKey: queryKeys.adminAdmins,
    queryFn: adminGetAdmins,
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: queryKeys.adminAuditLogs,
    queryFn: () => adminGetAuditLogs(50, 0),
  });

  const inviteMutation = useMutation({
    mutationFn: () => adminInviteAdmin(parseInt(userId, 10), role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.adminAdmins });
      setUserId("");
      setInviteError("");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setInviteError(msg ?? "Failed to invite admin");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => adminDeactivateAdmin(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.adminAdmins }),
  });

  if (admin?.role !== "super_admin") {
    return (
      <div className="p-8 text-center py-20">
        <p className="text-text-muted">Access restricted to super_admin only.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-text mb-8">Admin Management</h1>

      {/* Invite form */}
      <div className="bg-bg-card border border-border rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-text mb-4">Invite Admin</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-48">
            <Input
              id="invite-user-id"
              label="User ID"
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="123"
            />
          </div>
          <div className="min-w-40">
            <label className="text-sm font-medium text-text mb-1.5 block">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              className="w-full h-10 px-3 text-sm bg-bg border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
            </select>
          </div>
          <Button
            variant="primary"
            size="md"
            isLoading={inviteMutation.isPending}
            onClick={() => inviteMutation.mutate()}
            disabled={!userId.trim()}
          >
            Invite
          </Button>
        </div>
        {inviteError && <p className="text-xs text-error mt-2">{inviteError}</p>}
      </div>

      {/* Admins table */}
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-subtle text-text-muted text-xs">
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Email</th>
              <th className="text-center px-4 py-3 font-medium">Role</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {admins.map((a) => (
              <tr key={a.id} className="hover:bg-bg-subtle transition-colors">
                <td className="px-4 py-3 font-medium text-text">{a.name}</td>
                <td className="px-4 py-3 text-text-muted hidden md:table-cell">{a.email}</td>
                <td className="px-4 py-3 text-center">
                  <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">{a.role}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  {a.isActive ? (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-success-light text-success">Active</span>
                  ) : (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-bg-subtle text-text-muted">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {a.isActive && a.id !== admin.adminId && (
                    <button
                      type="button"
                      onClick={() => deactivateMutation.mutate(a.id)}
                      disabled={deactivateMutation.isPending}
                      className="p-1.5 text-text-muted hover:text-error transition-colors"
                      title="Deactivate"
                    >
                      <UserMinus size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-text-muted">No admins</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Audit Logs */}
      <h2 className="font-semibold text-text mb-3">Audit Logs</h2>
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-subtle text-text-muted text-xs">
              <th className="text-left px-4 py-3 font-medium">Time</th>
              <th className="text-left px-4 py-3 font-medium">Admin</th>
              <th className="text-left px-4 py-3 font-medium">Action</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Entity</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-bg-subtle">
                <td className="px-4 py-2.5 text-text-muted text-xs">{formatDate(log.createdAt)}</td>
                <td className="px-4 py-2.5 text-text">{log.adminName}</td>
                <td className="px-4 py-2.5 text-text font-mono text-xs">{log.action}</td>
                <td className="px-4 py-2.5 text-text-muted hidden md:table-cell">{log.entity} #{log.entityId}</td>
                <td className="px-4 py-2.5 text-text-muted text-xs hidden lg:table-cell">{log.ip}</td>
              </tr>
            ))}
            {auditLogs.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-text-muted">No audit logs</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
