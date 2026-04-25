import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  createProduct,
  createProductWithImage,
  updateProduct,
  deleteProduct,
} from "@/lib/api/products";
import { uploadImage } from "@/lib/api/upload";
import { queryKeys } from "@/lib/queries";
import type { Product } from "@/lib/api/types";

export function useProductsQuery(initialData?: Product[]) {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: () => getProducts(),
    ...(initialData !== undefined ? { initialData } : {}),
  });
}

export function useSaveProductMutation(editingProduct: Product | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (form: FormData) => {
      if (editingProduct) {
        const id = parseInt(editingProduct.id, 10);
        const imageFile = form.get("image");
        let imageUrl = (form.get("image_url") as string) || undefined;
        if (imageFile instanceof File && imageFile.size > 0) {
          imageUrl = await uploadImage(imageFile);
        }
        await updateProduct(id, {
          name: form.get("name") as string,
          price: parseFloat(form.get("price") as string),
          stock: form.get("stock") ? parseInt(form.get("stock") as string, 10) : undefined,
          description: (form.get("description") as string) || undefined,
          brand: (form.get("brand") as string) || undefined,
          category_id: form.get("category_id") ? parseInt(form.get("category_id") as string, 10) : undefined,
          image_url: imageUrl,
        });
      } else {
        const imageFile = form.get("image");
        if (imageFile instanceof File && imageFile.size > 0) {
          await createProductWithImage(form);
        } else {
          await createProduct({
            name: form.get("name") as string,
            price: parseFloat(form.get("price") as string),
            stock: form.get("stock") ? parseInt(form.get("stock") as string, 10) : undefined,
            description: (form.get("description") as string) || undefined,
            brand: (form.get("brand") as string) || undefined,
            category_id: form.get("category_id") ? parseInt(form.get("category_id") as string, 10) : undefined,
          });
        }
      }
    },
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
