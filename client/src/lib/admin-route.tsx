// Modified AdminRoute that no longer requires authentication
import { Route } from "wouter";

interface AdminRouteProps {
  path: string;
  component: React.ComponentType<any> | (() => React.JSX.Element);
}

// This is a modified version of the AdminRoute that no longer requires authentication
// It simply renders the component directly
export function AdminRoute({ path, component: Component }: AdminRouteProps) {
  // Create a default admin user object with necessary properties
  const defaultAdminUser = {
    id: 1,
    username: "admin",
    role: "admin",
    permissions: ["all"],
    isAdmin: true
  };

  return (
    <Route path={path}>
      <Component adminUser={defaultAdminUser} />
    </Route>
  );
}