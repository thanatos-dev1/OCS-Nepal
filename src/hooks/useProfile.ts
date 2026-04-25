import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile, changePassword, uploadAvatar } from "@/lib/api/auth";
import { queryKeys } from "@/lib/queries";
import { useAuthStore } from "@/stores/authStore";

export function useProfileQuery() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
    enabled: !!token,
  });
}

export function useUpdateProfileMutation() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: ({ name, phone, address }: { name: string; phone?: string; address?: string }) =>
      updateProfile(name, phone, address),
    onSuccess: (user) => {
      qc.invalidateQueries({ queryKey: queryKeys.profile });
      setUser(user);
    },
  });
}

export function useUploadAvatarMutation() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
    onSuccess: (user) => {
      qc.invalidateQueries({ queryKey: queryKeys.profile });
      setUser(user);
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      changePassword(currentPassword, newPassword),
  });
}
