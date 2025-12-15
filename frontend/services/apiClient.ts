import { API_BASE_URL, getTenantId, ENDPOINTS } from '../config';
import { ApiResponse } from '../types';

interface RequestOptions extends RequestInit {
  token?: string;
  skipAuth?: boolean;
}

class ApiClient {
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setToken(token: string) {
    localStorage.setItem('auth_token', token);
  }

  // Notify all pending requests that token is refreshed
  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private async refreshAccessToken(): Promise<string | null> {
    const currentToken = this.getToken();
    if (!currentToken) return null;

    try {
      // Use standard fetch here to avoid circular dependency
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': getTenantId(),
        },
        body: JSON.stringify({ token: currentToken }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data.token) {
          this.setToken(json.data.token);
          return json.data.token;
        }
      }
      
      // If refresh fails, clear token
      localStorage.removeItem('auth_token');
      return null;
    } catch (e) {
      console.error("Token refresh failed", e);
      localStorage.removeItem('auth_token');
      return null;
    }
  }

  public async request<T>(endpoint: string, options: RequestOptions = {}, retries = 3): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': getTenantId(),
      ...options.headers as any,
    };

    if (token && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized (Token Expiry)
      if (response.status === 401 && !options.skipAuth) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          const newToken = await this.refreshAccessToken();
          this.isRefreshing = false;
          
          if (newToken) {
            this.onRefreshed(newToken);
            // Retry original request with new token
            return this.request<T>(endpoint, options, retries);
          } else {
            // Force logout if refresh fails
            localStorage.removeItem('auth_token');
            window.location.href = '/login'; 
            throw new Error('Session expired');
          }
        } else {
          // If already refreshing, wait for it to complete
          return new Promise((resolve) => {
            this.addRefreshSubscriber(() => {
              resolve(this.request<T>(endpoint, options, retries));
            });
          });
        }
      }

      // Handle 429 Rate Limiting
      if (response.status === 429 && retries > 0) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '1', 10) * 1000;
        await new Promise(resolve => setTimeout(resolve, retryAfter + 500));
        return this.request<T>(endpoint, options, retries - 1);
      }

      // Handle Server Errors (5xx)
      if (response.status >= 500 && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.request<T>(endpoint, options, retries - 1);
      }

      const data: ApiResponse<T> = await response.json();

      if (!response.ok || (data && data.success === false)) {
        throw new Error(data?.error?.message || `API Error: ${response.status} ${response.statusText}`);
      }

      return data.data;

    } catch (error: any) {
      // If network error (fetch failed), we might want to throw specifically
      console.error(`API Request Failed: ${endpoint}`, error);
      throw error;
    }
  }

  public get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  public post<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public put<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  public delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();