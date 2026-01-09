import api from '@/lib/api';
import type {
  BalanceResponse,
  PurchaseRequest,
  PurchaseResponse,
  CheckoutRequest,
  CheckoutResponse,
  Transaction,
  TransactionsResponse,
  PackagesResponse,
  PackagePurchaseRequest,
  PackagePurchaseResponse
} from '@/types';

export const walletService = {
  async getBalance(): Promise<BalanceResponse> {
    const response = await api.get<BalanceResponse>('/wallet/balance');
    return response.data;
  },

  async purchaseBroins(data: PurchaseRequest): Promise<PurchaseResponse> {
    const response = await api.post<PurchaseResponse>('/wallet/purchase', data);
    return response.data;
  },

  async createCheckout(data: CheckoutRequest): Promise<CheckoutResponse> {
    const response = await api.post<CheckoutResponse>('/payments/checkout', data);
    return response.data;
  },

  async verifyPayment(): Promise<{ completed: boolean; newBalance?: number }> {
    const response = await api.post<{ completed: boolean; newBalance?: number }>('/payments/verify');
    return response.data;
  },

  async getTransactions(page: number = 1, limit: number = 10): Promise<TransactionsResponse> {
    const response = await api.get<TransactionsResponse>('/wallet/transactions', {
      params: { page, limit },
    });
    return response.data;
  },

  async getPackages(): Promise<PackagesResponse> {
    const response = await api.get<PackagesResponse>('/wallet/packages');
    return response.data;
  },

  async purchasePackage(data: PackagePurchaseRequest): Promise<PackagePurchaseResponse> {
    const response = await api.post<PackagePurchaseResponse>('/wallet/purchase', data);
    return response.data;
  },
};

export default walletService;
