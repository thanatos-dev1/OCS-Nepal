'use client';

import { useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import HeroSlideModal from "@/components/admin/HeroSlideModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import {
  useAdminHeroSlidesQuery,
  useCreateHeroSlideMutation,
  useUpdateHeroSlideMutation,
  useDeleteHeroSlideMutation,
} from "@/hooks/useHeroSlides";
import type { HeroSlide } from "@/lib/api/hero";

export default function AdminHeroSlidesPage() {
  const [modal, setModal] = useState<{ open: boolean; slide: HeroSlide | null }>({ open: false, slide: null });
  const [deleteTarget, setDeleteTarget] = useState<HeroSlide | null>(null);

  const { data: slides = [], isLoading } = useAdminHeroSlidesQuery();
  const createMutation = useCreateHeroSlideMutation();
  const updateMutation = useUpdateHeroSlideMutation(modal.slide);
  const deleteMutation = useDeleteHeroSlideMutation();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text">Hero Slides</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {slides.length} total · auto-rotates on the homepage hero
          </p>
        </div>
        <Button size="sm" onClick={() => setModal({ open: true, slide: null })}>
          <Plus size={15} /> Add Slide
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-4/5 rounded-xl bg-bg-subtle animate-pulse" />
          ))}
        </div>
      ) : slides.length === 0 ? (
        <div className="rounded-xl border border-border border-dashed p-8 text-center">
          <p className="text-sm text-text-muted mb-4">No slides yet. The hero image area on the homepage will be hidden until you add one.</p>
          <Button size="sm" onClick={() => setModal({ open: true, slide: null })}>
            <Plus size={15} /> Add the first one
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {slides.map((s) => (
            <div key={s.id} className="rounded-xl border border-border overflow-hidden bg-bg flex flex-col">
              <div className="relative aspect-4/5 bg-bg-subtle">
                <Image
                  src={s.imageUrl}
                  alt={s.caption || `Slide ${s.id}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
                <span className={`absolute top-2 left-2 inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${s.isActive ? "text-success bg-success-light" : "text-text-muted bg-bg"}`}>
                  {s.isActive ? "Active" : "Hidden"}
                </span>
              </div>
              <div className="p-3 flex flex-col gap-1 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-text truncate flex-1">
                    {s.caption || <span className="text-text-muted italic">No caption</span>}
                  </p>
                  <span className="text-xs text-text-muted shrink-0">#{s.sortOrder}</span>
                </div>
                {s.linkUrl && (
                  <p className="text-xs text-text-muted font-mono truncate">{s.linkUrl}</p>
                )}
                <div className="flex items-center justify-end gap-1 mt-2">
                  <button
                    onClick={() => setModal({ open: true, slide: s })}
                    className="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-primary-light transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(s)}
                    className="p-1.5 rounded-md text-text-muted hover:text-error hover:bg-error-light transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <HeroSlideModal
          initial={modal.slide}
          onCreate={async (form) => { await createMutation.mutateAsync(form); }}
          onUpdate={async (input) => { await updateMutation.mutateAsync(input); }}
          onClose={() => setModal({ open: false, slide: null })}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete slide?"
          description="This slide will be removed from the homepage hero. The uploaded image will remain in Cloudinary."
          loading={deleteMutation.isPending}
          onConfirm={async () => {
            await deleteMutation.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
