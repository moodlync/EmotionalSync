import { QueryClient, QueryFunction } from "@tanstack/react-query";

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
    // Log request information for debugging
    console.log(`API Request: ${method} ${url}`);
    if (data) {
      console.log('Request data:', data);
    }
    
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    
    console.log(`API Response: ${res.status} ${res.statusText} from ${url}`);
    
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
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

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
  
  const userKey = window.location.hostname.includes('netlify.app')
    ? "/.netlify/functions/api/user"
    : "/api/user";
  
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
  
  const userKey = window.location.hostname.includes('netlify.app')
    ? "/.netlify/functions/api/user"
    : "/api/user";
  
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
    // Add manual event listener to store user data when it changes
    const userKey = window.location.hostname.includes('netlify.app')
      ? "/.netlify/functions/api/user"
      : "/api/user";
      
    // Set up an interval to check and save user data periodically
    const saveInterval = setInterval(() => {
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
