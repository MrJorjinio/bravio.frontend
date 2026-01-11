import api from '@/lib/api';
import type { StreakResponse, LevelResponse, DailyBonusResponse, ProfileResponse, PublicProfileResponse, UpdateProfileResponse } from '@/types';

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

  async getProfile(): Promise<ProfileResponse> {
    const response = await api.get<ProfileResponse>('/users/me/profile');
    return response.data;
  },

  async getPublicProfile(username: string): Promise<PublicProfileResponse> {
    const response = await api.get<PublicProfileResponse>(`/users/profile/${username}`);
    return response.data;
  },

  async updateProfile(username?: string, avatar?: File): Promise<UpdateProfileResponse> {
    const formData = new FormData();

    if (username) {
      formData.append('Username', username);
    }

    if (avatar) {
      formData.append('avatar', avatar);
    }

    const response = await api.post<UpdateProfileResponse>('/users/me/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default userService;
