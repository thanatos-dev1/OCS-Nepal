import api from "./client";

export type HeroContent = {
  eyebrow: string;
  headline1: string;
  headline2: string;
  subtext: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
};

type ApiHeroContent = {
  ID?: number;
  id?: number;
  Eyebrow?: string;
  eyebrow?: string;
  Headline1?: string;
  headline1?: string;
  Headline2?: string;
  headline2?: string;
  Subtext?: string;
  subtext?: string;
  PrimaryCTALabel?: string;
  primary_cta_label?: string;
  PrimaryCTAHref?: string;
  primary_cta_href?: string;
  SecondaryCTALabel?: string;
  secondary_cta_label?: string;
  SecondaryCTAHref?: string;
  secondary_cta_href?: string;
};

function adapt(c: ApiHeroContent | null | undefined): HeroContent | null {
  if (!c) return null;
  return {
    eyebrow: c.Eyebrow ?? c.eyebrow ?? "",
    headline1: c.Headline1 ?? c.headline1 ?? "",
    headline2: c.Headline2 ?? c.headline2 ?? "",
    subtext: c.Subtext ?? c.subtext ?? "",
    primaryCtaLabel: c.PrimaryCTALabel ?? c.primary_cta_label ?? "",
    primaryCtaHref: c.PrimaryCTAHref ?? c.primary_cta_href ?? "",
    secondaryCtaLabel: c.SecondaryCTALabel ?? c.secondary_cta_label ?? "",
    secondaryCtaHref: c.SecondaryCTAHref ?? c.secondary_cta_href ?? "",
  };
}

export async function getHeroContent(): Promise<HeroContent | null> {
  const { data } = await api.get<ApiHeroContent | null>("/hero-content");
  return adapt(data);
}

export type HeroContentInput = {
  eyebrow: string;
  headline1: string;
  headline2: string;
  subtext: string;
  primary_cta_label: string;
  primary_cta_href: string;
  secondary_cta_label: string;
  secondary_cta_href: string;
};

export async function upsertHeroContent(input: HeroContentInput): Promise<HeroContent> {
  const { data } = await api.put<ApiHeroContent>("/hero-content", input);
  const adapted = adapt(data);
  if (!adapted) throw new Error("Server returned empty hero content after save");
  return adapted;
}
