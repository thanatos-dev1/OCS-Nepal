'use client';

import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { HeroSlide } from "@/lib/api/hero";

interface Props {
  initial?: HeroSlide | null;
  // For create, called with FormData (multipart upload).
  // For edit, called with a partial JSON payload.
  onCreate: (form: FormData) => Promise<void>;
  onUpdate: (input: { link_url?: string; caption?: string; sort_order?: number; is_active?: boolean }) => Promise<void>;
  onClose: () => void;
}

export default function HeroSlideModal({ initial, onCreate, onUpdate, onClose }: Props) {
  const [linkUrl, setLinkUrl] = useState(initial?.linkUrl ?? "");
  const [caption, setCaption] = useState(initial?.caption ?? "");
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initial?.imageUrl ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => { if (imageFile && imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview); };
  }, [imageFile, imagePreview]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!initial && !imageFile) {
      setError("Image is required");
      return;
    }

    setLoading(true);
    try {
      if (initial) {
        // Edit: backend route is JSON. Image change on edit is not supported in this MVP
        // — delete + recreate if a new image is needed.
        await onUpdate({
          link_url: linkUrl.trim(),
          caption: caption.trim(),
          sort_order: parseInt(sortOrder, 10) || 0,
          is_active: isActive,
        });
      } else {
        const form = new FormData();
        if (imageFile) form.append("image", imageFile);
        if (linkUrl.trim()) form.append("link_url", linkUrl.trim());
        if (caption.trim()) form.append("caption", caption.trim());
        form.append("sort_order", String(parseInt(sortOrder, 10) || 0));
        form.append("is_active", String(isActive));
        await onCreate(form);
      }
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-overlay flex items-center justify-center bg-black/40 p-4">
      <div className="bg-bg rounded-xl shadow-lg w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text">
            {initial ? "Edit Hero Slide" : "New Hero Slide"}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div>
            <span className="text-sm font-medium text-text block mb-1.5">Image</span>
            <button
              type="button"
              onClick={() => !initial && fileRef.current?.click()}
              disabled={!!initial}
              className="w-full aspect-4/5 rounded-lg border-2 border-dashed border-border hover:border-accent transition-colors flex flex-col items-center justify-center gap-2 overflow-hidden relative disabled:cursor-not-allowed"
            >
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <>
                  <ImagePlus size={24} className="text-text-muted" />
                  <span className="text-sm text-text-muted">Click to upload image</span>
                </>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            {initial && (
              <p className="mt-1.5 text-xs text-text-muted">To change the image, delete this slide and create a new one.</p>
            )}
          </div>

          <Input
            id="slide-link"
            label="Link URL (optional)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="/products?category=ssd"
          />

          <Input
            id="slide-caption"
            label="Caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Summer Sale — 20% off"
          />

          <Input
            id="slide-sort"
            label="Sort order"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            placeholder="0"
          />

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-accent"
            />
            <span className="text-sm font-medium text-text">Active</span>
          </label>

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={loading}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
