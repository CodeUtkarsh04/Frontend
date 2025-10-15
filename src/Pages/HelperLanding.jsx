import React from "react";

import StepToStartHelper from "../Components/StepToStartHelper";
import AvailableTasks from "../Components/AvailableTasks";
import Footer from "../Components/Footer";
import HelperSignUpCard from "../Components/HelperSignupCard";
import WhyHelperGrid from "../Components/WhyHelperGrid";
import HelperLandingNavbar from "../Components/HelperLandingNavbar";
import HelperHeroSection from "../Components/HelperHeroSection";

function App() {
  return (
    <>
        

      {/* Hero Section */}
    <div
        className="
          min-h-screen 
          bg-gradient-to-r from-blue-700 to-blue-400 
          flex items-center justify-center 
          px-4 sm:px-6 
          pt-24 sm:pt-28 md:pt-32 lg:pt-24 
          pb-10 mt-0
        "
      >
        <div className="max-w-7xl w-full flex flex-col md:flex-row items-center justify-between gap-15">
          
          {/* Left Side Content */}
          <div className="text-white w-full md:max-w-lg text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Earn flexibly, help your community
            </h1>
            <p className="mb-6 text-base sm:text-lg md:text-lg text-gray-100">
              Turn your free time into earnings by completing tasks for people in your neighborhood.
              Be your own boss, work when you want.
            </p>

            {/* Stats */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center md:justify-start gap-10 mb-6">
              <div className="text-center sm:text-left">
                <p className="text-2xl sm:text-3xl md:text-3xl font-bold text-blue-300">Up to ₹800/day</p>
                <p className="text-sm sm:text-sm">Potential earnings</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-300">25+</p>
                <p className="text-xs sm:text-sm text-center">Task Categories</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-300">FAST</p>
                <p className="text-xs sm:text-sm text-center">Payments</p>
              </div>
            </div>

            
           
          </div>

          {/* Right Side Card */}
          <div className="w-full max-w-sm sm:max-w-md md:max-w-md lg:max-w-lg mt-8 md:mt-10 flex justify-end mr-2 md:mr-6 lg:mr-0">
            <HelperSignUpCard />
          </div>
          <HelperLandingNavbar/>
        </div>
      </div>
      <WhyHelperGrid />
      <StepToStartHelper />
      
    
 
    
    </>
  );
}

export default App;
