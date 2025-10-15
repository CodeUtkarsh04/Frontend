import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-700 to-sky-700">
      {/* The Outlet is where LoginPage or SignUpPage will render */}
      <Outlet />
    </div>
  );
};

export default AuthLayout;
