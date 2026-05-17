import type {
  Product,
  ProductImage,
  ProductSpec,
  ProductSpecExtra,
  SpecDataType,
} from "./types";
import api from "./client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiProduct = Record<string, any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiAny = Record<string, any>;

function adaptImage(img: ApiAny): ProductImage {
  return {
    id: img.ID ?? img.id ?? 0,
    url: img.URL ?? img.url ?? "",
    altText: img.AltText ?? img.alt_text ?? "",
    isPrimary: img.IsPrimary ?? img.is_primary ?? false,
    sortOrder: img.SortOrder ?? img.sort_order ?? 0,
  };
}

// adaptSpec handles BOTH response shapes:
//   - Detail endpoint (ResolvedProductSpec): { key, label, unit, data_type, value, display_value }
//   - List endpoint (raw models.ProductSpec): { SpecDefinitionID, ValueInt|ValueDecimal|ValueString|ValueBool,
//                                               SpecDefinition: { Key, Label, Unit, DataType } }
function adaptSpec(s: ApiAny): ProductSpec {
  // Nested SpecDefinition implies the raw list shape; project from there.
  const def: ApiAny = s.SpecDefinition ?? s.spec_definition ?? null;
  if (def) {
    const dataType = (def.DataType ?? def.data_type ?? "string") as SpecDataType;
    const unit = def.Unit ?? def.unit ?? undefined;
    const { value, display } = pickTypedValue(s, dataType, unit);
    return {
      specDefinitionId: s.SpecDefinitionID ?? s.spec_definition_id ?? def.ID ?? def.id ?? 0,
      key: def.Key ?? def.key ?? "",
      label: def.Label ?? def.label ?? "",
      unit,
      dataType,
      value,
      displayValue: display,
    };
  }

  // Already-resolved shape (detail endpoint).
  return {
    specDefinitionId: s.spec_definition_id ?? s.SpecDefinitionID ?? 0,
    key: s.key ?? s.Key ?? "",
    label: s.label ?? s.Label ?? "",
    unit: s.unit ?? s.Unit ?? undefined,
    dataType: (s.data_type ?? s.DataType ?? "string") as SpecDataType,
    value: s.value ?? null,
    displayValue: s.display_value ?? s.DisplayValue ?? "",
  };
}

function pickTypedValue(
  s: ApiAny,
  dataType: SpecDataType,
  unit?: string,
): { value: ProductSpec["value"]; display: string } {
  const fmt = (v: string) => (unit ? `${v} ${unit}` : v);
  switch (dataType) {
    case "int": {
      const n = s.ValueInt ?? s.value_int;
      if (n == null) return { value: null, display: "" };
      return { value: Number(n), display: fmt(String(n)) };
    }
    case "decimal": {
      const n = s.ValueDecimal ?? s.value_decimal;
      if (n == null) return { value: null, display: "" };
      return { value: Number(n), display: fmt(String(n)) };
    }
    case "bool": {
      const b = s.ValueBool ?? s.value_bool;
      if (b == null) return { value: null, display: "" };
      return { value: Boolean(b), display: b ? "Yes" : "No" };
    }
    case "string":
    case "enum": {
      const v = s.ValueString ?? s.value_string;
      if (v == null) return { value: null, display: "" };
      return { value: String(v), display: fmt(String(v)) };
    }
    default:
      return { value: null, display: "" };
  }
}

function adaptSpecExtra(e: ApiAny): ProductSpecExtra {
  return {
    id: e.id ?? e.ID ?? 0,
    label: e.label ?? e.Label ?? "",
    value: e.value ?? e.Value ?? "",
  };
}

export type ProductInput = {
  Name: string;
  Price: number;
  Description?: string;
  Stock?: number;
  Brand?: string;
  BrandID?: number;
  CategoryID?: number;
  IsFeatured?: boolean;
  IsNewArrival?: boolean;
  IsActive?: boolean;
  SalePrice?: number;
};

