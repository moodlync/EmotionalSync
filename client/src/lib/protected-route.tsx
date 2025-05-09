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

  // Store the current path in localStorage when it changes
  useEffect(() => {
    if (location && location !== "/auth") {
      localStorage.setItem("moodlync_last_path", location);
    }
  }, [location]);

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

  // Immediately redirect if no user is logged in
  if (!user) {
    console.log("No user found, redirecting to auth page");
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // If user exists, render the component
  return <Route path={path} component={Component} />;
}
