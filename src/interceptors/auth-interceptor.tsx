import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError
} from 'axios';
import { authService } from '../services/auth-service';
import { cryptoService } from '../services/crypto-service';

const createAxiosWithInterceptors = (): AxiosInstance => {
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    responseType: 'text',
  });

  api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      if (config.url?.includes('/auth/refresh')) {
        return config;
      }

      if (authService.isTokenExpired()) {
        try {
          await authService.refreshToken();
        } catch (error) {
          throw error;
        }
      }

      const token = authService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );
  
  api.interceptors.response.use(
    async (response: AxiosResponse) => {
      if (response.data && typeof response.data === 'string' && response.data.length > 0) {
        try {
          const decryptedData = cryptoService.decrypt(response.data);
          return { ...response, data: decryptedData };
        } catch (error) {
          console.error('Decryption error in interceptor:', error);
          try {
            return { ...response, data: JSON.parse(response.data) };
          } catch {
            return response;
          }
        }
      }
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest: any = error.config;
      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          await authService.refreshToken();
          const token = authService.getToken();
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          authService.logout();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
};

export const authenticatedApi = createAxiosWithInterceptors();
