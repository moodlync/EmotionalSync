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
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        console.log("Login mutation - submitting data:", { 
          username: credentials.username,
          hasPassword: !!credentials.password
        });
        
        const res = await apiRequest("POST", "/api/login", credentials);
        console.log("Login response status:", res.status, res.statusText);
        
        // Check if the response is ok before trying to parse the JSON
        if (!res.ok) {
          let errorMessage = "Login failed. Please check your username and password.";
          
          try {
            // Try to parse error as JSON
            const contentType = res.headers.get('content-type');
            console.log("Response content type:", contentType);
            
            if (contentType && contentType.includes('application/json')) {
              const errorData = await res.json();
              console.log("Login error data:", errorData);
              errorMessage = errorData.error || errorData.message || errorMessage;
            } else {
              // Otherwise get as text
              const errorText = await res.text();
              console.log("Login error text:", errorText);
              if (errorText) errorMessage = errorText;
            }
          } catch (parseError) {
            console.error("Error parsing login error response:", parseError);
          }
          
          throw new Error(errorMessage);
        }
        
        // Parse the successful response
        const data = await res.json();
        console.log("Login successful, received user data");
        return data;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
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
        
        const res = await apiRequest("POST", "/api/register", credentials);
        console.log("Registration response status:", res.status, res.statusText);
        
        // Check if the response is ok before trying to parse the JSON
        if (!res.ok) {
          let errorMessage = "Registration failed. Please try again.";
          
          try {
            // Try to parse error as JSON
            const contentType = res.headers.get('content-type');
            console.log("Response content type:", contentType);
            
            if (contentType && contentType.includes('application/json')) {
              const errorData = await res.json();
              console.log("Registration error data:", errorData);
              errorMessage = errorData.error || errorData.message || errorMessage as string;
            } else {
              // Otherwise get as text
              const errorText = await res.text();
              console.log("Registration error text:", errorText);
              if (errorText) errorMessage = errorText;
            }
          } catch (parseError) {
            console.error("Error parsing registration error response:", parseError);
          }
          
          throw new Error(errorMessage);
        }
        
        const userData = await res.json();
        console.log("Registration successful, user data:", userData);
        return userData;
      } catch (error) {
        console.error("Registration request error:", error);
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
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
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
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
