import React from "react";
import { Navigate } from "react-router-dom";
import { getToken, getRole } from "../auth";

function decodeRole(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
    return payload?.role || payload?.roles?.[0] || payload?.userType || null;
  } catch {
    return null;
  }
}

export default function ProtectedRoute({ children, allowed }) {
  const token = getToken();
  console.log('ProtectedRoute - Token:', token);
  if (!token) {
    console.log('No token, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (allowed?.length) {
    let role = getRole();
    if (!role) role = decodeRole(token);

    console.log('ProtectedRoute - Role:', role, 'Allowed:', allowed);
    if (!role || !allowed.includes(role)) {
      console.log('Role not allowed, redirecting to login');
      return <Navigate to="/login" replace />;
    }
  }
  console.log('ProtectedRoute - Access granted');
  return children;
}
