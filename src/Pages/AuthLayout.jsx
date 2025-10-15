import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-700 to-sky-700 px-4 md:px-6 lg:px-8">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
