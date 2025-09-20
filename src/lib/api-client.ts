import { AuthResponse, LoginRequest } from "@/types/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<any> | null = null;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry: boolean = false
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      credentials: "include", // Include cookies for auth
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized with automatic token refresh
      if (response.status === 401 && !isRetry && !endpoint.includes('/auth/')) {
        try {
          // Try to refresh tokens
          await this.handleTokenRefresh();

          // Retry the original request
          return this.request(endpoint, options, true);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          if (typeof window !== 'undefined') {
            // Store intended destination
            sessionStorage.setItem('auth_redirect', window.location.pathname);
            window.location.href = '/login';
          }
          throw new Error('Authentication expired. Please log in again.');
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Network error" }));
        throw {
          status: response.status,
          message: error.message || "Request failed",
          ...error,
        };
      }

      return response.json();
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw {
          status: 0,
          message: 'Network error. Please check your connection.',
        };
      }
      throw error;
    }
  }

  private async handleTokenRefresh(): Promise<void> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      return response.json();
    })
    .finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<void> {
    return this.request<void>("/auth/logout", {
      method: "POST",
    });
  }

  async refreshToken(): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/refresh", {
      method: "POST",
    });
  }

  async getCurrentUser(): Promise<any> {
    return this.request<any>("/auth/me");
  }

  // Loads methods
  async getLoads(params?: {
    page?: number;
    limit?: number;
    status?: string;
    pickup_date_from?: string;
    pickup_date_to?: string;
    customer_id?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/loads${searchParams.toString() ? `?${searchParams}` : ""}`;
    return this.request<any>(endpoint);
  }

  async getLoad(id: string) {
    return this.request<any>(`/loads/${id}`);
  }

  async updateLoadStatus(id: string, status: string) {
    return this.request<any>(`/loads/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async assignDriver(loadId: string, driverId: string) {
    return this.request<any>(`/loads/${loadId}/assign`, {
      method: "POST",
      body: JSON.stringify({ driver_id: driverId }),
    });
  }

  // Equipment methods
  async getDrivers(params?: any) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    const endpoint = `/drivers${searchParams.toString() ? `?${searchParams}` : ""}`;
    return this.request<any>(endpoint);
  }

  async getTractors(params?: any) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    const endpoint = `/tractors${searchParams.toString() ? `?${searchParams}` : ""}`;
    return this.request<any>(endpoint);
  }

  async getTrailers(params?: any) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    const endpoint = `/trailers${searchParams.toString() ? `?${searchParams}` : ""}`;
    return this.request<any>(endpoint);
  }

  async updateLoadAssignment(loadId: string, assignment: any) {
    return this.request<any>(`/loads/${loadId}/assignment`, {
      method: "PUT",
      body: JSON.stringify(assignment),
    });
  }

  // Customers methods
  async getCustomers() {
    return this.request<any>("/customers");
  }

  async getCustomer(id: string) {
    return this.request<any>(`/customers/${id}`);
  }

  async createCustomer(data: any) {
    return this.request<any>("/customers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCustomer(id: string, data: any) {
    return this.request<any>(`/customers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteCustomer(id: string) {
    return this.request<any>(`/customers/${id}`, {
      method: "DELETE",
    });
  }

  // Orders methods
  async getOrders() {
    return this.request<any>("/orders");
  }

  async getOrder(id: string) {
    return this.request<any>(`/orders/${id}`);
  }

  async createOrder(data: any) {
    return this.request<any>("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateOrder(id: string, data: any) {
    return this.request<any>(`/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteOrder(id: string) {
    return this.request<any>(`/orders/${id}`, {
      method: "DELETE",
    });
  }

  // Dashboard methods
  async getDashboardLayout() {
    return this.request<any>("/v1/dashboard/layout");
  }

  async getDashboardStats(params?: {
    from_date?: string;
    to_date?: string;
    include?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/v1/dashboard/stats${searchParams.toString() ? `?${searchParams}` : ""}`;
    return this.request<any>(endpoint);
  }

  async getWidgetStats(widgetKey: string, params?: {
    from_date?: string;
    to_date?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/v1/dashboard/stats/${widgetKey}${searchParams.toString() ? `?${searchParams}` : ""}`;
    return this.request<any>(endpoint);
  }

  async getDashboardPreferences() {
    return this.request<any>("/v1/dashboard/preferences");
  }

  async updateDashboardPreferences(preferences: {
    hidden_widgets: string[];
    widget_order: string[];
  }) {
    return this.request<any>("/v1/dashboard/preferences", {
      method: "PATCH",
      body: JSON.stringify(preferences),
    });
  }

  // File upload
  async getUploadUrl(filename: string, contentType: string) {
    return this.request<{ upload_url: string; file_url: string }>("/upload/url", {
      method: "POST",
      body: JSON.stringify({ filename, content_type: contentType }),
    });
  }

  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const { upload_url, file_url } = await this.getUploadUrl(file.name, file.type);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(file_url);
        } else {
          reject(new Error("Upload failed"));
        }
      };

      xhr.onerror = () => reject(new Error("Upload failed"));
      xhr.open("PUT", upload_url);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });
  }
}

export const apiClient = new ApiClient();