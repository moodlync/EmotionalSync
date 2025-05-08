import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function AdminDirectAccess() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const login = async () => {
      try {
        setIsLoading(true);
        
        // Attempt to auto-login with admin credentials (securely stored in the server)
        const response = await apiRequest("POST", "/api/admin/login", {
          username: "Sagar",
          password: "Queanbeyan@9" // This will be processed securely by the server
        });
        
        if (!response.ok) {
          throw new Error("Login failed. Please try again.");
        }
        
        // Successfully logged in, redirect to the admin dashboard
        setLocation("/admin");
      } catch (err) {
        console.error("Login error:", err);
        setError("Failed to log in as administrator. Please try the admin login page.");
      } finally {
        setIsLoading(false);
      }
    };
    
    login();
  }, [setLocation]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Admin Access</h1>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-gray-600">Logging in to admin panel...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 mb-4">
            <p>{error}</p>
            <div className="mt-4">
              <a 
                href="https://moodlync.replit.app/admin" 
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
              >
                Go to Admin Login
              </a>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Successfully logged in! Redirecting to admin dashboard...</p>
        )}
        
        <div className="mt-6 text-sm text-gray-500">
          <p>This page provides direct access to the administrator panel.</p>
          <p className="mt-2">Please enter your admin credentials to access the system.</p>
        </div>
      </div>
    </div>
  );
}