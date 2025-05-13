import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getApiPath, isNetlifyEnvironment, isReplitEnvironment } from "./netlify-auth-config";
import { 
  handleResponseError, 
  handleError, 
  ErrorType, 
  showErrorToast
} from "./error-handler";

/**
 * Enhanced error check function for responses that integrates with our error handling system
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const errorData = await handleResponseError(res);
    
    // Create an error with the right message
    const error = new Error(errorData.message);
    // Add the error data to the error object for downstream consumers
    (error as any).errorData = errorData;
    throw error;
  }
}

/**
 * Enhanced API request function with better error handling
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: {
    showErrorToast?: boolean;
    retryOnNetworkError?: boolean;
    retries?: number;
  }
): Promise<Response> {
  const { 
    showErrorToast: shouldShowToast = false, 
    retryOnNetworkError = true,
    retries = 2
  } = options || {};
  
  let currentTry = 0;
  
  const executeRequest = async (): Promise<Response> => {
    try {
      // Convert API paths for current environment
      const apiUrl = getApiPath(url);
      
      // Get environment info for debugging
      const isNetlify = isNetlifyEnvironment();
      const isReplit = isReplitEnvironment();
      
      // Log request information for debugging
      console.log(`API Request: ${method} ${apiUrl} (Netlify: ${isNetlify}, Replit: ${isReplit})`);
      console.log(`Current URL: ${window.location.origin}, Sending to: ${apiUrl}`);
      if (data) {
        console.log('Request data:', JSON.stringify(data).substring(0, 200) + (JSON.stringify(data).length > 200 ? '...' : ''));
      }
      
      // Check if we're online before making the request
      if (!navigator.onLine) {
        const offlineError = new Error("You're currently offline. Please check your connection and try again.");
        const errorData = handleError(offlineError);
        
        if (shouldShowToast) {
          showErrorToast(errorData);
        }
        
        throw offlineError;
      }
      
      const res = await fetch(apiUrl, {
        method,
        headers: data ? { "Content-Type": "application/json" } : {},
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });
      
      console.log(`API Response: ${res.status} ${res.statusText} from ${apiUrl}`);
      
      // Improved debugging for authentication errors
      if (res.status === 401) {
        console.error('Authentication error: Not authorized. Session may be invalid or expired.');
      } else if (!res.ok) {
        try {
          // Try to get response body for more error details
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await res.clone().json();
            console.error('API Error details:', errorData);
          } else {
            const errorText = await res.clone().text();
            console.error('API Error response:', errorText);
          }
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
        }
      }
      
      return res;
    } catch (error) {
      console.error(`API Request Error for ${method} ${url}:`, error);
      
      // Handle the error with our error handling system
      const errorData = handleError(error);
      
      // If we should retry network errors and we have retries left
      if (
        retryOnNetworkError && 
        currentTry < retries && 
        (errorData.type === ErrorType.NETWORK || errorData.type === ErrorType.TIMEOUT)
      ) {
        currentTry++;
        console.log(`Retrying request (${currentTry}/${retries})...`);
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * currentTry));
        
        // Try again
        return executeRequest();
      }
      
      // Show toast if requested
      if (shouldShowToast) {
        showErrorToast(errorData);
      }
      
      throw error;
    }
  };
  
  return executeRequest();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      // Convert API paths for Netlify environment
      const url = queryKey[0] as string;
      const apiUrl = getApiPath(url);
      
      // Get environment info for debugging
      const isNetlify = isNetlifyEnvironment();
      const isReplit = isReplitEnvironment();
      
      console.log(`Query request: ${apiUrl} (Netlify: ${isNetlify}, Replit: ${isReplit})`);
      console.log(`Environment: ${window.location.hostname}`);
      
      // Check if we're online
      if (!navigator.onLine) {
        console.log('Device is offline, using cached data if available');
        // Let the query continue to use cached data
        // We don't throw here because we want to fall back to cached data
      }
      
      const res = await fetch(apiUrl, {
        credentials: "include",
      });

      console.log(`Query response: ${res.status} ${res.statusText} from ${apiUrl}`);

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      // Handle the error with our error handling system
      handleError(error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Function to persist the user auth state in localStorage
export const persistUserState = () => {
  if (typeof window === 'undefined') return;
  
  // Only persist if "Remember Me" was chosen
  const shouldRememberUser = localStorage.getItem('moodlync_remember_me') === 'true';
  if (!shouldRememberUser) {
    return;
  }
  
  // Get the appropriate user key based on environment
  const userKey = getApiPath("/api/user");
  
  try {
    const user = queryClient.getQueryData([userKey]);
    if (user) {
      localStorage.setItem('moodlync_user', JSON.stringify(user));
    }
  } catch (error) {
    console.error('Error persisting user state:', error);
  }
};

// Function to restore user state from localStorage
export const restoreUserState = () => {
  if (typeof window === 'undefined') return;
  
  // Only restore if "Remember Me" was chosen
  const shouldRememberUser = localStorage.getItem('moodlync_remember_me') === 'true';
  if (!shouldRememberUser) {
    return;
  }
  
  // Get the appropriate user key based on environment
  const userKey = getApiPath("/api/user");
  
  try {
    const savedUser = localStorage.getItem('moodlync_user');
    if (savedUser) {
      queryClient.setQueryData([userKey], JSON.parse(savedUser));
    }
  } catch (error) {
    console.error('Error restoring user state:', error);
  }
};

// Listen for QueryClient events to persist user state
if (typeof window !== 'undefined') {
  try {
    // Get the appropriate user key based on environment
    const userKey = getApiPath("/api/user");
      
    // Set up an interval to check and save user data periodically
    // but only if "Remember Me" was selected
    const saveInterval = setInterval(() => {
      const shouldRememberUser = localStorage.getItem('moodlync_remember_me') === 'true';
      if (!shouldRememberUser) return;
      
      const userData = queryClient.getQueryData([userKey]);
      if (userData) {
        localStorage.setItem('moodlync_user', JSON.stringify(userData));
      }
    }, 5000); // Check every 5 seconds
    
    // Clean up interval on page unload
    window.addEventListener('beforeunload', () => {
      clearInterval(saveInterval);
      persistUserState(); // Final save before page unload
    });
  } catch (error) {
    console.error('Error setting up auth persistence:', error);
  }
  
  // Restore user state when the script is loaded
  setTimeout(() => {
    restoreUserState();
  }, 0);
}
