import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { normalizeImageUrl } from '../utils/imageUrl';

// ─── GET /api/auth/profile ───────────────────────────────────────────────────
export const useProfile = () => {
  const { updateUser, accessToken, isAuthenticated } = useAuthStore();
  const hasAuth = isAuthenticated || !!accessToken || !!localStorage.getItem('kosmico_auth_v1');

  return useQuery({
    queryKey: ['auth-profile'],
    queryFn: async () => {
      try {
        let res;
        try {
          res = await api.get('/auth/profile');
        } catch (e) {
          res = await api.get('/users/profile');
        }
        const user = res.data?.data?.user ?? res.data?.data ?? res.data;
        if (user && (user.name || user.email || user._id || user.id)) {
          // Normalize image URL
          const pic = user.profilePicture ?? user.profileImage ?? user.avatar ?? '';
          user.profilePicture = normalizeImageUrl(pic);
          user.profileImage   = user.profilePicture;
          user.avatar         = user.profilePicture;

          const cleanName = user.name || user.fullName || '';
          const cleanPhone = user.phoneNumber || user.phone || '';

          const synchronizedUser = {
            ...user,
            id: user._id || user.id,
            _id: user._id || user.id,
            name: cleanName,
            fullName: cleanName,
            phoneNumber: cleanPhone,
            phone: cleanPhone,
            profilePicture: user.profilePicture,
            profileImage: user.profilePicture,
            avatar: user.profilePicture,
          };

          updateUser(synchronizedUser);
          return synchronizedUser;
        }
        return null;
      } catch (err) {
        return null;
      }
    },
    enabled: hasAuth,
    staleTime: 1000,
    refetchInterval: 3000, // Polls every 3 seconds to sync mobile app updates in real-time
    refetchIntervalInBackground: true, // Syncs even when switching between phone and computer
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 1,
  });
};

// ─── PUT /api/auth/profile ──────────────────────────────────────────────────
// Supports both application/json (text fields) and multipart/form-data (photo upload)
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
      let res;
      if (profilePictureFile) {
        const formData = new FormData();
        if (name) {
          formData.append('name', name);
          formData.append('fullName', name);
        }
        if (phoneNumber) {
          formData.append('phoneNumber', phoneNumber);
          formData.append('phone', phoneNumber);
        }
        formData.append('profilePicture', profilePictureFile);
        formData.append('profileImage', profilePictureFile);
        formData.append('avatar', profilePictureFile);
        formData.append('image', profilePictureFile);

        try {
          res = await api.put('/auth/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } catch (err) {
          res = await api.put('/users/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      } else {
        const payload = {
          name,
          fullName: name,
          phoneNumber,
          phone: phoneNumber,
        };
        try {
          res = await api.put('/auth/profile', payload);
        } catch (err) {
          res = await api.put('/users/profile', payload);
        }
      }
      return res.data?.data?.user ?? res.data?.data ?? res.data;
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
