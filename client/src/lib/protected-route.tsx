import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Redirect, Route, useLocation } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  const [redirectNeeded, setRedirectNeeded] = useState(false);
  const [prevPath, setPrevPath] = useState<string | null>(null);

  // Store the current path in localStorage when it changes
  useEffect(() => {
    if (location && location !== "/auth") {
      localStorage.setItem("moodlync_last_path", location);
    }
  }, [location]);

  // On initial render, restore path from localStorage if coming from a refresh
  useEffect(() => {
    // Wait for auth check to complete
    if (!isLoading) {
      // Only redirect if explicitly determined necessary
      if (!user && !redirectNeeded) {
        // Add a small delay to allow potential cached auth data to load
        const timer = setTimeout(() => {
          if (!user) {
            setRedirectNeeded(true);
          }
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, isLoading, redirectNeeded]);

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // Only redirect if we've explicitly determined that it's necessary
  if (redirectNeeded && !user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // If user exists or we're still in the grace period, render the component
  return <Route path={path} component={Component} />;
}
