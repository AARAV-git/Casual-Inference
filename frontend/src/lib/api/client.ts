import axios from 'axios';

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const isConfigured = typeof process.env.NEXT_PUBLIC_API_BASE_URL === 'string' && process.env.NEXT_PUBLIC_API_BASE_URL.length > 0;

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      throw new ApiError(
        error.response.data?.detail || error.message,
        error.response.status,
        error.response.data
      );
    }
    throw new ApiError(error.message || 'Network error', 0);
  }
);

export { apiClient, isConfigured };

export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://localhost:8000/api/v1';

export async function safeCall<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isConfigured) return fallback;
  try {
    return await fn();
  } catch {
    return fallback;
  }
}
