import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Truck, RotateCcw, ChevronRight } from "lucide-react";
import ProductImage from "@/components/shop/ProductImage";
import AddToCartButton from "@/components/shop/AddToCartButton";
import TrackView from "@/components/shop/TrackView";
import { getProductById } from "@/lib/api/products";

function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString("en-NP")}`;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TrackView product={product} />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-text-muted mb-8">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight size={14} />
        <Link href="/products" className="hover:text-primary transition-colors">
          Products
        </Link>
        <ChevronRight size={14} />
        <Link
          href={`/categories/${product.categorySlug}`}
          className="hover:text-primary transition-colors"
        >
          {product.category}
        </Link>
        <ChevronRight size={14} />
        <span className="text-text font-medium truncate max-w-50">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden border border-border">
            <ProductImage
              src={product.images?.[0]}
              alt={product.name}
              category={product.category}
              priority
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(0, 4).map((img, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-colors cursor-pointer"
                >
                  <ProductImage
                    src={img}
                    alt={`${product.name} view ${i + 1}`}
                    category={product.category}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <span className="inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary bg-primary/10 rounded-md mb-3">
            {product.category}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-text leading-snug">
            {product.name}
          </h1>

          <div className="mt-5">
            <span className="text-3xl font-bold text-text">
              {formatNPR(product.price)}
            </span>
          </div>

          <div className="mt-3">
            {product.inStock ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                <span className="w-2 h-2 rounded-full bg-success inline-block" />
                In Stock
                {product.stockCount <= 10 && (
                  <span className="text-text-disabled font-normal">
                    · Only {product.stockCount} left
                  </span>
                )}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-text-disabled">
                <span className="w-2 h-2 rounded-full bg-border-strong inline-block" />
                Out of Stock
              </span>
            )}
          </div>

          <p className="mt-6 text-text-muted leading-relaxed text-sm">
            {product.description}
          </p>

          <div className="mt-8 flex gap-3">
            <AddToCartButton product={product} />
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
      <div className="mt-14">
        <h2 className="text-lg font-bold text-text mb-4">Specifications</h2>
        <div className="border border-border rounded-xl overflow-hidden">
          {product.specs.map((spec, i) => (
            <div
              key={spec.label}
              className={`flex items-center px-5 py-3.5 text-sm ${i % 2 === 0 ? "bg-bg-card" : "bg-bg-subtle"}`}
            >
              <span className="w-40 font-medium text-text-muted shrink-0">
                {spec.label}
              </span>
              <span className="text-text">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
