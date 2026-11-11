import React from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
