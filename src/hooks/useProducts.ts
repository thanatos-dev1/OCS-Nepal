import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  getProductBySlug,
  createProduct,
  createProductWithImage,
  updateProduct,
  deleteProduct,
  updateProductSpecs,
  updateProductSpecExtras,
  uploadProductImage,
  deleteProductImage,
  setPrimaryImage,
  type ProductsParams,
  type SpecInput,
  type SpecExtraInput,
} from "@/lib/api/products";
import { queryKeys } from "@/lib/queries";
import type { Product } from "@/lib/api/types";

export function useProductsQuery(initialData?: Product[], params?: ProductsParams) {
  return useQuery({
    queryKey: params ? queryKeys.productsFiltered(params as Record<string, unknown>) : queryKeys.products,
    queryFn: () => getProducts(params),
    ...(initialData !== undefined ? { initialData } : {}),
  });
}

export function useProductBySlugQuery(slug: string) {
  return useQuery({
    queryKey: queryKeys.productSlug(slug),
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
  });
}

export type SaveProductPayload = {
  form: FormData;
  // When present, replaces the product's specs after save. Empty array clears
  // all specs. Undefined leaves them untouched (e.g. when category has no
  // definitions, or the modal explicitly chose not to manage specs).
  specs?: SpecInput[];
  // When present, replaces the product's freeform spec extras after save.
  // Empty array clears them. Undefined leaves them untouched.
  extras?: SpecExtraInput[];
};

export function useSaveProductMutation(editingProduct: Product | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ form, specs, extras }: SaveProductPayload) => {
      let savedId: number;

      if (editingProduct) {
        savedId = parseInt(editingProduct.id, 10);
        // Image management for existing products goes through ProductImageGallery —
        // no image fields are sent on this update.
        await updateProduct(savedId, {
          Name: form.get("name") as string,
          Price: parseFloat(form.get("price") as string),
          Stock: form.get("stock") ? parseInt(form.get("stock") as string, 10) : undefined,
          Description: (form.get("description") as string) || undefined,
          BrandID: form.get("brand_id") ? parseInt(form.get("brand_id") as string, 10) : undefined,
          Brand: (form.get("brand") as string) || undefined,
          SeriesID: form.get("series_id") ? parseInt(form.get("series_id") as string, 10) : undefined,
          CategoryID: form.get("category_id") ? parseInt(form.get("category_id") as string, 10) : undefined,
          IsFeatured: form.get("is_featured") === "true",
          IsNewArrival: form.get("is_new_arrival") === "true",
          SalePrice: form.get("sale_price") ? parseFloat(form.get("sale_price") as string) : undefined,
        });
      } else {
        const imageFile = form.get("image");
        const created = imageFile instanceof File && imageFile.size > 0
          ? await createProductWithImage(form)
          : await createProduct({
              Name: form.get("name") as string,
              Price: parseFloat(form.get("price") as string),
              Stock: form.get("stock") ? parseInt(form.get("stock") as string, 10) : undefined,
              Description: (form.get("description") as string) || undefined,
              BrandID: form.get("brand_id") ? parseInt(form.get("brand_id") as string, 10) : undefined,
              Brand: (form.get("brand") as string) || undefined,
              SeriesID: form.get("series_id") ? parseInt(form.get("series_id") as string, 10) : undefined,
              CategoryID: form.get("category_id") ? parseInt(form.get("category_id") as string, 10) : undefined,
            });
        savedId = parseInt(created.id, 10);
      }

      if (specs !== undefined) {
        await updateProductSpecs(savedId, specs);
      }
      if (extras !== undefined) {
        await updateProductSpecExtras(savedId, extras);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products }),
  });
}

export function useUpdateProductSpecsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, specs }: { productId: number; specs: SpecInput[] }) =>
      updateProductSpecs(productId, specs),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products }),
  });
}

export function useDeleteProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products }),
  });
}

// --- Product image mutations ---

// Upload one or many image files for a product. Runs in parallel and
// reports per-file results so the UI can show a "N of M succeeded" summary.
export function useUploadProductImagesMutation(productId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (files: File[]) => {
      const results = await Promise.allSettled(
        files.map((file) => {
          const form = new FormData();
          form.append("image", file);
          return uploadProductImage(productId, form);
        }),
      );
      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      return { succeeded, failed: results.length - succeeded };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products }),
  });
}

export function useDeleteProductImageMutation(productId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageId: number) => deleteProductImage(productId, imageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products }),
  });
}

export function useSetPrimaryImageMutation(productId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageId: number) => setPrimaryImage(productId, imageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products }),
  });
}
