import { getCategories } from "@/lib/api/categories";
import CategoryRow from "./CategoryRow";

// Renders one CategoryRow per category flagged ShowOnHomepage. The flag is
// owner-controlled via the category admin modal.
export default async function FeaturedCategoryRows() {
  const categories = await getCategories().catch(() => []);
  const featured = categories
    .filter((c) => c.showOnHomepage && !c.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (featured.length === 0) return null;

  return (
    <>
      {featured.map((cat) => (
        <CategoryRow
          key={cat.id}
          slug={cat.slug}
          title={cat.name}
          subtitle={cat.description || undefined}
        />
      ))}
    </>
  );
}
