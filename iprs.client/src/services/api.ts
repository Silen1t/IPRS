import axios, { AxiosError } from 'axios';
import useAuthStore from '../stores/useAuthStore';
import { toast } from 'sonner';
import { ROUTES } from '@/config/routes';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/api`
    : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('iprs_token');
    if (token && config.headers) {
      config.headers.Authorization = `bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;
      const backendMessage = (data as { message?: string })?.message || '';

      switch (status) {
        case 401:
          // Unauthorized: Expired/invalid session
          if (useAuthStore.getState().isLoggedIn()) {
            toast.error('Session expired. Logging out...');
            useAuthStore.getState().logout();

            window.location.href = ROUTES.errors.sessionExpired;
          } else {
            toast.error((data as string) || 'Authentication required.');
          }
          break;

        case 403:
          // Forbidden: Clearance privilege validation failed
          toast.error(backendMessage || 'Access Denied: Restricted Context.');
          window.location.href = ROUTES.errors.forbidden;
          break;

        case 400:
          toast.error(
            `Bad Request details: ${typeof data === 'string' ? data : JSON.stringify(data)}`
          );
          break;
        case 404:
          window.location.href = ROUTES.errors.notFound || '/not-found';
          break;

        case 503:
          if (error.config?.url?.includes('/health')) {
            return Promise.reject(error);
          }

          window.location.href = ROUTES.errors.maintenance || '/maintenance';
          break;

        case 500:
          toast.error(
            'A critical server error occurred. Please try again later.'
          );
          break;

        default:
          toast.error(`Unhandled API Error (${status})`);
      }
    } else if (error.request || error.code === 'ERR_NETWORK') {
      window.location.href = ROUTES.errors.networkError || '/network-error';
    } else {
      toast.error(`Request setup error: ${error.message}`);
    }

    return Promise.reject(error);
  }
);
