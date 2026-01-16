import api from '@/lib/api';
import type {
  AnalyticsOverviewResponse,
  UserGrowthResponse,
  RevenueTrendResponse,
  TransactionBreakdownResponse,
  TopPagesResponse,
  UploadSourcesResponse,
  BroinEarningsResponse,
  DetailedMetricsResponse,
  AnalyticsPeriod,
  MetricsPeriod
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

  async getTopPages(limit: number = 10, period: AnalyticsPeriod = '30d'): Promise<TopPagesResponse> {
    const response = await api.get<TopPagesResponse>('/admin/analytics/pages/top', {
      params: { limit, period }
    });
    return response.data;
  },

  async getUploadSources(period: AnalyticsPeriod = '30d'): Promise<UploadSourcesResponse> {
    const response = await api.get<UploadSourcesResponse>('/admin/analytics/uploads/sources', {
      params: { period }
    });
    return response.data;
  },

  async getBroinEarnings(period: AnalyticsPeriod = '30d'): Promise<BroinEarningsResponse> {
    const response = await api.get<BroinEarningsResponse>('/admin/analytics/broins/earnings', {
      params: { period }
    });
    return response.data;
  },

  async getDetailedMetrics(period: MetricsPeriod = 'weekly'): Promise<DetailedMetricsResponse> {
    const response = await api.get<DetailedMetricsResponse>('/admin/analytics/metrics/detailed', {
      params: { period }
    });
    return response.data;
  },
};

export default adminService;
