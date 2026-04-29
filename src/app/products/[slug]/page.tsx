"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, ChevronRight, Star, CheckCircle, Heart } from "lucide-react";
import ProductImage from "@/components/shop/ProductImage";
import AddToCartButton from "@/components/shop/AddToCartButton";
import TrackView from "@/components/shop/TrackView";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useProductBySlugQuery } from "@/hooks/useProducts";
import { useReviewsQuery, useCreateReviewMutation, useMyReview } from "@/hooks/useReviews";
import {
  useWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from "@/hooks/useWishlist";
import { useAuthStore } from "@/stores/authStore";
import { cn, formatNPR } from "@/lib/utils";
import { useRouter } from "next/navigation";

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= rating ? "text-warning fill-warning" : "text-border-strong fill-border-strong"}
        />
      ))}
    </div>
  );
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5"
        >
          <Star
            size={22}
            className={
              n <= (hovered || value)
                ? "text-warning fill-warning"
                : "text-border-strong fill-border-strong"
            }
          />
        </button>
      ))}
    </div>
  );
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const { data: product, isLoading } = useProductBySlugQuery(slug);
  const { data: reviews = [] } = useReviewsQuery(product?.id ?? "");
  const createReview = useCreateReviewMutation(product?.id ?? "");
  const myReview = useMyReview(product?.id ?? "");

  const { data: wishlist = [] } = useWishlistQuery();
  const addToWishlist = useAddToWishlistMutation();
  const removeFromWishlist = useRemoveFromWishlistMutation();
  const inWishlist = !!product && wishlist.some((w) => w.productId === parseInt(product.id, 10));

  const [activeImage, setActiveImage] = useState(0);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewError, setReviewError] = useState("");

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-lg font-semibold text-text">Product not found</p>
        <Link href="/products" className="mt-4 inline-block text-sm text-primary hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  const avgRating =
    reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const primaryImage = product.images[activeImage]?.url ?? product.images[0]?.url;

  function handleWishlistToggle() {
    if (!token) { router.push("/account/login"); return; }
    const pid = parseInt(product!.id, 10);
    if (inWishlist) removeFromWishlist.mutate(pid);
    else addToWishlist.mutate(pid);
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (reviewRating === 0) { setReviewError("Please select a rating"); return; }
    if (!reviewTitle.trim()) { setReviewError("Title is required"); return; }
    if (!reviewBody.trim()) { setReviewError("Review body is required"); return; }
    setReviewError("");
    try {
      await createReview.mutateAsync({
        rating: reviewRating,
        title: reviewTitle.trim(),
        body: reviewBody.trim(),
      });
      setReviewRating(0);
      setReviewTitle("");
      setReviewBody("");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setReviewError(msg ?? "Failed to submit review");
    }
  }

  const isShopUser = !user || user.role === "customer";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TrackView product={product} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-text-muted mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} />
        <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
        <ChevronRight size={14} />
        <Link href={`/categories/${product.categorySlug}`} className="hover:text-primary transition-colors">
          {product.category}
        </Link>
        <ChevronRight size={14} />
        <span className="text-text font-medium truncate max-w-50">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Image Gallery */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden border border-border relative">
            <ProductImage src={primaryImage} alt={product.name} category={product.category} priority />
            {product.salePrice && (
              <span className="absolute top-4 left-4 px-2.5 py-1 text-xs font-bold bg-error text-white rounded-md">
                SALE
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "aspect-square rounded-lg overflow-hidden border-2 transition-colors",
                    i === activeImage ? "border-primary" : "border-border hover:border-border-strong",
                  )}
                >
                  <ProductImage src={img.url} alt={img.altText || product.name} category={product.category} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <span className="inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary bg-primary/10 rounded-md mb-3">
            {product.category}
          </span>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {product.isFeatured && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-primary/10 text-primary rounded">Featured</span>
            )}
            {product.isNewArrival && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-success/10 text-success rounded">New Arrival</span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-text leading-snug">{product.name}</h1>

          {/* Rating summary */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <StarRating rating={Math.round(avgRating)} size={16} />
              <span className="text-sm text-text-muted">
                {avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mt-5">
            {product.salePrice ? (
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-error">{formatNPR(product.salePrice)}</span>
                <span className="text-xl text-text-muted line-through">{formatNPR(product.price)}</span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-text">{formatNPR(product.price)}</span>
            )}
          </div>

          {/* Stock */}
          <div className="mt-3">
            {product.inStock ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                <span className="w-2 h-2 rounded-full bg-success inline-block" />
                In Stock
                {product.stockCount <= (product.lowStockThreshold || 5) && (
                  <span className="text-text-disabled font-normal">· Only {product.stockCount} left</span>
                )}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-text-disabled">
                <span className="w-2 h-2 rounded-full bg-border-strong inline-block" />
                Out of Stock
              </span>
            )}
          </div>

          <p className="mt-6 text-text-muted leading-relaxed text-sm">{product.description}</p>

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            {isShopUser && <AddToCartButton product={product} />}
            {isShopUser && (
              <button
                type="button"
                onClick={handleWishlistToggle}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                  inWishlist
                    ? "border-error/30 bg-error-light text-error hover:bg-error/10"
                    : "border-border text-text-muted hover:text-text hover:border-border-strong",
                )}
              >
                <Heart size={16} fill={inWishlist ? "currentColor" : "none"} />
                {inWishlist ? "Saved" : "Save"}
              </button>
            )}
          </div>

          {/* Trust badges */}
          <div className="mt-6 grid grid-cols-3 gap-3 pt-6 border-t border-border">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <ShieldCheck size={20} className="text-primary" />
              <span className="text-xs text-text-muted">Genuine Product</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <Truck size={20} className="text-primary" />
              <span className="text-xs text-text-muted">Nepal Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <RotateCcw size={20} className="text-primary" />
              <span className="text-xs text-text-muted">Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specs */}
      {product.specs.length > 0 && (
        <div className="mt-14">
          <h2 className="text-lg font-bold text-text mb-4">Specifications</h2>
          <div className="border border-border rounded-xl overflow-hidden">
            {product.specs.map((spec, i) => (
              <div
                key={`${spec.key}-${i}`}
                className={`flex items-center px-5 py-3.5 text-sm ${i % 2 === 0 ? "bg-bg-card" : "bg-bg-subtle"}`}
              >
                <span className="w-40 font-medium text-text-muted shrink-0">{spec.key}</span>
                <span className="text-text">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="mt-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-text">
            Customer Reviews
            {reviews.length > 0 && (
              <span className="ml-2 text-sm font-normal text-text-muted">({reviews.length})</span>
            )}
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(avgRating)} />
              <span className="text-sm font-medium text-text">{avgRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {reviews.length === 0 && (
          <p className="text-sm text-text-muted mb-8">No reviews yet. Be the first!</p>
        )}

        <div className="space-y-5 mb-10">
          {reviews.map((review) => (
            <div key={review.id} className="bg-bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating rating={review.rating} />
                    {review.isVerified && (
                      <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                        <CheckCircle size={12} /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-text text-sm">{review.title}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-text">{review.user.name}</p>
                  <p className="text-xs text-text-muted">
                    {new Date(review.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-text-muted leading-relaxed">{review.body}</p>
            </div>
          ))}
        </div>

        {/* Write a review */}
        {isShopUser && (
          <div className="bg-bg-card border border-border rounded-xl p-6">
            {!token ? (
              <div className="text-center py-4">
                <p className="text-sm text-text-muted mb-3">Sign in to write a review</p>
                <Link href="/account/login">
                  <Button variant="primary" size="sm">Sign In</Button>
                </Link>
              </div>
            ) : myReview ? (
              <p className="text-sm text-text-muted text-center py-2">
                You&apos;ve already reviewed this product.
              </p>
            ) : (
              <>
                <h3 className="text-base font-semibold text-text mb-5">Write a Review</h3>
                <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
                  <div>
                    <p className="text-sm font-medium text-text mb-2">Rating</p>
                    <StarPicker value={reviewRating} onChange={setReviewRating} />
                  </div>
                  <Input
                    id="review-title"
                    label="Title"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Summarise your review"
                  />
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="review-body" className="text-sm font-medium text-text">Review</label>
                    <textarea
                      id="review-body"
                      rows={4}
                      value={reviewBody}
                      onChange={(e) => setReviewBody(e.target.value)}
                      placeholder="Share your experience with this product…"
                      className="w-full rounded-md border border-border bg-bg px-3.5 py-2.5 text-sm text-text placeholder:text-text-disabled resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 hover:border-border-strong transition-colors"
                    />
                  </div>
                  {reviewError && (
                    <p className="text-xs text-error">{reviewError}</p>
                  )}
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="self-start"
                    isLoading={createReview.isPending}
                  >
                    Submit Review
                  </Button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
