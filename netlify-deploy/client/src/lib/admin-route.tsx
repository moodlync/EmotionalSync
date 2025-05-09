import { useEffect, useState } from "react";
import { Route, useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
  path: string;
  component: React.ComponentType<any> | (() => React.JSX.Element);
}

export function AdminRoute({ path, component: Component }: AdminRouteProps) {
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Check for admin session
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        console.log("Checking admin session...");
        // Try to fetch the admin dashboard data - if this succeeds, we're logged in as admin
        const response = await fetch("/api/admin/dashboard");
        
        if (response.ok) {
          const data = await response.json();
          console.log("Admin session valid, got admin user:", data.adminUser);
          setAdminUser(data.adminUser);
        } else {
          console.log("Admin session invalid, redirecting to login");
          // Not authorized as admin, redirect to login
          setLocation("/admin/login");
        }
      } catch (error) {
        console.error("Error checking admin session:", error);
        setLocation("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminSession();
  }, [setLocation]);

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        adminUser && <Component adminUser={adminUser} />
      )}
    </Route>
  );
}