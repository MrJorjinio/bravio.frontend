import api from '@/lib/api';
import type { StreakResponse } from '@/types';

export const userService = {
  async getStreak(): Promise<StreakResponse> {
    const response = await api.get<StreakResponse>('/users/me/streak');
    return response.data;
  },
};

export default userService;
