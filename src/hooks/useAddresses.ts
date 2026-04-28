import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/lib/api/addresses";
import type { AddressInput } from "@/lib/api/types";
import { queryKeys } from "@/lib/queries";
import { useAuthStore } from "@/stores/authStore";

export function useAddressesQuery() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: queryKeys.addresses,
    queryFn: getAddresses,
    enabled: !!token,
  });
}

export function useCreateAddressMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddressInput) => createAddress(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.addresses }),
  });
}

export function useUpdateAddressMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: AddressInput }) => updateAddress(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.addresses }),
  });
}

export function useDeleteAddressMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAddress(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.addresses }),
  });
}

export function useSetDefaultAddressMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => setDefaultAddress(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.addresses }),
  });
}
