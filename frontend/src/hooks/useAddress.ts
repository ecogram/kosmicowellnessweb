import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export interface Address {
  _id?: string;
  addressLabel: string;    // e.g. "Home", "Work"
  fullName: string;
  streetAddress: string;
  city: string;
  pincode: string;
  phoneNumber: string;
  isDefault?: boolean;
}

// GET /api/address
export const useAddresses = () => {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const { data } = await api.get('/address');
      const addresses: Address[] =
        data?.data?.addresses ?? (Array.isArray(data?.data) ? data.data : []);
      return addresses;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5000,
    retry: 1,
  });
};

// POST /api/address
export const useSaveAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<Address, '_id'>) => {
      const { data } = await api.post('/address', payload);
      return data?.data?.address ?? data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};

// PUT /api/address/{addressId}
export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      addressId,
      payload,
    }: {
      addressId: string;
      payload: Partial<Omit<Address, '_id'>>;
    }) => {
      const { data } = await api.put(`/address/${addressId}`, payload);
      return data?.data?.address ?? data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};

// PUT /api/address/set-default/{addressId}
export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressId: string) => {
      const { data } = await api.put(`/address/set-default/${addressId}`);
      return data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};

// DELETE /api/address/{addressId}
export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressId: string) => {
      await api.delete(`/address/${addressId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};
