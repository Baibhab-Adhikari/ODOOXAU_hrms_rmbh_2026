import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  allowedRoles?: ("employee" | "hr_officer")[];
  children?: ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.actor_type as any)) {
    // If logged in but not authorized for this route
    if (user.actor_type === "hr_officer") {
      return <Navigate to="/hr/dashboard" replace />;
    }
    return <Navigate to="/employee/dashboard" replace />;
  }

  return <>{children ? children : <Outlet />}</>;
}
