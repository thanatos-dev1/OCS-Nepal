import type { Review, ReviewInput } from "./types";
import api from "./client";

type ApiReview = {
  ID?: number;
  id?: number;
  Rating?: number;
  rating?: number;
  Title?: string;
  title?: string;
  Body?: string;
  body?: string;
  User?: { ID?: number; Name?: string; AvatarURL?: string };
  user?: { name?: string };
  IsVerified?: boolean;
  is_verified?: boolean;
  CreatedAt?: string;
  created_at?: string;
};

function adaptReview(r: ApiReview): Review {
  const u = r.User ?? r.user ?? {};
  return {
    id: r.ID ?? r.id ?? 0,
    rating: r.Rating ?? r.rating ?? 0,
    title: r.Title ?? r.title ?? "",
    body: r.Body ?? r.body ?? "",
    user: {
      id: (u as { ID?: number }).ID,
      name: (u as { Name?: string; name?: string }).Name ?? (u as { name?: string }).name ?? "",
      avatarUrl: (u as { AvatarURL?: string }).AvatarURL,
    },
    isVerified: r.IsVerified ?? r.is_verified ?? false,
    createdAt: r.CreatedAt ?? r.created_at ?? "",
  };
}

export async function getReviews(productId: string): Promise<Review[]> {
  const { data } = await api.get<ApiReview[]>(`/products/${productId}/reviews`);
  return Array.isArray(data) ? data.map(adaptReview) : [];
}

export async function createReview(productId: string, input: ReviewInput): Promise<Review> {
  const { data } = await api.post<ApiReview>(`/products/${productId}/reviews`, input);
  return adaptReview(data);
}

export async function deleteReview(reviewId: number): Promise<void> {
  await api.delete(`/reviews/${reviewId}`);
}
