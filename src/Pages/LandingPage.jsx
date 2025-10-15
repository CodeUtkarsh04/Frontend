import React from "react";

import RequestTaskCardLanding from "../Components/RequestTaskCardLanding";
import ServicesGrid from "../Components/ServicesGrid";
import HowDDWorks from "../Components/HowDDWorks";


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
        <div className="max-w-7xl w-full flex flex-col md:flex-row items-center justify-between gap-10">
          
          {/* Left Side Content */}
          <div className="text-white w-full md:max-w-lg text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Get things done with <br /> neighbours
            </h1>
            <p className="mb-6 text-base sm:text-lg md:text-xl">
              From grocery runs to pet care, connect with verified helpers in your
              neighborhood for any task, anytime.
            </p>

            {/* Stats */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center md:justify-start gap-6 mb-6">
              <div className="text-center sm:text-left">
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-300">50K+</p>
                <p className="text-xs sm:text-sm">Active helpers</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-300">98%</p>
                <p className="text-xs sm:text-sm">Task completion</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-300">4.9⭐</p>
                <p className="text-xs sm:text-sm">Average rating</p>
              </div>
            </div>

            {/* Feature Badges */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3">
              <span className="bg-blue-500 px-3 py-1 rounded-full text-xs sm:text-sm">
                ✓ Background verified
              </span>
              <span className="bg-blue-500 px-3 py-1 rounded-full text-xs sm:text-sm">
                ✓ Secure payments
              </span>
              <span className="bg-blue-500 px-3 py-1 rounded-full text-xs sm:text-sm">
                ✓ Real-time tracking
              </span>
            </div>
          </div>

          {/* Right Side Card */}
          <div className="w-full max-w-sm sm:max-w-md md:max-w-md lg:max-w-lg mt-8 md:mt-10 flex justify-end mr-2 md:mr-6 lg:mr-0">
            <RequestTaskCardLanding />
          </div>
        </div>
      </div>

      <ServicesGrid />
      <HowDDWorks />
    
 
    
    </>
  );
}

export default App;
