export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getProducts } from "@/lib/api/products";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
  const products = await getProducts().catch(() => []);

  return (
    <Suspense>
      <ProductsClient initialProducts={products} />
    </Suspense>
  );
}
