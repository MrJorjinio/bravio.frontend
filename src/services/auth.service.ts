import api, { setTokens, clearTokens, getTokens } from '@/lib/api';
import type {
  LoginRequest,
  RegisterRequest,
  GoogleLoginRequest,
  SendOtpRequest,
  AuthResponse,
  User
} from '@/types';

export const authService = {
  async sendOtp(data: SendOtpRequest): Promise<void> {
    await api.post('/auth/send-otp', data);
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  async googleLogin(data: GoogleLoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/google', data);
    setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  async logout(): Promise<void> {
    const { refreshToken } = getTokens();
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch (error) {
        // Ignore logout errors, still clear tokens
        console.error('Logout error:', error);
      }
    }
    clearTokens();
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, newPassword });
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  isAuthenticated(): boolean {
    const { accessToken } = getTokens();
    return !!accessToken;
  },
};

export default authService;
