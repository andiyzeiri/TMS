import { v4 as uuidv4 } from 'uuid';

export interface ApiError extends Error {
  status: number;
  statusText: string;
  data?: any;
}

export interface ApiRequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    nextCursor?: string;
    hasMore?: boolean;
    total?: number;
    page?: number;
    pageSize?: number;
  };
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
}

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number = 30000; // 30 seconds
  private defaultRetries: number = 3;
  private defaultRetryDelay: number = 1000; // 1 second

  constructor(baseURL?: string) {
    this.baseURL = baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private createApiError(response: Response, data?: any): ApiError {
    const error = new Error(`API Error: ${response.status} ${response.statusText}`) as ApiError;
    error.status = response.status;
    error.statusText = response.statusText;
    error.data = data;
    return error;
  }

  private shouldRetry(status: number, attempt: number, maxRetries: number): boolean {
    if (attempt >= maxRetries) return false;

    // Retry on network errors (0), rate limiting (429), and server errors (503)
    return status === 0 || status === 429 || status === 503;
  }

  private async makeRequest<T>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      ...fetchConfig
    } = config;

    const url = `${this.baseURL}${endpoint}`;
    const isWriteMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
      fetchConfig.method?.toUpperCase() || 'GET'
    );

    // Add default headers
    const headers = new Headers(fetchConfig.headers);
    headers.set('Content-Type', 'application/json');

    // Add idempotency key for write operations
    if (isWriteMethod && !headers.has('Idempotency-Key')) {
      headers.set('Idempotency-Key', uuidv4());
    }

    // Add authorization if available
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
      : null;

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const finalConfig: RequestInit = {
      ...fetchConfig,
      headers,
    };

    let lastError: ApiError | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...finalConfig,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle non-2xx responses
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            // Response body is not JSON
            errorData = await response.text();
          }

          const apiError = this.createApiError(response, errorData);

          // Check if we should retry
          if (this.shouldRetry(response.status, attempt, retries)) {
            lastError = apiError;
            if (attempt < retries) {
              // Exponential backoff with jitter
              const delay = retryDelay * Math.pow(2, attempt) + Math.random() * 1000;
              await this.delay(delay);
              continue;
            }
          }

          throw apiError;
        }

        // Parse successful response
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const jsonData = await response.json();
          return jsonData as ApiResponse<T>;
        } else {
          // For non-JSON responses, wrap in our standard format
          const textData = await response.text();
          return { data: textData as T };
        }

      } catch (error) {
        // Handle network errors and timeouts
        if (error instanceof Error && error.name === 'AbortError') {
          const timeoutError = new Error('Request timeout') as ApiError;
          timeoutError.status = 0;
          timeoutError.statusText = 'Timeout';
          lastError = timeoutError;
        } else if (error instanceof Error && !('status' in error)) {
          const networkError = new Error('Network error') as ApiError;
          networkError.status = 0;
          networkError.statusText = 'Network Error';
          networkError.data = error.message;
          lastError = networkError;
        } else {
          lastError = error as ApiError;
        }

        // Check if we should retry network errors
        if (this.shouldRetry(0, attempt, retries) && attempt < retries) {
          const delay = retryDelay * Math.pow(2, attempt) + Math.random() * 1000;
          await this.delay(delay);
          continue;
        }

        throw lastError;
      }
    }

    // Should never reach here, but throw last error if we do
    throw lastError || new Error('Unknown error occurred');
  }

  // HTTP method helpers
  async get<T>(endpoint: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // Convenience method for building query strings
  buildQuery(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, String(item)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  // Update base URL (useful for different environments)
  setBaseURL(url: string): void {
    this.baseURL = url;
  }

  // Get current base URL
  getBaseURL(): string {
    return this.baseURL;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export { ApiClient };