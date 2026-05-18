'use client';

import { useRef, useState } from "react";
import Image from "next/image";
import { Star, Trash2, ImagePlus, Loader2 } from "lucide-react";
import {
  useUploadProductImagesMutation,
  useDeleteProductImageMutation,
  useSetPrimaryImageMutation,
} from "@/hooks/useProducts";
import type { ProductImage } from "@/lib/api/types";

interface Props {
  productId: number;
  images: ProductImage[];
}

export default function ProductImageGallery({ productId, images }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const uploadMutation = useUploadProductImagesMutation(productId);
  const deleteMutation = useDeleteProductImageMutation(productId);
  const setPrimaryMutation = useSetPrimaryImageMutation(productId);

  // Track which image is mid-action so we can disable its buttons.
  const [pendingId, setPendingId] = useState<number | null>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow re-selecting the same file
    if (files.length === 0) return;
    setStatusMessage("");
    const { succeeded, failed } = await uploadMutation.mutateAsync(files);
    if (failed === 0) {
      setStatusMessage(`Uploaded ${succeeded} image${succeeded === 1 ? "" : "s"}.`);
    } else {
      setStatusMessage(`Uploaded ${succeeded} of ${succeeded + failed} — ${failed} failed.`);
    }
  }

  async function handleSetPrimary(imageId: number) {
    setPendingId(imageId);
    try { await setPrimaryMutation.mutateAsync(imageId); }
    finally { setPendingId(null); }
  }

  async function handleDelete(imageId: number) {
    setPendingId(imageId);
    try { await deleteMutation.mutateAsync(imageId); }
    finally { setPendingId(null); }
  }

  const sorted = [...images].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text">Gallery</span>
        <span className="text-xs text-text-muted">{images.length} image{images.length === 1 ? "" : "s"}</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {sorted.map((img) => {
          const isPending = pendingId === img.id;
          return (
            <div key={img.id} className="relative aspect-square rounded-md overflow-hidden border border-border bg-bg-subtle group">
              <Image
                src={img.url}
                alt={img.altText || "Product image"}
                fill
                sizes="(max-width: 640px) 33vw, 25vw"
                className="object-cover"
              />
              {img.isPrimary && (
                <span className="absolute top-1 left-1 inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-accent text-white">
                  <Star size={10} fill="currentColor" /> Primary
                </span>
              )}
              {isPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Loader2 size={18} className="text-white animate-spin" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 p-1 bg-linear-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(img.id)}
                    disabled={isPending}
                    className="p-1 rounded text-white hover:bg-white/20 transition-colors"
                    title="Set as primary"
                  >
                    <Star size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  disabled={isPending}
                  className="p-1 rounded text-white hover:bg-error/80 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="aspect-square rounded-md border-2 border-dashed border-border hover:border-accent transition-colors flex flex-col items-center justify-center gap-1 text-text-muted disabled:opacity-50"
        >
          {uploadMutation.isPending ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              <ImagePlus size={20} />
              <span className="text-[10px] font-medium">Add images</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      {statusMessage && (
        <p className={`text-xs ${statusMessage.includes("failed") ? "text-error" : "text-success"}`}>
          {statusMessage}
        </p>
      )}
    </div>
  );
}
