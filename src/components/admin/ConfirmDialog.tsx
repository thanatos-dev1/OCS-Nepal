'use client';

import Button from "@/components/ui/Button";

interface Props {
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  description,
  confirmLabel = "Delete",
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="fixed inset-0 z-overlay flex items-center justify-center bg-black/40">
      <div className="bg-bg rounded-xl shadow-lg p-6 w-full max-w-sm mx-4">
        <h2 className="text-base font-semibold text-text">{title}</h2>
        <p className="mt-1.5 text-sm text-text-muted">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} isLoading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
