import api from '@/lib/api';
import type { StreakResponse, LevelResponse, DailyBonusResponse } from '@/types';

export const userService = {
  async getStreak(): Promise<StreakResponse> {
    const response = await api.get<StreakResponse>('/users/me/streak');
    return response.data;
  },

  async getLevel(): Promise<LevelResponse> {
    const response = await api.get<LevelResponse>('/users/me/level');
    return response.data;
  },

  async claimDailyBonus(): Promise<DailyBonusResponse> {
    const response = await api.post<DailyBonusResponse>('/users/me/daily-bonus');
    return response.data;
  },
};

export default userService;
