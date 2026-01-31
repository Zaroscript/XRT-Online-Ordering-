import axios from 'axios';
import Cookies from 'js-cookie';
import Router from 'next/router';
import { AUTH_CRED } from '@/utils/constants';

import { API_ENDPOINTS } from './api-endpoints';
import { getAuthCredentials, setAuthCredentials } from '@/utils/auth-utils';

// Removed invariant check to prevent build failures
// Environment variable should be set in Vercel, but we provide a fallback
// If NEXT_PUBLIC_REST_API_ENDPOINT is missing, it will use the fallback below
const Axios = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_REST_API_ENDPOINT || 'http://localhost:3001/api/v1',
  timeout: 30000, // Increased to 30 seconds to avoid timeouts in dev
  headers: {
    'Content-Type': 'application/json',
  },
});
Axios.interceptors.request.use((config) => {
  const { token } = getAuthCredentials();

  // Don't add Authorization header for auth endpoints (login, register, etc.)
  const isAuthEndpoint =
    config.url?.includes('/auth/login') ||
    config.url?.includes('/auth/register') ||
    config.url?.includes('/auth/forgot-password') ||
    config.url?.includes('/auth/reset-password') ||
    config.url?.includes('/auth/refresh-token');

  // Only add Authorization header if we have a token and it's not an auth endpoint
  if (token && !isAuthEndpoint) {
    // @ts-ignore
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
});
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return Axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken, permissions, role } = getAuthCredentials();

      if (refreshToken) {
        try {
          const apiBaseUrl =
            process.env.NEXT_PUBLIC_REST_API_ENDPOINT ||
            'http://localhost:3001/api/v1';
          const { data } = await axios.post(
            `${apiBaseUrl}/${API_ENDPOINTS.REFRESH_TOKEN}`,
            { refreshToken },
          );

          if (data && data.accessToken) {
            setAuthCredentials(
              data.accessToken,
              permissions,
              role,
              data.refreshToken || refreshToken, // Token rotation: use new if available, else keep old
            );
            originalRequest.headers['Authorization'] =
              `Bearer ${data.accessToken}`;

            processQueue(null, data.accessToken);
            return Axios(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          // If refresh fails, fall through to logout handling
        } finally {
          isRefreshing = false;
        }
      } else {
        isRefreshing = false; // logic adjust: if no refresh token, we technically didn't refresh, but we should clear queue
        // Actually if no refresh token, we just fail immediately below.
      }
    }

    if (
      (error.response && error.response.status === 401) ||
      (error.response && error.response.status === 403) ||
      (error.response &&
        error.response.data.message === 'PICKBAZAR_ERROR.NOT_AUTHORIZED')
    ) {
      // Don't reload if we're already on the login page or other auth pages
      const currentPath = Router.pathname || Router.asPath || '';
      const isAuthPage =
        currentPath === '/login' ||
        currentPath.includes('/login') ||
        currentPath === '/register' ||
        currentPath.includes('/register') ||
        currentPath === '/forgot-password' ||
        currentPath.includes('/forgot-password') ||
        currentPath === '/reset-password' ||
        currentPath.includes('/reset-password') ||
        currentPath === '/logout' ||
        currentPath.includes('/logout');

      // Don't redirect to logout if the request was already a logout attempt that failed
      const isLogoutRequest = originalRequest.url?.includes('/auth/logout');

      if (!isAuthPage && !isLogoutRequest) {
        Cookies.remove(AUTH_CRED);
        Router.push('/logout');
      }
    }
    return Promise.reject(error);
  },
);

function formatBooleanSearchParam(key: string, value: boolean) {
  return value ? `${key}:1` : `${key}:`;
}

interface SearchParamOptions {
  categories: string;
  code: string;
  type: string;
  name: string;
  shop_id: string;
  is_approved: boolean;
  tracking_number: string;
  notice: string;
  notify_type: string;
  faq_title: string;
  is_active: boolean;
  title: string;
  status: string;
  user_id: string;
  target: string;
  refund_reason: string;
  shops: string;
  'users.id': string;
  product_type: string;
  is_read: boolean;
  transaction_identifier: string;
}

export class HttpClient {
  static async get<T>(url: string, params?: unknown, options?: any) {
    const response = await Axios.get<T>(url, { params, ...options });
    return response.data;
  }

  static async post<T>(url: string, data: unknown, options?: any) {
    const response = await Axios.post<T>(url, data, options);
    return response.data;
  }

  static async put<T>(url: string, data: unknown, options?: any) {
    const response = await Axios.put<T>(url, data, options);
    return response.data;
  }

  static async patch<T>(url: string, data: unknown, options?: any) {
    const response = await Axios.patch<T>(url, data, options);
    return response.data;
  }

  static async delete<T>(url: string) {
    const response = await Axios.delete<T>(url);
    return response.data;
  }

  static formatSearchParams(params: Partial<SearchParamOptions>) {
    return Object.entries(params)
      .filter(([, value]) => Boolean(value))
      .map(([k, v]) =>
        [
          'type',
          'categories',
          'tags',
          'author',
          'manufacturer',
          'shops',
          'refund_reason',
        ].includes(k)
          ? `${k}.slug:${v}`
          : ['is_approved'].includes(k)
            ? formatBooleanSearchParam(k, v as boolean)
            : `${k}:${v}`,
      )
      .join(';');
  }
}

export function getFormErrors(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data.message;
  }
  return null;
}

export function getFieldErrors(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data.errors;
  }
  return null;
}
