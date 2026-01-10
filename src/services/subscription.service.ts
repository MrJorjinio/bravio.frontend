import api from '@/lib/api';
import type {
  SubscriptionStatusResponse,
  SubscriptionCheckoutResponse,
  SubscriptionHistoryResponse
} from '@/types';

export const subscriptionService = {
  async getStatus(): Promise<SubscriptionStatusResponse> {
    const response = await api.get<SubscriptionStatusResponse>('/subscription/status');
    return response.data;
  },

  async createCheckout(): Promise<SubscriptionCheckoutResponse> {
    const response = await api.post<SubscriptionCheckoutResponse>('/subscription/checkout');
    return response.data;
  },

  async cancelSubscription(): Promise<SubscriptionStatusResponse> {
    const response = await api.post<SubscriptionStatusResponse>('/subscription/cancel');
    return response.data;
  },

  async verifySubscription(): Promise<SubscriptionStatusResponse> {
    const response = await api.post<SubscriptionStatusResponse>('/subscription/verify');
    return response.data;
  },

  async getHistory(): Promise<SubscriptionHistoryResponse> {
    const response = await api.get<SubscriptionHistoryResponse>('/subscription/history');
    return response.data;
  },
};

export default subscriptionService;
