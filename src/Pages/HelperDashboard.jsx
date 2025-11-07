// HelperDashboard.jsx
import React from "react";
import HelperHeroSection from "../Components/HelperHeroSection";
import AvailableTasks from "../Components/AvailableTasks";
import EarningsSummaryContainer from "../Components/EarningsSummaryContainer";

const HelperDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      <HelperHeroSection />

      <div className="mt-12">
        <AvailableTasks />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <EarningsSummaryContainer />   {/* ✅ correct */}
      </div>
    </div>
  );
};

export default HelperDashboard;
