import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../stores/useAuthStore';
import { toast } from 'sonner';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/api`
    : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('iprs_token');
    if (token && config.headers) {
      config.headers.Authorization = `bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;
      const backendMessage = (data as { message?: string })?.message || '';

      switch (status) {
        case 401:
          // Unauthorized: Token has expired or is invalid
          if (useAuthStore.getState().isLoggedIn()) {
            toast.error('Session expired. Logging out...');

            useAuthStore.getState().logout();

            // Redirect the user to the login route
            window.location.href = '/';
          } else {
            toast.error(data as string);
          }
          break;

        case 403:
          // Forbidden: User doesn't have the correct UserRole permissions
          toast.error(
            backendMessage ||
              'Access Denied: You do not have permission for this action.'
          );

          break;

        case 400:
          // Bad Request: Often structural or validation issues
          toast.error(`Bad Request details: ${data as string}`);
          break;

        case 500:
          // Internal Server Error: Your backend crashed
          toast.error(
            'A critical server error occurred. Please try again later.'
          );
          break;

        default:
          toast.error(`Unhandled API Error (${status}): ${data}`);
      }
    } else if (error.request) {
      // The request was made but no response was received (Server is offline/down)
      toast.error(
        'Network Error: Unable to connect to the server. Please check your connection.'
      );
    } else {
      // Something went wrong setting up the request configuration
      toast.error(`Request setup error: ${error.message}`);
    }

    return Promise.reject(error);
  }
);
