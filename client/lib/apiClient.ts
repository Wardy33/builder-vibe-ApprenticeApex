// Enhanced API client with proper error handling, loading states, and retry logic
import { AuthResponse, ApiError } from "../shared/api";

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

interface ApiResponse<T = any> {
  data: T;
  error: null;
} | {
  data: null;
  error: ApiError;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
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
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return this.makeRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
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
    return this.makeRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: userData,
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

// Helper hooks for React components
export function useApiCall<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const executeCall = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await apiCall();
    
    if (response.error) {
      setError(response.error.error);
      setData(null);
    } else {
      setData(response.data);
      setError(null);
    }
    
    setLoading(false);
  }, deps);

  useEffect(() => {
    executeCall();
  }, [executeCall]);

  return { data, loading, error, refetch: executeCall };
}

// Error boundary component
import { Component, ReactNode, useState, useEffect, useCallback } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const reset = () => {
        this.setState({ hasError: false, error: undefined });
      };

      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error, reset);
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h2>
              <p className="text-red-600 mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <button
                onClick={reset}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading component
export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange"></div>
    </div>
  );
}

// Network status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}