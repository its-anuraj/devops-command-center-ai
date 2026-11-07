import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/gateway';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export async function request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient(config);
    return {
      data: response.data as T,
      error: null,
      status: response.status,
    };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return {
        data: null,
        error: err.response?.data?.detail || err.message || 'Request failed',
        status: err.response?.status || 0,
      };
    }
    return {
      data: null,
      error: (err as Error)?.message || 'Unknown network error',
      status: 0,
    };
  }
}

