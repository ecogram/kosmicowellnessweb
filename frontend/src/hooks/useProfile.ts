import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { normalizeImageUrl } from '../utils/imageUrl';

// ─── GET /api/auth/profile (fallback /api/users/profile) ──────────────────────
export const useProfile = () => {
  const { updateUser, accessToken, user: currentUser } = useAuthStore();

  return useQuery({
    queryKey: ['auth-profile'],
    queryFn: async () => {
      let data: any;
      try {
        const res = await api.get('/auth/profile');
        data = res.data;
      } catch (err) {
        try {
          const res = await api.get('/users/profile');
          data = res.data;
        } catch (_) {}
      }
      const user = data?.data?.user ?? data?.user ?? data?.data ?? (data?._id || data?.name ? data : null);
      if (user) {
        // Normalize image URL across all potential property names
        const rawPic =
          user.profilePicture ??
          user.profileImage ??
          user.avatar ??
          user.avatarUrl ??
          user.image ??
          user.photo ??
          user.picture ??
          user.profile_picture ??
          '';
        const normalized = normalizeImageUrl(rawPic);
        user.profilePicture = normalized;
        user.profileImage = normalized;
        user.avatar = normalized;
        user.avatarUrl = normalized;
        user.image = normalized;
        user.photo = normalized;
        user.picture = normalized;
        user.profile_picture = normalized;

        // Only update store if actual data changed to avoid re-render flicker
        if (
          !currentUser ||
          currentUser.name !== user.name ||
          currentUser.email !== user.email ||
          currentUser.profilePicture !== normalized ||
          currentUser.phoneNumber !== (user.phoneNumber || user.phone) ||
          JSON.stringify((currentUser as any)?.savedPaymentMethods) !== JSON.stringify((user as any)?.savedPaymentMethods)
        ) {
          updateUser(user);
        }
      }
      return user;
    },
    enabled: !!accessToken,
    staleTime: 1000,
    refetchInterval: 6000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};

// ─── PUT /api/auth/profile & /api/auth/profile-picture ────────────────────────
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
      let resData: any;

      if (profilePictureFile) {
        const formData = new FormData();
        if (name) {
          formData.append('name', name);
        }
        if (phoneNumber) {
          formData.append('phoneNumber', phoneNumber);
        }
        // STRICTLY use 'profilePicture' field as required by backend Multer upload.single('profilePicture')
        formData.append('profilePicture', profilePictureFile);

        try {
          const res = await api.put('/auth/profile', formData);
          resData = res.data;
        } catch (err) {
          const res = await api.put('/auth/profile-picture', formData);
          resData = res.data;
        }
      } else {
        const payload: any = {};
        if (name !== undefined) {
          payload.name = name;
        }
        if (phoneNumber !== undefined) {
          payload.phoneNumber = phoneNumber;
        }
        if (profilePicture !== undefined) {
          payload.profilePicture = profilePicture;
        }
        const res = await api.put('/auth/profile', payload);
        resData = res.data;
      }

      const user = resData?.data?.user ?? resData?.user ?? resData?.data ?? (resData?._id || resData?.name ? resData : null);
      return user;
    },
    onSuccess: (updatedUser) => {
      if (updatedUser) {
        const rawPic =
          updatedUser.profilePicture ??
          updatedUser.profileImage ??
          updatedUser.avatar ??
          updatedUser.avatarUrl ??
          updatedUser.image ??
          updatedUser.photo ??
          '';
        const normalized = normalizeImageUrl(rawPic);
        updatedUser.profilePicture = normalized;
        updatedUser.profileImage = normalized;
        updatedUser.avatar = normalized;
        updatedUser.avatarUrl = normalized;
        updatedUser.image = normalized;
        updatedUser.photo = normalized;
        updateUser(updatedUser);
      }
      queryClient.invalidateQueries({ queryKey: ['auth-profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
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
