import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from "@/lib/api/cart";
import { queryKeys } from "@/lib/queries";
import { useAuthStore } from "@/stores/authStore";
import { useGuestCartStore, type GuestProductSnapshot } from "@/stores/guestCartStore";
import type { CartItem } from "@/lib/api/cart";

// Cart hooks transparently switch between two backends:
//   - Server cart (`/cart`) when the user has an auth token.
//   - Local guest cart (Zustand + localStorage) when no token.
//
// Callers don't know which one they're hitting — same hook names, same
// CartItem shape, same mutation signatures (with one addition: add takes an
// optional product snapshot so the guest store can render rows without
// re-fetching product details).

export function useCartQuery() {
  const token = useAuthStore((s) => s.token);
  const guestItems = useGuestCartStore((s) => s.items);

  const serverQuery = useQuery({
    queryKey: queryKeys.cart,
    queryFn: getCart,
    enabled: !!token,
  });

  if (token) return serverQuery;

  return {
    ...serverQuery,
    data: guestItems,
    isLoading: false,
    isFetching: false,
    isSuccess: true,
    isError: false,
  } as typeof serverQuery;
}

type AddArgs = {
  productId: number;
  quantity: number;
  // Required for guest path; ignored when the user is logged in.
  product?: GuestProductSnapshot;
};

export function useAddToCartMutation() {
  const qc = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const guestAdd = useGuestCartStore((s) => s.add);

  return useMutation({
    mutationFn: async ({ productId, quantity, product }: AddArgs) => {
      if (!token) {
        if (!product) {
          throw new Error("guest add-to-cart needs a product snapshot");
        }
        guestAdd(product, quantity);
        return;
      }
      await addToCart(productId, quantity);
    },
    onSuccess: () => {
      if (token) qc.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}

export function useUpdateCartItemMutation() {
  const qc = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const guestUpdate = useGuestCartStore((s) => s.update);

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      if (!token) {
        guestUpdate(productId, quantity);
        return;
      }
      await updateCartItem(productId, quantity);
    },
    onMutate: async ({ productId, quantity }) => {
      if (!token) return { previous: undefined };
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
      if (token) qc.setQueryData(queryKeys.cart, ctx?.previous);
    },
    onSettled: () => {
      if (token) qc.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}

export function useRemoveCartItemMutation() {
  const qc = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const guestRemove = useGuestCartStore((s) => s.remove);

  return useMutation({
    mutationFn: async (productId: number) => {
      if (!token) {
        guestRemove(productId);
        return;
      }
      await removeCartItem(productId);
    },
    onMutate: async (productId) => {
      if (!token) return { previous: undefined };
      await qc.cancelQueries({ queryKey: queryKeys.cart });
      const previous = qc.getQueryData<CartItem[]>(queryKeys.cart);
      qc.setQueryData<CartItem[]>(queryKeys.cart, (old) =>
        old?.filter((item) => item.productId !== productId)
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (token) qc.setQueryData(queryKeys.cart, ctx?.previous);
    },
    onSettled: () => {
      if (token) qc.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}

export function useClearCartMutation() {
  const qc = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const guestClear = useGuestCartStore((s) => s.clear);

  return useMutation({
    mutationFn: async () => {
      if (!token) {
        guestClear();
        return;
      }
      await clearCart();
    },
    onMutate: async () => {
      if (!token) return { previous: undefined };
      await qc.cancelQueries({ queryKey: queryKeys.cart });
      const previous = qc.getQueryData<CartItem[]>(queryKeys.cart);
      qc.setQueryData<CartItem[]>(queryKeys.cart, []);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (token) qc.setQueryData(queryKeys.cart, ctx?.previous);
    },
    onSettled: () => {
      if (token) qc.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}
