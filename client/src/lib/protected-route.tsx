// Modified ProtectedRoute that no longer requires authentication
import { Route } from "wouter";

// This is a modified version of the ProtectedRoute that no longer requires authentication
// It simply renders the component directly without any authentication checks
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.ComponentType<any> | (() => React.JSX.Element);
}) {
  // Simply render the component for any route - no authentication required
  return <Route path={path} component={Component} />;
}
