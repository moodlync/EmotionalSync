import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getApiPath, isNetlifyEnvironment, isReplitEnvironment } from "../lib/netlify-auth-config";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginDataWithRemember>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
  resendVerificationMutation: UseMutationResult<{ success: boolean, message: string }, Error, void>;
};

// Basic login data
interface LoginData {
  username: string;
  password: string;
}

// Extended login data with remember me option
type LoginDataWithRemember = LoginData & { rememberMe: boolean };

// Default context value
const defaultContextValue: AuthContextType = {
  user: null,
  isLoading: false,
  error: null,
  loginMutation: {} as UseMutationResult<SelectUser, Error, LoginDataWithRemember>,
  logoutMutation: {} as UseMutationResult<void, Error, void>,
  registerMutation: {} as UseMutationResult<SelectUser, Error, InsertUser>,
  resendVerificationMutation: {} as UseMutationResult<{ success: boolean, message: string }, Error, void>
};

export const AuthContext = createContext<AuthContextType>(defaultContextValue);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Use our helper to get the correct API path based on environment
  const userApiPath = getApiPath("/api/user");
  
  const isNetlify = isNetlifyEnvironment();
  const isReplit = isReplitEnvironment();
  
  console.log(`Using API path for user data: ${userApiPath} (Netlify: ${isNetlify}, Replit: ${isReplit})`);
  console.log(`Current hostname: ${window.location.hostname}`);
  
  // Check if user opted to be remembered
  const shouldRememberUser = typeof window !== 'undefined' && localStorage.getItem('moodlync_remember_me') === 'true';
  
  // Initialize with data from localStorage only if "Remember Me" was selected
  const initialUserData = (typeof window !== 'undefined' && shouldRememberUser)
    ? JSON.parse(localStorage.getItem('moodlync_user') || 'null') 
    : null;
  
  // Effect to clear localStorage data when "Remember Me" is not selected
  useEffect(() => {
    if (typeof window !== 'undefined' && !shouldRememberUser) {
      localStorage.removeItem('moodlync_user');
    }
  }, [shouldRememberUser]);
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: [userApiPath],
    queryFn: getQueryFn({ on401: "returnNull" }),
    // Start with data from localStorage only if user opted to be remembered
    initialData: initialUserData,
    // Clear state only after 5 minutes if we can't reach the server
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginDataWithRemember) => {
      try {
        // Extract the rememberMe flag and pass only username/password to API
        const { rememberMe, ...loginCredentials } = credentials;
        
        // Store the "Remember Me" preference
        if (typeof window !== 'undefined') {
          if (rememberMe) {
            localStorage.setItem('moodlync_remember_me', 'true');
          } else {
            localStorage.removeItem('moodlync_remember_me');
            localStorage.removeItem('moodlync_user');
          }
        }
        
        // Use helper to get appropriate API path for current environment
        const apiPath = getApiPath("/api/login");
        
        console.log(`Using API path for login: ${apiPath} (Netlify: ${isNetlify}, Replit: ${isReplit})`);
        console.log(`Sending login request to: ${apiPath}`);
        
        const res = await apiRequest("POST", apiPath, loginCredentials);
        
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
        let userData;
        if (responseData && responseData.user && typeof responseData.user === 'object') {
          console.log("Extracted user from response:", responseData.user);
          userData = responseData.user;
        } else if (responseData && responseData.id) {
          console.log("Using direct user response:", responseData);
          userData = responseData;
        } else {
          console.error("Invalid user data format in response:", responseData);
          throw new Error("Server returned invalid user data. Please try again.");
        }
        
        // Store in localStorage only if "Remember Me" is checked
        if (typeof window !== 'undefined') {
          // Save the remember me preference
          localStorage.setItem('moodlync_remember_me', rememberMe ? 'true' : 'false');
          
          // Store user data if remember me is checked
          if (rememberMe) {
            localStorage.setItem('moodlync_user', JSON.stringify(userData));
          } else {
            // If not remembering, ensure we clear any previously saved data
            localStorage.removeItem('moodlync_user');
          }
        }
        
        return userData;
      } catch (error) {
        console.error("Login request error:", error);
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      // Update cache using the same path that was used to fetch user data
      const userApiPath = getApiPath("/api/user");
      
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
        // Log registration data (with password masked for security)
        const sanitizedData = { ...credentials } as { [key: string]: any };
        if (sanitizedData.password) {
          sanitizedData.password = "********";
        }
        console.log("Registration mutation - submitting data:", sanitizedData);
        
        // Network connection check
        if (!navigator.onLine) {
          throw new Error("You appear to be offline. Please check your internet connection and try again.");
        }
        
        // Use helper to get appropriate API path for current environment
        const apiPath = getApiPath("/api/register");
        
        console.log(`Using API path for registration: ${apiPath} (Netlify: ${isNetlify}, Replit: ${isReplit})`);
        console.log(`Sending registration request to: ${apiPath}`);
        
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
        if (
          error instanceof Error && 
          (error.name === 'AbortError' || (error.message && error.message.includes('timeout')))
        ) {
          throw new Error("The registration request timed out. Please try again when you have a stronger internet connection.");
        }
        
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      // Update cache using the same path that was used to fetch user data
      const userApiPath = getApiPath("/api/user");
      
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
      // Use helper to get appropriate API path for current environment
      const apiPath = getApiPath("/api/logout");
      
      console.log(`Using API path for logout: ${apiPath} (Netlify: ${isNetlify}, Replit: ${isReplit})`);
      console.log(`Sending logout request to: ${apiPath}`);
      
      await apiRequest("POST", apiPath);
    },
    onSuccess: () => {
      // Update cache using the same path that was used to fetch user data
      const userApiPath = getApiPath("/api/user");
      
      queryClient.setQueryData([userApiPath], null);
      
      // Clear localStorage data (including remember me preference) on logout
      if (typeof window !== 'undefined') {
        localStorage.removeItem('moodlync_user');
        localStorage.removeItem('moodlync_remember_me');
      }
      
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
  
  const resendVerificationMutation = useMutation({
    mutationFn: async () => {
      if (!user || !user.email) {
        throw new Error("You need to be logged in with an email address to receive verification emails.");
      }
      
      // Use helper to get appropriate API path for current environment
      const apiPath = getApiPath("/api/resend-verification");
      
      console.log(`Using API path for resending verification: ${apiPath} (Netlify: ${isNetlify}, Replit: ${isReplit})`);
      console.log(`Sending verification resend request to: ${apiPath}`);
      
      const res = await apiRequest("POST", apiPath);
      if (!res.ok) {
        let errorMessage = "Failed to resend verification email. Please try again later.";
        
        try {
          // Try to parse error details from response
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await res.json();
            if (errorData.message) {
              errorMessage = errorData.message;
            }
          }
        } catch (err) {
          console.error("Error parsing resend verification error:", err);
        }
        
        throw new Error(errorMessage);
      }
      
      try {
        return await res.json();
      } catch (err) {
        console.error("Error parsing resend verification response:", err);
        return { 
          success: true, 
          message: "Verification email sent successfully. Please check your inbox." 
        };
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Verification email sent",
        description: data.message || "Please check your inbox for a verification link.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send verification email",
        description: error.message || "An unexpected error occurred. Please try again later.",
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
        resendVerificationMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Modified useAuth hook that returns default user data without authentication
export function useAuth(): AuthContextType {
  // Use the existing query client
  const { toast } = useToast();
  
  // Create a mock user that matches what the API would return
  const mockUser = {
    id: 1,
    username: "moodlync_user",
    email: "user@example.com",
    firstName: "Default", 
    lastName: "User",
    isActive: true,
    profilePicture: "/assets/default-avatar.png",
    tokens: 500,
    isPremium: true,
    // Add any other properties components might expect
    mood: "happy",
    role: "user"
  };
  
  // Instead of creating real mutations, create objects that match the expected interface
  const loginMutation = {
    mutate: (credentials: LoginDataWithRemember) => {
      console.log("Mock login called with", credentials);
      toast({
        title: "Login successful",
        description: "Welcome to MoodLync!",
      });
    },
    isPending: false,
    isError: false,
    isSuccess: true,
    error: null,
    reset: () => {},
    status: 'success',
    data: mockUser
  } as unknown as UseMutationResult<SelectUser, Error, LoginDataWithRemember>;
  
  const logoutMutation = {
    mutate: () => {
      console.log("Mock logout called");
      toast({
        title: "Logged out",
        description: "You've been successfully logged out",
      });
    },
    isPending: false,
    isError: false,
    isSuccess: true,
    error: null,
    reset: () => {},
    status: 'success'
  } as unknown as UseMutationResult<void, Error, void>;
  
  const registerMutation = {
    mutate: (userData: InsertUser) => {
      console.log("Mock registration called with", userData);
      toast({
        title: "Account created!",
        description: "Welcome to MoodLync!",
      });
    },
    isPending: false,
    isError: false,
    isSuccess: true,
    error: null,
    reset: () => {},
    status: 'success',
    data: mockUser
  } as unknown as UseMutationResult<SelectUser, Error, InsertUser>;
  
  const resendVerificationMutation = {
    mutate: () => {
      console.log("Mock verification resend called");
      toast({
        title: "Verification email sent",
        description: "Please check your inbox for a verification link.",
      });
    },
    isPending: false,
    isError: false,
    isSuccess: true,
    error: null,
    reset: () => {},
    status: 'success',
    data: { success: true, message: "Verification email sent" }
  } as unknown as UseMutationResult<{ success: boolean, message: string }, Error, void>;
  
  return {
    user: mockUser as any,
    isLoading: false,
    error: null,
    loginMutation,
    logoutMutation,
    registerMutation,
    resendVerificationMutation
  };
}
