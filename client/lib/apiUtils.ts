// Enhanced API client with proper error handling, loading states, and retry logic
import { AuthResponse, ApiError } from '../../shared/api';

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

type ApiResponse<T = any> = {
  data: T;
  error: null;
} | {
  data: null;
  error: ApiError;
};

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;

  constructor() {
    // Determine the correct API URL based on environment
    const isProduction = window.location.hostname.includes('fly.dev');
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isProduction) {
      // Use the same domain for API calls in production
      this.baseURL = window.location.origin;
    } else if (isDevelopment) {
      // Use the current origin for development
      this.baseURL = window.location.origin;
    } else {
      // Fallback
      this.baseURL = import.meta.env.VITE_API_URL || window.location.origin;
    }

    console.log('API Client initialized with base URL:', this.baseURL);
    this.timeout = 10000; // 10 seconds
    this.retries = 3;
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      timeout = this.timeout,
      retries = this.retries
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...requestConfig,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ 
            error: `HTTP ${response.status}: ${response.statusText}` 
          }));
          
          // Handle authentication errors
          if (response.status === 401) {
            this.handleAuthError();
          }

          return {
            data: null,
            error: {
              error: errorData.error || `Request failed with status ${response.status}`,
              details: errorData.details,
            },
          };
        }

        const data = await response.json();
        return { data, error: null };

      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on abort (timeout)
        if (error instanceof Error && error.name === 'AbortError') {
          return {
            data: null,
            error: {
              error: 'Request timeout. Please check your connection and try again.',
            },
          };
        }

        // Don't retry on client errors (4xx)
        if (error instanceof Error && error.message.includes('4')) {
          break;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    return {
      data: null,
      error: {
        error: lastError?.message || 'Network error. Please check your connection.',
      },
    };
  }

  private handleAuthError(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userProfile');
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/signin') && !window.location.pathname.includes('/signup')) {
        window.location.href = '/student/signin';
      }
    }
  }

  // Auth methods
  async login(email: string, password: string, role?: 'student' | 'company'): Promise<ApiResponse<AuthResponse>> {
    return this.makeRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: { email, password, role },
    });
  }

  async register(userData: {
    email: string;
    password: string;
    role: 'student' | 'company';
    firstName?: string;
    lastName?: string;
    companyName?: string;
  }): Promise<ApiResponse<AuthResponse>> {
    const response = await this.makeRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: userData,
      retries: 2, // Retry up to 2 times for registration
    });

    // Handle specific error cases with user-friendly messages
    if (response.error) {
      if (response.error.error.includes('503')) {
        response.error.error = 'Our servers are temporarily busy. Please try again in a moment.';
      } else if (response.error.error.includes('404')) {
        response.error.error = 'Registration service is currently unavailable. Please try again later.';
      } else if (response.error.error.includes('already exists')) {
        response.error.error = 'An account with this email already exists. Please try signing in instead.';
      }
    }

    return response;
  }

  async companySignup(companyData: any): Promise<ApiResponse<AuthResponse>> {
    return this.makeRequest<AuthResponse>('/api/auth/register/company', {
      method: 'POST',
      body: companyData,
    });
  }

  // User methods
  async getProfile(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/users/profile');
  }

  async updateProfile(profileData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/users/profile', {
      method: 'PUT',
      body: profileData,
    });
  }

  // Matching methods
  async getJobMatches(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/matching/jobs');
  }

  async getProfileStatus(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/matching/profile-status');
  }

  // Apprenticeships methods
  async discoverApprenticeships(params?: any): Promise<ApiResponse<any>> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.makeRequest(`/api/apprenticeships/discover${queryString}`);
  }

  async swipeApprenticeship(id: string, direction: 'left' | 'right', studentLocation?: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/apprenticeships/${id}/swipe`, {
      method: 'POST',
      body: { direction, studentLocation },
    });
  }

  // Applications methods
  async getMyApplications(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/applications/my-applications');
  }

  async getReceivedApplications(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/applications/received');
  }

  // Company methods
  async getMyListings(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/apprenticeships/my-listings');
  }

  async createListing(listingData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/apprenticeships', {
      method: 'POST',
      body: listingData,
    });
  }

  async updateListing(id: string, listingData: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/apprenticeships/${id}`, {
      method: 'PUT',
      body: listingData,
    });
  }

  async deleteListing(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/apprenticeships/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics methods
  async getDashboardAnalytics(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/analytics/dashboard');
  }

  // Generic method for any endpoint
  async request<T>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, options);
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Helper function for localStorage operations
export const storage = {
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  },
  
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  },
  
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userProfile');
    }
  },
  
  setUserProfile: (profile: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userProfile', JSON.stringify(profile));
    }
  },
  
  getUserProfile: () => {
    if (typeof window !== 'undefined') {
      const profile = localStorage.getItem('userProfile');
      return profile ? JSON.parse(profile) : null;
    }
    return null;
  }
};

// Network status checker
export function checkNetworkStatus(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

// Format error messages
export function formatApiError(error: ApiError | string): string {
  if (typeof error === 'string') {
    return error;
  }
  
  return error.error || 'An unexpected error occurred';
}

// Retry function with exponential backoff
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}
