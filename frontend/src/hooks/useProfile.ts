import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { normalizeImageUrl } from '../utils/imageUrl';

// ─── GET /api/auth/profile ───────────────────────────────────────────────────
export const useProfile = () => {
  const { updateUser, accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['auth-profile'],
    queryFn: async () => {
      const { data } = await api.get('/auth/profile');
      const user = data?.data?.user ?? data?.data;
      if (user) {
        // Normalize image URL and update Zustand store
        const pic = user.profilePicture ?? user.profileImage ?? user.avatar ?? '';
        user.profilePicture = normalizeImageUrl(pic);
        user.profileImage   = user.profilePicture;
        user.avatar         = user.profilePicture;
        updateUser(user);
      }
      return user;
    },
    enabled: !!accessToken,
    // Poll every 30 seconds — so changes from mobile app / other platforms update here instantly
    refetchInterval: 30_000,
    staleTime: 10_000,
    retry: 1,
  });
};

// ─── PUT /api/auth/profile (multipart/form-data) ─────────────────────────────
// API docs: Content-Type: multipart/form-data
// Form fields: name (String), phoneNumber (String), profilePicture (File binary)
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      name,
      phoneNumber,
      profilePictureFile,
    }: {
      name?: string;
      phoneNumber?: string;
      profilePictureFile?: File;
    }) => {
      const formData = new FormData();
      if (name)               formData.append('name', name);
      if (phoneNumber)        formData.append('phoneNumber', phoneNumber);
      if (profilePictureFile) formData.append('profilePicture', profilePictureFile);

      const { data } = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data?.data?.user ?? data?.data;
    },
    onSuccess: (updatedUser) => {
      if (updatedUser) {
        const pic = updatedUser.profilePicture ?? updatedUser.profileImage ?? updatedUser.avatar ?? '';
        updatedUser.profilePicture = normalizeImageUrl(pic);
        updatedUser.profileImage   = updatedUser.profilePicture;
        updatedUser.avatar         = updatedUser.profilePicture;
        updateUser(updatedUser);
      }
      // Refetch to get latest from server
      queryClient.invalidateQueries({ queryKey: ['auth-profile'] });
    },
  });
};

// ─── DELETE /api/auth/remove-profile-picture ────────────────────────────────
export const useRemoveProfilePicture = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete('/auth/remove-profile-picture');
      return data?.data?.user ?? data?.data;
    },
    onSuccess: (updatedUser) => {
      const cleared = {
        profilePicture: '',
        profileImage: '',
        avatar: '',
        avatarUrl: '',
        image: '',
      };
      updateUser(updatedUser ?? cleared);
      queryClient.invalidateQueries({ queryKey: ['auth-profile'] });
    },
  });
};

// ─── Helper: base64 data-URL → File object ───────────────────────────────────
// Used when camera captures a snap (canvas → dataURL) and we need a File for FormData
export const dataUrlToFile = (dataUrl: string, filename = 'profile.jpg'): File => {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
};
