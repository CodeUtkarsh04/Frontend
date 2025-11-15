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
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowed?.length) {
    let role = getRole();
    if (!role) role = decodeRole(token);

    if (!role || !allowed.includes(role)) {
      return <Navigate to="/login" replace />;
    }
  }
  return children;
}
