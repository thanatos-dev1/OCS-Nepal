'use client';

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadCategoryCover } from "@/lib/api/categories";
import { queryKeys } from "@/lib/queries";

interface Props {
  categoryId: number;
  currentUrl: string;
}

export default function CategoryCoverUploader({ categoryId, currentUrl }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const qc = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadCategoryCover(categoryId, file),
    onSuccess: (cat) => {
      setPreviewUrl(cat.coverImageUrl);
      qc.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    await uploadMutation.mutateAsync(file);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-text">Cover image</span>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploadMutation.isPending}
        className="w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-accent transition-colors flex flex-col items-center justify-center gap-2 overflow-hidden relative bg-bg-subtle"
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Cover preview"
            fill
            sizes="(max-width: 640px) 100vw, 24rem"
            className="object-cover"
          />
        ) : (
          <>
            <ImagePlus size={24} className="text-text-muted" />
            <span className="text-sm text-text-muted">Click to upload</span>
          </>
        )}
        {uploadMutation.isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Loader2 size={20} className="text-white animate-spin" />
          </div>
        )}
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <p className="text-xs text-text-muted">
        Used as the big tile on the homepage. Aim for a landscape product photo or category banner.
      </p>
    </div>
  );
}
