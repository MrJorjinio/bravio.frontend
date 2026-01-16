import api from '@/lib/api';
import type {
  AnalyticsOverviewResponse,
  UserGrowthResponse,
  RevenueTrendResponse,
  TransactionBreakdownResponse,
  TopPagesResponse,
  AnalyticsPeriod
} from '@/types';

export const adminService = {
  async getOverview(): Promise<AnalyticsOverviewResponse> {
    const response = await api.get<AnalyticsOverviewResponse>('/admin/analytics/overview');
    return response.data;
  },

  async getUserGrowth(period: AnalyticsPeriod = '30d'): Promise<UserGrowthResponse> {
    const response = await api.get<UserGrowthResponse>('/admin/analytics/users/growth', {
      params: { period }
    });
    return response.data;
  },

  async getRevenueTrend(period: AnalyticsPeriod = '30d'): Promise<RevenueTrendResponse> {
    const response = await api.get<RevenueTrendResponse>('/admin/analytics/revenue/trend', {
      params: { period }
    });
    return response.data;
  },

  async getTransactionBreakdown(period: AnalyticsPeriod = '30d'): Promise<TransactionBreakdownResponse> {
    const response = await api.get<TransactionBreakdownResponse>('/admin/analytics/transactions/breakdown', {
      params: { period }
    });
    return response.data;
  },

  async getTopPages(limit: number = 10): Promise<TopPagesResponse> {
    const response = await api.get<TopPagesResponse>('/admin/analytics/pages/top', {
      params: { limit }
    });
    return response.data;
  },
};

export default adminService;
