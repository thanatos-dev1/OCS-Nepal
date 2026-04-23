import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from "@/lib/api/cart";
import { queryKeys } from "@/lib/queries";
import { useAuthStore } from "@/stores/authStore";
import type { CartItem } from "@/lib/api/cart";

export function useCartQuery() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: queryKeys.cart,
    queryFn: getCart,
    enabled: !!token,
  });
}

export function useAddToCartMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      addToCart(productId, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cart }),
  });
}

export function useUpdateCartItemMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      updateCartItem(productId, quantity),
    onMutate: async ({ productId, quantity }) => {
      await qc.cancelQueries({ queryKey: queryKeys.cart });
      const previous = qc.getQueryData<CartItem[]>(queryKeys.cart);
      qc.setQueryData<CartItem[]>(queryKeys.cart, (old) =>
        old?.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(queryKeys.cart, ctx?.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.cart }),
  });
}

export function useRemoveCartItemMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: number) => removeCartItem(productId),
    onMutate: async (productId) => {
      await qc.cancelQueries({ queryKey: queryKeys.cart });
      const previous = qc.getQueryData<CartItem[]>(queryKeys.cart);
      qc.setQueryData<CartItem[]>(queryKeys.cart, (old) =>
        old?.filter((item) => item.productId !== productId)
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(queryKeys.cart, ctx?.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.cart }),
  });
}

export function useClearCartMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clearCart,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.cart });
      const previous = qc.getQueryData<CartItem[]>(queryKeys.cart);
      qc.setQueryData<CartItem[]>(queryKeys.cart, []);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(queryKeys.cart, ctx?.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.cart }),
  });
}
