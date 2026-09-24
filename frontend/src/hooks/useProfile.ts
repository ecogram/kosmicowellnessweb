import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { normalizeImageUrl } from '../utils/imageUrl';

// ─── GET /api/auth/profile (fallback /api/users/profile) ──────────────────────
export const useProfile = () => {
  const { updateUser, accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['auth-profile'],
    queryFn: async () => {
      let data: any;
      try {
        const res = await api.get('/auth/profile');
        data = res.data;
      } catch (err: any) {
        if (err?.response?.status === 401) {
          useAuthStore.getState().logout();
        }
        return null;
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

        const current = useAuthStore.getState().user;
        const incomingPhone = user.phoneNumber || user.phone || (user as any)?.mobile || '';
        const currentPhone = current?.phoneNumber || current?.phone || (current as any)?.mobile || '';
        const incomingName = user.name || (user as any)?.fullName || '';
        const currentName = current?.name || (current as any)?.fullName || '';
        const incomingEmail = (user.email || '').toLowerCase();
        const currentEmail = (current?.email || '').toLowerCase();
        const currentPic = current?.profilePicture || '';

        const currentPayments = (current as any)?.savedPaymentMethods || [];
        const incomingPayments = (user as any)?.savedPaymentMethods || [];

        const hasChanged =
          !current ||
          currentName !== incomingName ||
          currentEmail !== incomingEmail ||
          currentPic !== normalized ||
          currentPhone !== incomingPhone ||
          JSON.stringify(currentPayments) !== JSON.stringify(incomingPayments);

        if (hasChanged) {
          user.phoneNumber = incomingPhone;
          user.phone = incomingPhone;
          user.name = incomingName;
          user.fullName = incomingName;
          updateUser(user);
        }
      }
      return user;
    },
    enabled: !!accessToken,
    staleTime: 30000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: false,
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
        const finalPhone = updatedUser.phoneNumber || updatedUser.phone || (updatedUser as any)?.mobile || '';
        updatedUser.phoneNumber = finalPhone;
        updatedUser.phone = finalPhone;
        const finalName = updatedUser.name || (updatedUser as any)?.fullName || '';
        updatedUser.name = finalName;
        updatedUser.fullName = finalName;
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
