import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getApiPath, isNetlifyEnvironment } from "./netlify-auth-config";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Try to parse as JSON first
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonData = await res.json();
        throw new Error(jsonData.message || jsonData.error || `${res.status}: ${res.statusText}`);
      } else {
        // Otherwise get as text
        const text = await res.text();
        throw new Error(text || `${res.status}: ${res.statusText}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    // Convert API paths for Netlify environment
    const apiUrl = getApiPath(url);
    
    // Log request information for debugging
    console.log(`API Request: ${method} ${apiUrl} ${isNetlifyEnvironment() ? '(Netlify)' : ''}`);
    if (data) {
      console.log('Request data:', JSON.stringify(data).substring(0, 200) + (JSON.stringify(data).length > 200 ? '...' : ''));
    }
    
    const res = await fetch(apiUrl, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    
    console.log(`API Response: ${res.status} ${res.statusText} from ${apiUrl}`);
    
    // We'll handle errors in the mutation functions to get more specific error messaging
    // so we don't await throwIfResNotOk here anymore
    return res;
  } catch (error) {
    console.error(`API Request Error for ${method} ${url}:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Convert API paths for Netlify environment
    const url = queryKey[0] as string;
    const apiUrl = getApiPath(url);
    
    console.log(`Query request: ${apiUrl} ${isNetlifyEnvironment() ? '(Netlify)' : ''}`);
    
    const res = await fetch(apiUrl, {
      credentials: "include",
    });

    console.log(`Query response: ${res.status} ${res.statusText} from ${apiUrl}`);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
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
