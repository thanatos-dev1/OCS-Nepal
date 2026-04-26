import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomers, getCustomer, getCustomerOrders, blockCustomer, unblockCustomer } from "@/lib/api/customers";
import { queryKeys } from "@/lib/queries";

export function useCustomersQuery() {
  return useQuery({
    queryKey: queryKeys.customers,
    queryFn: getCustomers,
  });
}

export function useCustomerQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.customer(id),
    queryFn: () => getCustomer(id),
    enabled: !!id,
  });
}

export function useCustomerOrdersQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.customerOrders(id),
    queryFn: () => getCustomerOrders(id),
    enabled: !!id,
  });
}

export function useToggleBlockMutation(customerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (block: boolean) =>
      block ? blockCustomer(customerId) : unblockCustomer(customerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.customers });
      qc.invalidateQueries({ queryKey: queryKeys.customer(customerId) });
    },
  });
}
