"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminGetReturns, adminApproveReturn, adminRejectReturn } from "@/lib/api/admin/returns";
import { queryKeys } from "@/lib/queries";
import Button from "@/components/ui/Button";
import type { ReturnStatus } from "@/lib/api/types";

const STATUS_TABS: { key: ReturnStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-success-light text-success",
  rejected: "bg-error-light text-error",
};

function NotesModal({
  title,
  onConfirm,
  onClose,
  isPending,
}: {
  title: string;
  onConfirm: (notes: string) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [notes, setNotes] = useState("");
  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-bg rounded-2xl border border-border shadow-xl w-full max-w-sm p-6">
        <h3 className="font-bold text-text mb-4">{title}</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes…"
          rows={3}
          className="w-full rounded-md border border-border bg-bg-subtle px-3 py-2 text-sm text-text placeholder:text-text-disabled resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <div className="flex gap-3 mt-4">
          <Button variant="primary" size="md" isLoading={isPending} onClick={() => onConfirm(notes)}>
            Confirm
          </Button>
          <Button variant="outline" size="md" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminReturnsPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<ReturnStatus | "all">("all");
  const [action, setAction] = useState<{ type: "approve" | "reject"; id: number } | null>(null);

  const { data: returns = [], isLoading } = useQuery({
    queryKey: queryKeys.adminReturns(activeTab === "all" ? undefined : activeTab),
    queryFn: () => adminGetReturns(activeTab === "all" ? undefined : activeTab),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) => adminApproveReturn(id, notes || undefined),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminReturns"] }); setAction(null); },
  });
  const rejectMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) => adminRejectReturn(id, notes || undefined),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminReturns"] }); setAction(null); },
  });

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-text mb-6">Returns</h1>

      <div className="flex flex-wrap gap-1 mb-6 border-b border-border pb-0">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 text-sm font-medium transition-colors rounded-t-md border-b-2 -mb-px ${
              activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-bg-subtle rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {returns.map((r) => (
            <div key={r.id} className="bg-bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-text">Return #{r.id}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[r.status] ?? "bg-bg-subtle text-text-muted"}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted">Order #{r.orderId} · Item #{r.orderItemId}</p>
                  {r.item && (
                    <p className="text-sm text-text mt-1">{r.item.productName} ×{r.item.qty}</p>
                  )}
                  <p className="text-sm text-text-muted mt-2 italic">"{r.reason}"</p>
                  {r.notes && <p className="text-xs text-text-muted mt-1">Note: {r.notes}</p>}
                </div>
                {r.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setAction({ type: "approve", id: r.id })}
                      className="bg-success hover:bg-success/90 border-success"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAction({ type: "reject", id: r.id })}
                      className="border-error text-error hover:bg-error-light"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {returns.length === 0 && (
            <div className="text-center py-12 text-text-muted">No return requests</div>
          )}
        </div>
      )}

      {action && (
        <NotesModal
          title={action.type === "approve" ? "Approve Return" : "Reject Return"}
          onConfirm={(notes) =>
            action.type === "approve"
              ? approveMutation.mutate({ id: action.id, notes })
              : rejectMutation.mutate({ id: action.id, notes })
          }
          onClose={() => setAction(null)}
          isPending={approveMutation.isPending || rejectMutation.isPending}
        />
      )}
    </div>
  );
}
