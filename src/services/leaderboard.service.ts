import api from '@/lib/api';
import type {
  LeaderboardResponse,
  LeaderboardPeriod,
  UserRankResponse
} from '@/types';

export const leaderboardService = {
  async getLeaderboard(period: LeaderboardPeriod = 'weekly', limit: number = 50): Promise<LeaderboardResponse> {
    const response = await api.get<LeaderboardResponse>('/leaderboard', {
      params: { period, limit }
    });
    return response.data;
  },

  async getUserRank(period: LeaderboardPeriod = 'weekly'): Promise<UserRankResponse> {
    const response = await api.get<UserRankResponse>('/leaderboard/rank', {
      params: { period }
    });
    return response.data;
  },
};

export default leaderboardService;
