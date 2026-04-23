"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Tag, X, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";
import ProductImage from "@/components/shop/ProductImage";
import { useAuthStore } from "@/stores/authStore";
import { useCartQuery } from "@/hooks/useCart";
import { usePlaceOrderMutation } from "@/hooks/useOrders";
import { useUpdateProfileMutation } from "@/hooks/useProfile";
import { validateCoupon } from "@/lib/api/coupons";

function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString("en-NP")}`;
}

type AddressMode = "saved" | "new";

type FieldErrors = Partial<Record<"name" | "phone" | "address", string>>;

function validate(name: string, phone: string, address: string): FieldErrors {
  const errs: FieldErrors = {};
  if (!name.trim()) errs.name = "Required";
  if (!phone.trim()) errs.phone = "Required";
  else if (!/^\d{10}$/.test(phone.trim())) errs.phone = "Must be 10 digits";
  if (!address.trim()) errs.address = "Required";
  return errs;
}

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s._isInitialized);
  const token = useAuthStore((s) => s.token);

  const { data: items = [], isLoading: cartLoading } = useCartQuery();
  const placeOrder = usePlaceOrderMutation();
  const updateProfile = useUpdateProfileMutation();

  const hasSavedAddress = !!user?.address;
  const [addressMode, setAddressMode] = useState<AddressMode>(hasSavedAddress ? "saved" : "new");
  const [saveAddress, setSaveAddress] = useState(false);

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    if (isInitialized && !token) router.replace("/account/login");
  }, [isInitialized, token, router]);

  useEffect(() => {
    if (!cartLoading && items.length === 0 && isInitialized && token) {
      router.replace("/cart");
    }
  }, [cartLoading, items.length, isInitialized, token, router]);

  if (!isInitialized || cartLoading) return null;
  if (!user || !token) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalQty = items.reduce((n, i) => n + i.quantity, 0);
  const total = subtotal - discountAmount;

  async function handleApplyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponError("");
    setCouponLoading(true);
    try {
      const result = await validateCoupon(code, subtotal);
      setCouponCode(result.couponCode);
      setDiscountAmount(result.discountAmount);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setCouponError(msg ?? "Invalid or expired coupon");
    } finally {
      setCouponLoading(false);
    }
  }

  function handleRemoveCoupon() {
    setCouponCode("");
    setCouponInput("");
    setDiscountAmount(0);
    setCouponError("");
  }

  const deliveryAddress =
    addressMode === "saved"
      ? user.address!
      : address.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError("");

    if (addressMode === "new") {
      const errs = validate(name, phone, address);
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    } else {
      const errs: FieldErrors = {};
      if (!name.trim()) errs.name = "Required";
      if (!phone.trim()) errs.phone = "Required";
      else if (!/^\d{10}$/.test(phone.trim())) errs.phone = "Must be 10 digits";
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    }
    setErrors({});

    try {
      await placeOrder.mutateAsync({
        deliveryAddress,
        phone: phone.trim(),
        note: note.trim() || undefined,
        couponCode: couponCode || undefined,
        discountAmount: discountAmount || undefined,
      });

      if (addressMode === "new" && saveAddress) {
        await updateProfile.mutateAsync({
          name: name.trim(),
          phone: phone.trim(),
          address: deliveryAddress,
        });
      }

      router.push("/account/orders");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setApiError(msg ?? "Failed to place order. Please try again.");
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-text mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left — delivery form */}
          <div className="flex-1 flex flex-col gap-6">

            {/* Contact */}
            <div className="bg-bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-text">Contact</h2>
              <Input
                id="co-name"
                label="Full Name"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
                error={errors.name}
                placeholder="Bishal Rajbahak"
              />
              <Input
                id="co-phone"
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: undefined })); }}
                error={errors.phone}
                placeholder="98XXXXXXXX"
              />
            </div>

            {/* Delivery address */}
            <div className="bg-bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-text">Delivery Address</h2>

              {hasSavedAddress && (
                <div className="flex flex-col gap-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="addressMode"
                      value="saved"
                      checked={addressMode === "saved"}
                      onChange={() => setAddressMode("saved")}
                      className="mt-0.5 accent-primary"
                    />
                    <div>
                      <p className="text-sm font-medium text-text">Use saved address</p>
                      <p className="text-sm text-text-muted mt-0.5">{user.address}</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="addressMode"
                      value="new"
                      checked={addressMode === "new"}
                      onChange={() => setAddressMode("new")}
                      className="accent-primary"
                    />
                    <p className="text-sm font-medium text-text">Use a different address</p>
                  </label>
                </div>
              )}

              {addressMode === "new" && (
                <div className="flex flex-col gap-4">
                  <AddressAutocomplete
                    label="Delivery Address"
                    value={address}
                    onChange={(v) => { setAddress(v); setErrors((p) => ({ ...p, address: undefined })); }}
                    error={errors.address}
                    placeholder="Search your area, street…"
                  />

                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="accent-primary"
                    />
                    <span className="text-sm text-text-muted">Save this address to my profile</span>
                  </label>
                </div>
              )}
            </div>

            {/* Note */}
            <div className="bg-bg-card border border-border rounded-xl p-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="co-note" className="text-sm font-medium text-text">
                  Order Note <span className="text-text-disabled font-normal">(optional)</span>
                </label>
                <textarea
                  id="co-note"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any special instructions…"
                  className="w-full rounded-md border border-border bg-bg px-3.5 py-2.5 text-sm text-text placeholder:text-text-disabled resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 hover:border-border-strong transition-colors"
                />
              </div>
            </div>

            {apiError && (
              <p className="text-sm text-error bg-error-light border border-error/20 rounded-md px-4 py-3">
                {apiError}
              </p>
            )}
          </div>

          {/* Right — order summary */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-bg-card border border-border rounded-xl p-5 sticky top-24 flex flex-col gap-4">
              <h2 className="text-base font-semibold text-text">Order Summary</h2>

              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md overflow-hidden border border-border shrink-0">
                      <ProductImage src={item.product.imageUrl} alt={item.product.name} category="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-text-muted">×{item.quantity}</p>
                    </div>
                    <p className="text-xs font-semibold text-text shrink-0">
                      {formatNPR(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 flex flex-col gap-1.5 text-sm text-text-muted">
                <div className="flex justify-between">
                  <span>Subtotal ({totalQty} items)</span>
                  <span className="text-text font-medium">{formatNPR(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-success">
                    <span className="flex items-center gap-1">
                      <Tag size={12} /> {couponCode}
                    </span>
                    <span className="font-medium">−{formatNPR(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Payment</span>
                  <span className="text-text font-medium">Cash on Delivery</span>
                </div>
              </div>

              {/* Coupon input */}
              {couponCode ? (
                <div className="flex items-center justify-between rounded-md bg-success-light border border-success/20 px-3 py-2 text-sm">
                  <span className="flex items-center gap-1.5 text-success font-medium">
                    <Check size={13} /> {couponCode} applied
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-success/70 hover:text-success transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon())}
                      placeholder="Coupon code"
                      className="flex-1 rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-text placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 hover:border-border-strong transition-colors"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      isLoading={couponLoading}
                      onClick={handleApplyCoupon}
                      disabled={!couponInput.trim()}
                    >
                      Apply
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-error">{couponError}</p>
                  )}
                </div>
              )}

              <div className="border-t border-border pt-3 flex justify-between font-bold text-text">
                <span>Total</span>
                <span>{formatNPR(total)}</span>
              </div>

              <Button
                type="submit"
                variant="cta"
                size="lg"
                className="w-full"
                isLoading={placeOrder.isPending}
              >
                <ShoppingBag size={16} />
                Place Order
              </Button>

              <Link
                href="/cart"
                className="block text-center text-sm text-text-muted hover:text-primary transition-colors"
              >
                ← Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
