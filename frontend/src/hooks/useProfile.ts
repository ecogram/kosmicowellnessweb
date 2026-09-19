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
// Supports both multipart/form-data (photo upload) and application/json fallback
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      name,
      phoneNumber,
      profilePictureFile,
      profilePicture,
    }: {
      name?: string;
      phoneNumber?: string;
      profilePictureFile?: File;
      profilePicture?: string;
    }) => {
      let res;
      if (profilePictureFile) {
        let uploadSucceeded = false;
        try {
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

          res = await api.put('/auth/profile', formData);
          const u = res?.data?.data?.user ?? res?.data?.data ?? res?.data;
          if (u && (u.profilePicture || u.profileImage || u.avatar)) {
            uploadSucceeded = true;
          }
        } catch (err) {
          console.warn('Multipart upload notice:', err);
        }

        // If multipart didn't succeed or didn't return saved picture URL, save via JSON
        if (!uploadSucceeded && profilePicture) {
          try {
            res = await api.put('/auth/profile', {
              name,
              fullName: name,
              phoneNumber,
              phone: phoneNumber,
              profilePicture,
              profileImage: profilePicture,
              avatar: profilePicture,
            });
          } catch (err2) {
            console.warn('JSON picture save notice:', err2);
          }
        }
      } else {
        const payload: any = {};
        if (name !== undefined) {
          payload.name = name;
          payload.fullName = name;
        }
        if (phoneNumber !== undefined) {
          payload.phoneNumber = phoneNumber;
          payload.phone = phoneNumber;
          payload.mobile = phoneNumber;
        }
        if (profilePicture !== undefined) {
          payload.profilePicture = profilePicture;
          payload.profileImage = profilePicture;
          payload.avatar = profilePicture;
        }
        try {
          res = await api.put('/auth/profile', payload);
        } catch (err) {
          res = await api.put('/users/profile', payload);
        }
      }
      return res?.data?.data?.user ?? res?.data?.data ?? res?.data;
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
      let res;
      try {
        res = await api.delete('/auth/remove-profile-picture');
      } catch (e) {
        console.warn('DELETE remove picture notice:', e);
      }

      try {
        const updateRes = await api.put('/auth/profile', {
          removePhoto: true,
          profilePicture: '',
          profileImage: '',
          avatar: '',
        });
        if (!res) res = updateRes;
      } catch (e) {
        console.warn('PUT remove picture notice:', e);
      }

      return res?.data?.data?.user ?? res?.data?.data;
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
