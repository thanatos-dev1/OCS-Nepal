import { addToCart } from "@/lib/api/cart";
import { useGuestCartStore } from "@/stores/guestCartStore";

// mergeGuestCartIntoServer replays each guest cart row to the server cart,
// then clears the guest store. Call this **after** the auth token is set so
// the API client picks it up.
//
// Server-side AddItem increments quantity on conflict, so a guest who already
// had this product in their old server cart just sees the totals add up.
//
// Errors on individual items are logged but don't abort the rest — a guest
// cart with a stale (deleted) product shouldn't block the whole merge.
export async function mergeGuestCartIntoServer(): Promise<void> {
  const { items, clear } = useGuestCartStore.getState();
  if (items.length === 0) return;

  for (const item of items) {
    try {
      await addToCart(item.productId, item.quantity);
    } catch (err) {
      console.warn(`merge cart: failed to add product ${item.productId}`, err);
    }
  }
  clear();
}
