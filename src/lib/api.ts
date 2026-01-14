import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = API_BASE_URL.replace('/api', '');

// User-friendly error messages for common HTTP status codes
const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'Invalid email/username or password. Please try again.',
  403: 'You don\'t have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This resource already exists.',
  422: 'Please check your input and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our end. Please try again later.',
  502: 'Service temporarily unavailable. Please try again later.',
  503: 'Service temporarily unavailable. Please try again later.',
};

// Extract user-friendly error message from API response
export const extractErrorMessage = (error: AxiosError): string => {
  const response = error.response;
  const status = response?.status;
  const data = response?.data as Record<string, unknown> | undefined;

  // Try to extract message from response body
  if (data) {
    // Check common error response formats
    if (typeof data.message === 'string' && data.message) {
      return data.message;
    }
    if (typeof data.error === 'string' && data.error) {
      return data.error;
    }
    if (typeof data.title === 'string' && data.title) {
      return data.title;
    }
    // ASP.NET validation errors format
    if (data.errors && typeof data.errors === 'object') {
      const errors = data.errors as Record<string, string[]>;
      const firstError = Object.values(errors)[0];
      if (Array.isArray(firstError) && firstError.length > 0) {
        return firstError[0];
      }
    }
    // FluentValidation format
    if (Array.isArray(data.errors)) {
      const firstError = data.errors[0];
      if (typeof firstError === 'object' && firstError !== null && 'errorMessage' in firstError) {
        return (firstError as { errorMessage: string }).errorMessage;
      }
      if (typeof firstError === 'string') {
        return firstError;
      }
    }
  }

  // Fall back to status-based messages
  if (status && HTTP_ERROR_MESSAGES[status]) {
    return HTTP_ERROR_MESSAGES[status];
  }

  // Network errors
  if (error.code === 'ERR_NETWORK') {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }

  // Generic fallback
  return 'Something went wrong. Please try again.';
};

// Helper to get full URL for static assets (avatars, etc.)
export const getAssetUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  // If already a full URL (e.g., Google avatar), return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // If path starts with avatars/ (MinIO path), serve via files API
  if (path.startsWith('avatars/') || path.startsWith('uploads/')) {
    return `${API_BASE_URL}/files/${path}`;
  }
  // Legacy paths starting with / (local file storage)
  if (path.startsWith('/')) {
    return `${BACKEND_URL}${path}`;
  }
  // Default: serve via files API
  return `${API_BASE_URL}/files/${path}`;
};

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  }
};

export const getTokens = () => {
  if (typeof window !== 'undefined') {
    accessToken = accessToken || localStorage.getItem('accessToken');
    refreshToken = refreshToken || localStorage.getItem('refreshToken');
  }
  return { accessToken, refreshToken };
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken: token } = getTokens();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh and error messages
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Skip token refresh for auth endpoints (login, register, etc.)
    const isAuthEndpoint = originalRequest.url?.includes('/auth/');

    // If 401 and we haven't retried yet, and it's not an auth endpoint, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      const { refreshToken: token } = getTokens();
      if (token) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken: token,
          });

          const { accessToken: newAccess, refreshToken: newRefresh } = response.data;
          setTokens(newAccess, newRefresh);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          }

          return api(originalRequest);
        } catch (refreshError) {
          clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          // Extract user-friendly message for refresh error
          const message = extractErrorMessage(refreshError as AxiosError);
          return Promise.reject(new Error(message));
        }
      }
    }

    // Extract user-friendly error message and reject with it
    const message = extractErrorMessage(error);
    return Promise.reject(new Error(message));
  }
);

export default api;
