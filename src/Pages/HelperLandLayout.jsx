import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "../Components/Footer";
import HelperLandingNavbar from "../Components/HelperLandingNavbar";

export default function HelperLandLayout() {
  return (
    <>
      <HelperLandingNavbar />
      <main className="min-h-[70vh]">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}