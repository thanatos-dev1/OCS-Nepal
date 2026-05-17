import { use } from "react";
import CategoryView from "./CategoryView";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <CategoryView slug={slug} />;
}
