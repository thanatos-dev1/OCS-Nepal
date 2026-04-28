"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Pencil, Trash2, Star } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuthStore } from "@/stores/authStore";
import {
  useAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} from "@/hooks/useAddresses";
import type { Address, AddressInput } from "@/lib/api/types";

const COUNTRIES = ["Nepal", "India", "Bangladesh", "Bhutan"];

type FormState = {
  full_name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

const EMPTY_FORM: FormState = {
  full_name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "Nepal",
};

function AddressForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
}: {
  initial?: FormState;
  onSubmit: (input: AddressInput) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<FormState>(initial ?? EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  function set(field: keyof FormState, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  }

  function validate(): boolean {
    const errs: Partial<FormState> = {};
    if (!form.full_name.trim()) errs.full_name = "Required";
    if (!form.line1.trim()) errs.line1 = "Required";
    if (!form.city.trim()) errs.city = "Required";
    if (!form.state.trim()) errs.state = "Required";
    if (!form.postal_code.trim()) errs.postal_code = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      full_name: form.full_name.trim(),
      line1: form.line1.trim(),
      line2: form.line2.trim() || undefined,
      city: form.city.trim(),
      state: form.state.trim(),
      postal_code: form.postal_code.trim(),
      country: form.country,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="addr-name"
          label="Full Name"
          value={form.full_name}
          onChange={(e) => set("full_name", e.target.value)}
          error={errors.full_name}
          placeholder="Bishal Rajbahak"
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="addr-country" className="text-sm font-medium text-text">Country</label>
          <select
            id="addr-country"
            value={form.country}
            onChange={(e) => set("country", e.target.value)}
            className="h-10 px-3 text-sm bg-bg border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          >
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <Input
        id="addr-line1"
        label="Address Line 1"
        value={form.line1}
        onChange={(e) => set("line1", e.target.value)}
        error={errors.line1}
        placeholder="Street, area"
      />
      <Input
        id="addr-line2"
        label="Address Line 2 (optional)"
        value={form.line2}
        onChange={(e) => set("line2", e.target.value)}
        placeholder="Apartment, suite, etc."
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          id="addr-city"
          label="City"
          value={form.city}
          onChange={(e) => set("city", e.target.value)}
          error={errors.city}
          placeholder="Kathmandu"
        />
        <Input
          id="addr-state"
          label="State / Province"
          value={form.state}
          onChange={(e) => set("state", e.target.value)}
          error={errors.state}
          placeholder="Bagmati"
        />
        <Input
          id="addr-postal"
          label="Postal Code"
          value={form.postal_code}
          onChange={(e) => set("postal_code", e.target.value)}
          error={errors.postal_code}
          placeholder="44600"
        />
      </div>
      <div className="flex gap-3 pt-1">
        <Button type="submit" variant="primary" size="md" isLoading={isPending}>
          Save Address
        </Button>
        <Button type="button" variant="outline" size="md" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function AddressesPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s._isInitialized);
  const token = useAuthStore((s) => s.token);

  const { data: addresses = [], isLoading } = useAddressesQuery();
  const createAddress = useCreateAddressMutation();
  const updateAddress = useUpdateAddressMutation();
  const deleteAddress = useDeleteAddressMutation();
  const setDefault = useSetDefaultAddressMutation();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (isInitialized && !token) router.replace("/account/login");
  }, [isInitialized, token, router]);

  if (!isInitialized || !user) return null;

  function handleCreate(input: AddressInput) {
    createAddress.mutate(input, { onSuccess: () => setShowForm(false) });
  }

  function handleUpdate(input: AddressInput) {
    if (!editing) return;
    updateAddress.mutate(
      { id: editing.id, input },
      { onSuccess: () => setEditing(null) },
    );
  }

  function handleDelete(id: number) {
    setDeletingId(id);
    deleteAddress.mutate(id, { onSettled: () => setDeletingId(null) });
  }

  function addressToForm(addr: Address): FormState {
    return {
      full_name: addr.fullName,
      line1: addr.line1,
      line2: addr.line2 ?? "",
      city: addr.city,
      state: addr.state,
      postal_code: addr.postalCode,
      country: addr.country,
    };
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">My Addresses</h1>
          <p className="text-sm text-text-muted mt-1">Manage your saved delivery addresses</p>
        </div>
        {!showForm && !editing && (
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
            <Plus size={14} /> Add Address
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-base font-semibold text-text mb-4">New Address</h2>
          <AddressForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            isPending={createAddress.isPending}
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-bg-subtle rounded-xl animate-pulse" />
          ))}
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <MapPin size={32} className="mx-auto text-text-disabled mb-3" />
          <p className="font-medium text-text">No saved addresses</p>
          <p className="text-sm text-text-muted mt-1 mb-4">Add an address for faster checkout</p>
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
            <Plus size={14} /> Add Address
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-bg-card border border-border rounded-xl p-5">
              {editing?.id === addr.id ? (
                <>
                  <h2 className="text-sm font-semibold text-text mb-4">Edit Address</h2>
                  <AddressForm
                    initial={addressToForm(addr)}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditing(null)}
                    isPending={updateAddress.isPending}
                  />
                </>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-text text-sm flex items-center gap-2">
                        {addr.fullName}
                        {addr.isDefault && (
                          <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium">
                            Default
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-text-muted mt-0.5">
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                        {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() => setDefault.mutate(addr.id)}
                        disabled={setDefault.isPending}
                        title="Set as default"
                        className="p-1.5 text-text-muted hover:text-warning transition-colors disabled:opacity-50"
                      >
                        <Star size={15} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditing(addr)}
                      className="p-1.5 text-text-muted hover:text-primary transition-colors"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(addr.id)}
                      disabled={deletingId === addr.id}
                      className="p-1.5 text-text-muted hover:text-error transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
