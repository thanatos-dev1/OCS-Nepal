'use client';

import { useEffect, useState } from "react";
import { useCategoriesQuery } from "@/hooks/useCategories";
import {
  useBrandCategoryIdsQuery,
  useSetBrandCategoryIdsMutation,
} from "@/hooks/useSeries";

interface Props {
  brandId: number;
}

export default function BrandCategoryLinks({ brandId }: Props) {
  const { data: categories = [], isLoading } = useCategoriesQuery();
  const { data: linkedIds = [], isLoading: linksLoading } = useBrandCategoryIdsQuery(brandId);
  const setLinksMutation = useSetBrandCategoryIdsMutation(brandId);

  // Local set of selected category IDs. Initialized from server data once
  // they load; "Save categories" commits the diff.
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!linksLoading && !hydrated) {
      setSelected(new Set(linkedIds));
      setHydrated(true);
    }
  }, [linksLoading, linkedIds, hydrated]);

  // Top-level categories only — sub-categories inherit from their parent in
  // the mega-menu anyway.
  const topLevel = categories.filter((c) => !c.parentId);

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const dirty =
    hydrated &&
    (selected.size !== linkedIds.length || linkedIds.some((id) => !selected.has(id)));

  async function handleSave() {
    await setLinksMutation.mutateAsync(Array.from(selected));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text">Show in categories</span>
        {dirty && (
          <button
            type="button"
            onClick={handleSave}
            disabled={setLinksMutation.isPending}
            className="text-xs font-medium text-accent hover:text-accent-hover disabled:opacity-40"
          >
            {setLinksMutation.isPending ? "Saving…" : "Save categories"}
          </button>
        )}
      </div>

      {isLoading || linksLoading ? (
        <p className="text-xs text-text-muted">Loading…</p>
      ) : topLevel.length === 0 ? (
        <p className="text-xs text-text-muted italic">No categories yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-1 rounded-md border border-border">
          {topLevel.map((c) => {
            const id = parseInt(c.id, 10);
            return (
              <label key={c.id} className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-bg-subtle">
                <input
                  type="checkbox"
                  checked={selected.has(id)}
                  onChange={() => toggle(id)}
                  className="w-3.5 h-3.5 rounded border-border accent-accent"
                />
                <span className="text-sm text-text truncate">{c.name}</span>
              </label>
            );
          })}
        </div>
      )}
      <p className="text-xs text-text-muted">
        The brand appears in the mega-menu under each selected top-level category.
      </p>
    </div>
  );
}
