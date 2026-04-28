import { redirect } from "next/navigation";
import { getProductById } from "@/lib/api/products";

export default async function ProductByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (product?.slug) redirect(`/products/${product.slug}`);
  redirect("/products");
}
