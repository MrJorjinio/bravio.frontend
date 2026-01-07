import api from '@/lib/api';
import type {
  BalanceResponse,
  PurchaseRequest,
  PurchaseResponse,
  Transaction,
  TransactionsResponse
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

  async getTransactions(page: number = 1, limit: number = 10): Promise<TransactionsResponse> {
    const response = await api.get<TransactionsResponse>('/wallet/transactions', {
      params: { page, limit },
    });
    return response.data;
  },
};

export default walletService;
