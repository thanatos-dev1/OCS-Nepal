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
  type ProductsParams,
  type SpecInput,
  type SpecExtraInput,
} from "@/lib/api/products";
import { uploadImage } from "@/lib/api/upload";
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
        const imageFile = form.get("image");
        let imageUrl = (form.get("image_url") as string) || undefined;
        if (imageFile instanceof File && imageFile.size > 0) {
          imageUrl = await uploadImage(imageFile);
        }
        await updateProduct(savedId, {
          Name: form.get("name") as string,
          Price: parseFloat(form.get("price") as string),
          Stock: form.get("stock") ? parseInt(form.get("stock") as string, 10) : undefined,
          Description: (form.get("description") as string) || undefined,
          BrandID: form.get("brand_id") ? parseInt(form.get("brand_id") as string, 10) : undefined,
          Brand: (form.get("brand") as string) || undefined,
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
