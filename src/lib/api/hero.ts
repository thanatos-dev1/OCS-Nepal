import api from "./client";

export type HeroSlide = {
  id: number;
  imageUrl: string;
  linkUrl: string;
  caption: string;
  sortOrder: number;
  isActive: boolean;
};

type ApiHeroSlide = {
  ID?: number;
  id?: number;
  ImageURL?: string;
  image_url?: string;
  LinkURL?: string;
  link_url?: string;
  Caption?: string;
  caption?: string;
  SortOrder?: number;
  sort_order?: number;
  IsActive?: boolean;
  is_active?: boolean;
};

function adapt(s: ApiHeroSlide): HeroSlide {
  return {
    id: s.ID ?? s.id ?? 0,
    imageUrl: s.ImageURL ?? s.image_url ?? "",
    linkUrl: s.LinkURL ?? s.link_url ?? "",
    caption: s.Caption ?? s.caption ?? "",
    sortOrder: s.SortOrder ?? s.sort_order ?? 0,
    isActive: s.IsActive ?? s.is_active ?? true,
  };
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const { data } = await api.get<ApiHeroSlide[]>("/hero-slides");
  return Array.isArray(data) ? data.map(adapt) : [];
}

export async function getAllHeroSlides(): Promise<HeroSlide[]> {
  const { data } = await api.get<ApiHeroSlide[]>("/hero-slides/all");
  return Array.isArray(data) ? data.map(adapt) : [];
}

export async function createHeroSlideWithImage(form: FormData): Promise<HeroSlide> {
  const { data } = await api.post<ApiHeroSlide>("/hero-slides/with-image", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return adapt(data);
}

export type HeroSlideUpdate = {
  link_url?: string;
  caption?: string;
  sort_order?: number;
  is_active?: boolean;
  image_url?: string;
};

export async function updateHeroSlide(id: number, input: HeroSlideUpdate): Promise<HeroSlide> {
  const { data } = await api.put<ApiHeroSlide>(`/hero-slides/${id}`, input);
  return adapt(data);
}

export async function deleteHeroSlide(id: number): Promise<void> {
  await api.delete(`/hero-slides/${id}`);
}
