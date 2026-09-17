import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';

export interface DeliveryEstimatePayload {
  deliveryPincode: string;
  weight: number;            // in kg, e.g. 0.5
  paymentMethod: 'COD' | 'PREPAID';
}

export interface DeliveryEstimateResult {
  estimatedDays?: string | number;
  courier?: string;
  deliveryFee?: number;
  [key: string]: any;
}

// POST /api/shiprocket/estimate-delivery
export const useEstimateDelivery = () => {
  return useMutation({
    mutationFn: async (payload: DeliveryEstimatePayload): Promise<DeliveryEstimateResult> => {
      const { data } = await api.post('/shiprocket/estimate-delivery', payload);
      return data?.data ?? data;
    },
  });
};
