# Backend Spec — Pending Endpoints

Endpoints the frontend currently mocks. Each section is one pending endpoint with the request/response shape the frontend expects. Once the Go API implements one, swap the corresponding mock call in `src/lib/api/` for a real `api.get(...)` and delete the mock file.

---

## `GET /categories/:slug/brand-series`

Returns the brands available within a category, each with their product series. Drives the mega-menu in `CategoryBar` (e.g. hovering "Laptops" shows Asus → ROG, TUF, Zenbook…).

**Frontend consumer:** `src/lib/api/categoryBrandSeries.ts` → `getCategoryBrandSeries(slug)`
**Mock data:** `src/lib/api/mock/categoryBrandSeries.ts`
**Triggered on:** hover of a category in `CategoryBar` whose slug is in `MEGA_MENU_SLUGS` (currently `["laptops"]`).

### Request
- Path param: `slug` — category slug (e.g. `laptops`)
- No query params, no auth required (public)

### Response (200)
```json
[
  {
    "BrandID": 1,
    "BrandName": "Asus",
    "BrandSlug": "asus",
    "Series": [
      { "ID": 11, "Name": "ROG", "Slug": "rog" },
      { "ID": 12, "Name": "TUF Gaming", "Slug": "tuf" }
    ]
  },
  {
    "BrandID": 2,
    "BrandName": "Lenovo",
    "BrandSlug": "lenovo",
    "Series": [
      { "ID": 21, "Name": "Legion", "Slug": "legion" }
    ]
  }
]
```

**Field notes**
- Use the same `ID`/`Name`/`Slug` PascalCase convention as `/categories`.
- Sort brands by display order (`SortOrder` on the brand or a join-table column), not alphabetical.
- Series sorted by display order within each brand.
- If a category has no brand-series mapping, return `[]` (not 404). Frontend renders an empty-state.

### Data model implications
The current schema has `Category` and `Brand` as unrelated tables. To serve this endpoint you need:

1. **Brand-Category link** — either a `brand_categories` join table (`brand_id`, `category_id`, `sort_order`) or a `category_id` column on `series`.
2. **Series entity** — new table `series` (`id`, `brand_id`, `name`, `slug`, `sort_order`). A series belongs to one brand, and via that brand is available in one or more categories.
3. **Routing impact** — frontend links land on `/categories/:slug?brand=...&series=...`. The category listing page should accept these query params and filter products accordingly. (Filter logic is out of scope for this endpoint; just be aware the URLs exist.)

### Adapter pattern (frontend side, for reference)
When the endpoint lands, the frontend adapter looks like the existing `adaptCategory` in `src/lib/api/categories.ts`:

```ts
type ApiBrandGroup = {
  BrandID: number;
  BrandName: string;
  BrandSlug: string;
  Series: { ID: number; Name: string; Slug: string }[];
};

function adaptBrandGroup(g: ApiBrandGroup): CategoryBrandGroup {
  return {
    brandId: String(g.BrandID),
    brandName: g.BrandName,
    brandSlug: g.BrandSlug,
    series: g.Series.map((s) => ({ id: String(s.ID), name: s.Name, slug: s.Slug })),
  };
}
```

### Caching
- Frontend uses React Query with `staleTime: 10min`. Endpoint can safely cache at the edge for a few minutes — brand-series mappings change rarely.

---

## (Add future pending endpoints below)
