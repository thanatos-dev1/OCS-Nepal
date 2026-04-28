import type { Address, AddressInput } from "./types";
import api from "./client";

type ApiAddress = {
  id: number;
  full_name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
};

function adaptAddress(a: ApiAddress): Address {
  return {
    id: a.id,
    fullName: a.full_name,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    state: a.state,
    postalCode: a.postal_code,
    country: a.country,
    isDefault: a.is_default,
  };
}

export async function getAddresses(): Promise<Address[]> {
  const { data } = await api.get<ApiAddress[]>("/me/addresses");
  return Array.isArray(data) ? data.map(adaptAddress) : [];
}

export async function createAddress(input: AddressInput): Promise<Address> {
  const { data } = await api.post<ApiAddress>("/me/addresses", input);
  return adaptAddress(data);
}

export async function updateAddress(id: number, input: AddressInput): Promise<Address> {
  const { data } = await api.put<ApiAddress>(`/me/addresses/${id}`, input);
  return adaptAddress(data);
}

export async function deleteAddress(id: number): Promise<void> {
  await api.delete(`/me/addresses/${id}`);
}

export async function setDefaultAddress(id: number): Promise<Address> {
  const { data } = await api.put<ApiAddress>(`/me/addresses/${id}/default`);
  return adaptAddress(data);
}
