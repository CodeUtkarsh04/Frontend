import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "../Components/Footer";
import HelperDashNavbar from "../Components/HelperDashNavbar";  

export default function HelperDashLayout() {
  return (
    <>
      <HelperDashNavbar />
      <main className="min-h-[70vh]">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}