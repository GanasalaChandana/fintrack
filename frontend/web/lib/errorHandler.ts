// lib/errorHandler.ts
import { apiRequest as coreApiRequest } from './api';

export class ApiError extends Error {
  status?: number;
  data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Wrapper around the core apiRequest so components can import from
 * `@/lib/errorHandler` and get consistent error objects/logging.
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  try {
    const result = await coreApiRequest<T>(endpoint, options);
    return result;
  } catch (err: any) {
    // Normalize error into ApiError
    const status =
      typeof err?.status === 'number'
        ? err.status
        : (err?.response?.status as number | undefined);

    const data = err?.response?.data ?? err?.data;

    const wrapped = new ApiError(err?.message || 'Request failed', status, data);
    console.error('API Error:', {
      endpoint,
      status,
      message: wrapped.message,
      data,
    });

    throw wrapped;
  }
}
