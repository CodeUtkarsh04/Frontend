import React from "react";
import HelperHeroSection from "../Components/HelperHeroSection";
import AvailableTasks from "../Components/AvailableTasks";
import EarningsSummary from "../Components/EarningsSummary"; // adjust path as needed


const HelperDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      {/* 🟦 Hero Section */}
      <HelperHeroSection />

      {/* 📋 Available Tasks + Earnings */}
      <div className="mt-12">
        <AvailableTasks />
      </div>
      <div className="max-w-7xl mx-auto px-6 py-12"> 
        <EarningsSummary/>
      </div>
    </div>
  );
};

export default HelperDashboard;
