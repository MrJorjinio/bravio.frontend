import api from '@/lib/api';
import type {
  Badge,
  UserBadgesResponse,
  AllBadgesResponse,
  CheckBadgesResponse
} from '@/types';

export const badgeService = {
  async getUserBadges(): Promise<UserBadgesResponse> {
    const response = await api.get<UserBadgesResponse>('/badges');
    return response.data;
  },

  async getAllBadges(): Promise<AllBadgesResponse> {
    const response = await api.get<AllBadgesResponse>('/badges/all');
    return response.data;
  },

  async checkBadges(): Promise<CheckBadgesResponse> {
    const response = await api.post<CheckBadgesResponse>('/badges/check');
    return response.data;
  },

  async setDisplayBadge(badgeType: string): Promise<Badge> {
    const response = await api.post<Badge>('/badges/display', { badgeType });
    return response.data;
  },

  async getDisplayBadge(): Promise<Badge | null> {
    const response = await api.get<Badge | null>('/badges/display');
    return response.data;
  },
};

export default badgeService;
