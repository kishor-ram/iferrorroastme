import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "testAttendee";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, userData, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    console.log("🚫 Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requiredRole && userData?.role !== requiredRole) {
    console.log(`🚫 Wrong role. Required: ${requiredRole}, Got: ${userData?.role}`);
    
    // Redirect to correct dashboard based on role
    if (userData?.role === "admin") {
      return <Navigate to="/admin" replace />;
    } else if (userData?.role === "testAttendee") {
      return <Navigate to="/dashboard" replace />;
    }
    
    return <Navigate to="/login" replace />;
  }

  // All checks passed
  return <>{children}</>;
};

export default ProtectedRoute;