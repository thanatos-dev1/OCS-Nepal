import type { Review, ReviewInput } from "./types";
import api from "./client";

type ApiReview = {
  id: number;
  rating: number;
  title: string;
  body: string;
  user: { name: string };
  is_verified: boolean;
  created_at: string;
};

function adaptReview(r: ApiReview): Review {
  return {
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    user: { name: r.user.name },
    isVerified: r.is_verified,
    createdAt: r.created_at,
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
