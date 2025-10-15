import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "../Components/Footer";
import UserDashNavbar from "../Components/UserDashNavbar";

export default function HelperDashLayout() {
  return (
    <>
      <UserDashNavbar />
      <main className="min-h-[70vh]">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}