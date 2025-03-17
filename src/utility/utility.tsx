import React from "react";
import { Navigate } from "react-router-dom";

// create protected routes.
interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  // Retrieve the user object from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Check if the user is authenticated and has the required role
  const isAuthenticated = !!user;
  const userRole = user?.role;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // Redirect to login if not authenticated
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />; // Redirect if the user's role is not allowed
  }

  return <>{children}</>;
};