export function adaptProduct(p: ApiProduct): Product {
  const id = p.ID ?? p.id;
  const name = p.Name ?? p.name ?? "";
  const slug = p.Slug ?? p.slug ?? name.toLowerCase().replace(/\s+/g, "-");
  const price = p.Price ?? p.price ?? 0;
  const stock = p.StockCount ?? p.stock_count ?? p.Stock ?? p.stock ?? 0;

  const imagesRaw: ApiAny[] = Array.isArray(p.Images) ? p.Images : Array.isArray(p.images) ? p.images : [];
  const images: ProductImage[] = imagesRaw.map(adaptImage);
  // Fallback to legacy single ImageURL when no array was provided.
  if (images.length === 0) {
    const imageUrl: string | undefined = p.ImageURL ?? p.image_url;
    if (imageUrl) {
      images.push({ id: 0, url: imageUrl, altText: name, isPrimary: true, sortOrder: 0 });
    }
  }

  const specsRaw: ApiAny[] = Array.isArray(p.specs) ? p.specs : Array.isArray(p.Specs) ? p.Specs : [];
  const specs: ProductSpec[] = specsRaw.map(adaptSpec);

  const extrasRaw: ApiAny[] = Array.isArray(p.spec_extras) ? p.spec_extras : Array.isArray(p.SpecExtras) ? p.SpecExtras : [];
  const specExtras: ProductSpecExtra[] = extrasRaw.map(adaptSpecExtra);

  return {
    id: String(id),
    name,
    slug,
    price,
    brand: p.Brand ?? p.brand,
    brandId: p.BrandID != null
      ? String(p.BrandID)
      : (p.brand_id != null
          ? String(p.brand_id)
          : (typeof p.BrandRef === "object" && p.BrandRef?.ID
              ? String(p.BrandRef.ID)
              : undefined)),
    description: p.Description ?? p.description ?? "",
    images,
    inStock: p.InStock ?? p.in_stock ?? stock > 0,
    stockCount: stock,
    lowStockThreshold: p.LowStockThreshold ?? p.low_stock_threshold ?? 5,
    categoryId: String(p.CategoryID ?? p.category_id ?? (typeof p.Category === "object" ? p.Category?.ID ?? p.Category?.id : "") ?? ""),
    category: typeof p.Category === "object" ? (p.Category?.Name ?? p.Category?.name ?? "") : (p.Category ?? p.category?.name ?? p.category ?? ""),
    categorySlug: typeof p.Category === "object" ? (p.Category?.Slug ?? p.Category?.slug ?? "") : (p.CategorySlug ?? p.category?.slug ?? ""),
    specs,
    specExtras,
    isFeatured: p.IsFeatured ?? p.is_featured ?? false,
    isNewArrival: p.IsNewArrival ?? p.is_new_arrival ?? false,
    isActive: p.IsActive ?? p.is_active ?? true,
    salePrice: p.SalePrice ?? p.sale_price ?? undefined,
  };
}

export type ProductsParams = {
  q?: string;
  // Category id or slug. Required when specFilters is non-empty — the backend
  // refuses to apply spec filters across categories (e.g. "RAM ≥ 16GB" only
  // makes sense within Laptops, not across keyboards and SSDs).
  category?: string;
  // Brand id or slug. Combines with category — both filters AND together.
  brand?: string;
  is_featured?: boolean;
  is_new_arrival?: boolean;
  on_sale?: boolean;
  max_price?: number;
  include_inactive?: boolean;
  sort?: string;
  // Per-category typed spec filters, keyed by SpecDefinition.key.
  // Suffix conventions (passed through to the backend):
  //   "<key>"      → exact match (string/enum); comma-separated for multi-select
  //   "<key>_min"  → range lower bound (int/decimal, inclusive)
  //   "<key>_max"  → range upper bound (int/decimal, inclusive)
  //   "<key>"      → "true" | "false" for bool
  specFilters?: Record<string, string>;
};

