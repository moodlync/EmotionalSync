import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/admin/login", { username, password });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to login");
      }
      
      const adminUser = await response.json();
      
      // Make sure adminUser.username is defined
      const username = adminUser && adminUser.username ? adminUser.username : "admin";
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${username}!`,
      });
      
      // Use both methods to ensure redirect happens
      setLocation("/admin");
      
      // Force redirect after a short delay in case the above doesn't work
      setTimeout(() => {
        window.location.href = "/admin";
      }, 300);
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-1">Admin Portal</h1>
          <p className="text-gray-500 text-sm">Enter your credentials to login</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-700"
              placeholder="Enter username"
              required
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-700"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Logging in..." : "Log in"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 font-semibold">
            Protected area - Authorized personnel only
          </p>
          <p className="text-xs text-gray-500 mt-1">
            This system is secured and monitored
          </p>
        </div>
      </div>
    </div>
  );
}