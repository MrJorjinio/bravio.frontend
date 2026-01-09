import api from '@/lib/api';
import { ReferralResponse, ReferralApplyRequest, ReferralApplyResponse, ReferralValidateResponse } from '@/types';

export const referralService = {
  async getReferralInfo(): Promise<ReferralResponse> {
    const response = await api.get<ReferralResponse>('/users/me/referral');
    return response.data;
  },

  async applyReferralCode(request: ReferralApplyRequest): Promise<ReferralApplyResponse> {
    const response = await api.post<ReferralApplyResponse>('/users/me/referral/apply', request);
    return response.data;
  },

  async validateReferralCode(code: string): Promise<ReferralValidateResponse> {
    const response = await api.get<ReferralValidateResponse>(`/users/referral/validate/${code}`);
    return response.data;
  },
};