export async function getProducts(params?: ProductsParams): Promise<Product[]> {
  const query: Record<string, string> = {};
  if (params?.q) query.q = params.q;
  if (params?.category) query.category = params.category;
  if (params?.brand) query.brand = params.brand;
  if (params?.is_featured) query.featured = "true";
  if (params?.is_new_arrival) query.new_arrival = "true";
  if (params?.on_sale) query.on_sale = "true";
  if (params?.max_price !== undefined) query.max_price = String(params.max_price);
  if (params?.include_inactive) query.include_inactive = "true";
  if (params?.specFilters) {
    for (const [k, v] of Object.entries(params.specFilters)) {
      if (v !== "" && v !== undefined && v !== null) {
        query[k] = v;
      }
    }
  }

  const { data } = await api.get<ApiProduct[]>("/products", { params: query });
  let products = Array.isArray(data) ? data.map(adaptProduct) : [];

  if (params?.sort === "price_asc") products = products.sort((a, b) => a.price - b.price);
  if (params?.sort === "price_desc") products = products.sort((a, b) => b.price - a.price);

  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data } = await api.get<ApiProduct>(`/products/${slug}`);
    return adaptProduct(data);
  } catch {
    return null;
  }
}

// Legacy ID-based lookup kept for internal use (admin)
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data } = await api.get<ApiProduct>(`/products/${id}`);
    return adaptProduct(data);
  } catch {
    return null;
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return getProducts({ is_featured: true });
}

export async function getNewArrivals(): Promise<Product[]> {
  return getProducts({ is_new_arrival: true });
}

export async function getDeals(): Promise<Product[]> {
  return getProducts({ on_sale: true });
}

export async function getBudgetPicks(maxPrice: number): Promise<Product[]> {
  return getProducts({ max_price: maxPrice });
}

// --- Owner endpoints ---

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data } = await api.post<ApiProduct>("/products", input);
  return adaptProduct(data);
}

export async function createProductWithImage(form: FormData): Promise<Product> {
  const { data } = await api.post<ApiProduct>("/products/with-image", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return adaptProduct(data);
}

export async function updateProduct(id: number, input: ProductInput): Promise<Product> {
  const { data } = await api.put<ApiProduct>(`/products/${id}`, input);
  return adaptProduct(data);
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function updateStock(id: number, stock: number): Promise<Product> {
  const { data } = await api.patch<ApiProduct>(`/admin/products/${id}/stock`, { stock });
  return adaptProduct(data);
}

export async function toggleProductFlag(
  id: number,
  flag: "is_featured" | "is_new_arrival" | "is_active",
  value: boolean,
): Promise<Product> {
  const { data } = await api.patch<ApiProduct>(`/products/${id}`, { [flag]: value });
  return adaptProduct(data);
}

// Image management
export async function uploadProductImage(
  productId: number,
  form: FormData,
): Promise<ProductImage> {
  const { data } = await api.post<ApiProduct>(
    `/products/${productId}/images`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return {
    id: data.ID ?? data.id ?? 0,
    url: data.URL ?? data.url ?? "",
    altText: data.AltText ?? data.alt_text ?? "",
    isPrimary: data.IsPrimary ?? data.is_primary ?? false,
    sortOrder: data.SortOrder ?? data.sort_order ?? 0,
  };
}

export async function deleteProductImage(productId: number, imageId: number): Promise<void> {
  await api.delete(`/products/${productId}/images/${imageId}`);
}

export async function setPrimaryImage(productId: number, imageId: number): Promise<void> {
  await api.put(`/products/${productId}/images/${imageId}/primary`);
}

// Specs management — typed system. `spec_definition_id` references a
// SpecDefinition belonging to the product's category. `value` is sent as a
// string; backend coerces it against the definition's data_type. To clear a
// spec, omit it from the list (PUT replaces the whole set).
export type SpecInput = {
  spec_definition_id: number;
  value: string;
};

export async function updateProductSpecs(
  productId: number,
  specs: SpecInput[],
): Promise<ProductSpec[]> {
  const { data } = await api.put<ApiAny[]>(`/products/${productId}/specs`, specs);
  return Array.isArray(data) ? data.map(adaptSpec) : [];
}

// Spec extras — freeform key/value rows for non-filterable display copy
// (e.g. "What's in the box"). Replace-all semantics; sending [] clears.
export type SpecExtraInput = {
  label: string;
  value: string;
  sort_order: number;
};

export async function updateProductSpecExtras(
  productId: number,
  extras: SpecExtraInput[],
): Promise<ProductSpecExtra[]> {
  const { data } = await api.put<ApiAny[]>(`/products/${productId}/spec-extras`, extras);
  return Array.isArray(data) ? data.map(adaptSpecExtra) : [];
}
