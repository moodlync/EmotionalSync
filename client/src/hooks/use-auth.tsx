import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

// Default context value
const defaultContextValue: AuthContextType = {
  user: null,
  isLoading: false,
  error: null,
  loginMutation: {} as UseMutationResult<SelectUser, Error, LoginData>,
  logoutMutation: {} as UseMutationResult<void, Error, void>,
  registerMutation: {} as UseMutationResult<SelectUser, Error, InsertUser>
};

export const AuthContext = createContext<AuthContextType>(defaultContextValue);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Check if we're running in Netlify environment for API paths
  const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify.app');
  const userApiPath = isNetlify ? "/.netlify/functions/api/user" : "/api/user";
  
  console.log(`Using API path for user data: ${userApiPath} (Netlify: ${isNetlify})`);
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: [userApiPath],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        // Check if we're running in Netlify environment
        const isNetlify = window.location.hostname.includes('netlify.app');
        const apiPath = isNetlify ? "/.netlify/functions/api/login" : "/api/login";
        
        console.log(`Using API path for login: ${apiPath} (Netlify: ${isNetlify})`);
        
        const res = await apiRequest("POST", apiPath, credentials);
        
        // Check if the response is ok before trying to parse the JSON
        if (!res.ok) {
          // Display user-friendly error message regardless of actual error
          throw new Error("Login failed. Please check your username and password.");
        }
        
        // Safely parse the response
        let responseData;
        try {
          responseData = await res.json();
          console.log("Login response:", responseData);
        } catch (parseError) {
          console.error("Error parsing login response:", parseError);
          throw new Error("Unable to complete login. Please try again.");
        }
        
        // Handle both response formats:
        // 1. { user: {...}, tokens: {...} } - extract user object
        // 2. Direct user object
        if (responseData && responseData.user && typeof responseData.user === 'object') {
          console.log("Extracted user from response:", responseData.user);
          return responseData.user;
        } else if (responseData && responseData.id) {
          console.log("Using direct user response:", responseData);
          return responseData;
        } else {
          console.error("Invalid user data format in response:", responseData);
          throw new Error("Server returned invalid user data. Please try again.");
        }
      } catch (error) {
        console.error("Login request error:", error);
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      // Update cache using the same path that was used to fetch user data
      const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify.app');
      const userApiPath = isNetlify ? "/.netlify/functions/api/user" : "/api/user";
      
      queryClient.setQueryData([userApiPath], user);
      toast({
        title: "Welcome back!",
        description: `You're logged in as ${user.username}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      try {
        console.log("Registration mutation - submitting data:", { 
          ...credentials, 
          password: credentials.password ? "********" : undefined // Don't log actual password
        });
        
        // Network connection check
        if (!navigator.onLine) {
          throw new Error("You appear to be offline. Please check your internet connection and try again.");
        }
        
        // Check if we're running in Netlify environment
        const isNetlify = window.location.hostname.includes('netlify.app');
        const apiPath = isNetlify ? "/.netlify/functions/api/register" : "/api/register";
        
        console.log(`Using API path for registration: ${apiPath} (Netlify: ${isNetlify})`);
        
        const res = await apiRequest("POST", apiPath, credentials);
        console.log("Registration response status:", res.status, res.statusText);
        
        // Check if the response is ok before trying to parse the JSON
        if (!res.ok) {
          // Define user-friendly error messages based on status codes
          let errorMessage = "We're having trouble completing your registration. Please try again in a few moments.";
          
          if (res.status === 400) {
            errorMessage = "There's an issue with your registration information. Please review and try again.";
          } else if (res.status === 409) {
            errorMessage = "This username or email is already registered. Please try a different one or login to your existing account.";
          } else if (res.status === 422) {
            errorMessage = "Some information is missing or incorrect. Please fill in all required fields.";
          } else if (res.status === 429) {
            errorMessage = "Too many registration attempts. Please wait a few minutes before trying again.";
          } else if (res.status >= 500) {
            errorMessage = "Our system is currently experiencing issues. Please try again later or contact support.";
          }
          
          try {
            // Try to parse error as JSON for more specific messages
            const contentType = res.headers.get('content-type');
            console.log("Response content type:", contentType);
            
            if (contentType && contentType.includes('application/json')) {
              const errorData = await res.json();
              console.log("Registration error data:", errorData);
              
              // Use specific error messages if available
              if (errorData.error) {
                if (errorData.error.includes("username")) {
                  errorMessage = "This username is already taken. Please choose a different username.";
                } else if (errorData.error.includes("email")) {
                  errorMessage = "This email address is already registered. Please use a different email or login to your existing account.";
                } else {
                  errorMessage = errorData.error;
                }
              } else if (errorData.message) {
                errorMessage = errorData.message;
              }
            } else {
              // Otherwise get as text
              const errorText = await res.text();
              console.log("Registration error text:", errorText);
              if (errorText && errorText.length < 100) errorMessage = errorText;
            }
          } catch (parseError) {
            console.error("Error parsing registration error response:", parseError);
          }
          
          throw new Error(errorMessage);
        }
        
        try {
          const userData = await res.json();
          console.log("Registration successful, user data:", userData);
          
          // If the response is an object with properties, it's valid
          if (userData && typeof userData === 'object') {
            return userData;
          } else {
            console.error("Invalid registration response format:", userData);
            throw new Error("Server returned an invalid response format. Please try again.");
          }
        } catch (jsonError) {
          console.error("Error parsing registration success response:", jsonError);
          throw new Error("Unable to process the server response. Please try again or contact support.");
        }
      } catch (error) {
        console.error("Registration request error:", error);
        
        // Handle network errors
        if (error instanceof TypeError && error.message.includes('Network')) {
          throw new Error("Unable to connect to our services. Please check your internet connection and try again.");
        }
        
        // Handle timeout errors
        if (error.name === 'AbortError' || (error.message && error.message.includes('timeout'))) {
          throw new Error("The registration request timed out. Please try again when you have a stronger internet connection.");
        }
        
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      // Update cache using the same path that was used to fetch user data
      const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify.app');
      const userApiPath = isNetlify ? "/.netlify/functions/api/user" : "/api/user";
      
      queryClient.setQueryData([userApiPath], user);
      toast({
        title: "Account created!",
        description: `Welcome to MoodSync, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Registration mutation error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Check if we're running in Netlify environment
      const isNetlify = window.location.hostname.includes('netlify.app');
      const apiPath = isNetlify ? "/.netlify/functions/api/logout" : "/api/logout";
      
      console.log(`Using API path for logout: ${apiPath} (Netlify: ${isNetlify})`);
      
      await apiRequest("POST", apiPath);
    },
    onSuccess: () => {
      // Update cache using the same path that was used to fetch user data
      const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify.app');
      const userApiPath = isNetlify ? "/.netlify/functions/api/user" : "/api/user";
      
      queryClient.setQueryData([userApiPath], null);
      toast({
        title: "Logged out",
        description: "You've been successfully logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
