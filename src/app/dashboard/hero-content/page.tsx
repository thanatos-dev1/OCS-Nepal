'use client';

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getHeroContent, upsertHeroContent } from "@/lib/api/heroContent";

const PLACEHOLDERS = {
  eyebrow: "Genuine Products · Nepal",
  headline1: "Build Your",
  headline2: "Dream PC",
  subtext: "Premium computer hardware and PC components — RAM, SSDs, keyboards, and more.",
  primaryCtaLabel: "Shop Now",
  primaryCtaHref: "/products",
  secondaryCtaLabel: "Browse Categories",
  secondaryCtaHref: "/categories",
};

export default function AdminHeroContentPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["heroContent"],
    queryFn: getHeroContent,
  });

  const [eyebrow, setEyebrow] = useState("");
  const [headline1, setHeadline1] = useState("");
  const [headline2, setHeadline2] = useState("");
  const [subtext, setSubtext] = useState("");
  const [primaryCtaLabel, setPrimaryCtaLabel] = useState("");
  const [primaryCtaHref, setPrimaryCtaHref] = useState("");
  const [secondaryCtaLabel, setSecondaryCtaLabel] = useState("");
  const [secondaryCtaHref, setSecondaryCtaHref] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && !hydrated && data) {
      setEyebrow(data.eyebrow);
      setHeadline1(data.headline1);
      setHeadline2(data.headline2);
      setSubtext(data.subtext);
      setPrimaryCtaLabel(data.primaryCtaLabel);
      setPrimaryCtaHref(data.primaryCtaHref);
      setSecondaryCtaLabel(data.secondaryCtaLabel);
      setSecondaryCtaHref(data.secondaryCtaHref);
      setHydrated(true);
    } else if (!isLoading && !hydrated && !data) {
      setHydrated(true);
    }
  }, [isLoading, hydrated, data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      upsertHeroContent({
        eyebrow: eyebrow.trim(),
        headline1: headline1.trim(),
        headline2: headline2.trim(),
        subtext: subtext.trim(),
        primary_cta_label: primaryCtaLabel.trim(),
        primary_cta_href: primaryCtaHref.trim(),
        secondary_cta_label: secondaryCtaLabel.trim(),
        secondary_cta_href: secondaryCtaHref.trim(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["heroContent"] });
      setSavedAt(Date.now());
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await saveMutation.mutateAsync();
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text">Hero Content</h1>
        <p className="text-sm text-text-muted mt-0.5">
          Edits the headline, sub-text, and call-to-action buttons on the homepage hero. Leave any field blank to fall back to the default copy.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="eyebrow"
          label="Eyebrow (small label above headline)"
          value={eyebrow}
          onChange={(e) => setEyebrow(e.target.value)}
          placeholder={PLACEHOLDERS.eyebrow}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="headline1"
            label="Headline line 1"
            value={headline1}
            onChange={(e) => setHeadline1(e.target.value)}
            placeholder={PLACEHOLDERS.headline1}
          />
          <Input
            id="headline2"
            label="Headline line 2 (accent-colored)"
            value={headline2}
            onChange={(e) => setHeadline2(e.target.value)}
            placeholder={PLACEHOLDERS.headline2}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="subtext" className="text-sm font-medium text-text">Subtext</label>
          <textarea
            id="subtext"
            rows={3}
            value={subtext}
            onChange={(e) => setSubtext(e.target.value)}
            placeholder={PLACEHOLDERS.subtext}
            className="w-full rounded-md border border-border bg-bg px-3.5 py-2.5 text-sm text-text placeholder:text-text-disabled resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 hover:border-border-strong transition-colors"
          />
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-sm font-medium text-text mb-3">Primary CTA</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="primary-label"
              label="Button label"
              value={primaryCtaLabel}
              onChange={(e) => setPrimaryCtaLabel(e.target.value)}
              placeholder={PLACEHOLDERS.primaryCtaLabel}
            />
            <Input
              id="primary-href"
              label="Link"
              value={primaryCtaHref}
              onChange={(e) => setPrimaryCtaHref(e.target.value)}
              placeholder={PLACEHOLDERS.primaryCtaHref}
            />
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-sm font-medium text-text mb-3">Secondary CTA</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="secondary-label"
              label="Button label"
              value={secondaryCtaLabel}
              onChange={(e) => setSecondaryCtaLabel(e.target.value)}
              placeholder={PLACEHOLDERS.secondaryCtaLabel}
            />
            <Input
              id="secondary-href"
              label="Link"
              value={secondaryCtaHref}
              onChange={(e) => setSecondaryCtaHref(e.target.value)}
              placeholder={PLACEHOLDERS.secondaryCtaHref}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          {savedAt && !saveMutation.isPending && (
            <span className="text-xs text-success">Saved</span>
          )}
          <Button type="submit" size="sm" isLoading={saveMutation.isPending}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
