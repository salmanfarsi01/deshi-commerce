import axios from 'axios';

export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_API_URL) ||
  'http://localhost:8080/api/v1';

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
        return (globalThis as any).localStorage.getItem(key);
      }
    } catch {
      // Ignore
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
        (globalThis as any).localStorage.setItem(key, value);
      }
    } catch {
      // Ignore
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
        (globalThis as any).localStorage.removeItem(key);
      }
    } catch {
      // Ignore
    }
  },
};

export function normalizeCategoryId(catId?: string): string {
  if (!catId) return 'cat_01';
  const c = catId.toLowerCase();
  if (c === 'cat_01' || c === 'cat_mobile' || c.includes('mobile')) return 'cat_01';
  if (c === 'cat_02' || c === 'cat_electronics' || c.includes('elect')) return 'cat_02';
  if (c === 'cat_03' || c === 'cat_fashion' || c.includes('fash') || c.includes('cloth')) return 'cat_03';
  if (c === 'cat_04' || c === 'cat_groceries' || c.includes('home') || c.includes('appliance') || c.includes('groc')) return 'cat_04';
  return catId.startsWith('cat_') ? catId : 'cat_01';
}

let adminLoginPromise: Promise<string | null> | null = null;

export async function ensureAdminToken(): Promise<string | null> {
  const currentToken = safeLocalStorage.getItem('accessToken');
  if (currentToken && currentToken.startsWith('ey') && currentToken.split('.').length === 3) {
    return currentToken;
  }

  if (adminLoginPromise) {
    return adminLoginPromise;
  }

  adminLoginPromise = (async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        identifier: 'admin@store.com.bd',
        password: 'Password123!',
      });
      if (res.data?.data?.accessToken) {
        const token = res.data.data.accessToken;
        const refreshToken = res.data.data.refreshToken;
        safeLocalStorage.setItem('accessToken', token);
        if (refreshToken) safeLocalStorage.setItem('refreshToken', refreshToken);
        return token;
      }
    } catch (err) {
      console.warn('Could not auto-acquire admin token from backend:', err);
    } finally {
      adminLoginPromise = null;
    }
    return null;
  })();

  return adminLoginPromise;
}

export async function checkBackendConnection(): Promise<boolean> {
  try {
    const res = await axios.get(`${API_BASE_URL}/products?size=1`, { timeout: 3000 });
    return res.status >= 200 && res.status < 300;
  } catch {
    return false;
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Injects Bearer JWT
apiClient.interceptors.request.use(async (config) => {
  const token = safeLocalStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Auto Refresh on 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = safeLocalStorage.getItem('refreshToken');
        if (refreshToken && refreshToken.startsWith('ey')) {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          const newAccessToken = res.data?.data?.accessToken;
          const newRefreshToken = res.data?.data?.refreshToken;
          if (newAccessToken) safeLocalStorage.setItem('accessToken', newAccessToken);
          if (newRefreshToken) safeLocalStorage.setItem('refreshToken', newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        safeLocalStorage.removeItem('accessToken');
        safeLocalStorage.removeItem('refreshToken');
        console.warn('Auth token refresh failed.');
      }
    }
    return Promise.reject(error);
  }
);

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export function wrapSuccess<T>(data: T, message = 'Operation successful'): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

export const simulateDelay = async (ms = 60) => new Promise((resolve) => setTimeout(resolve, ms));
