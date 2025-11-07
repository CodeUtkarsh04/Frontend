import React from "react";

const HelperHeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-800 to-sky-500 text-white py-20 mt-16">
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
          Welcome back, <span id="welcome-name">Helper!</span>!
        </h1>
        <p className="text-lg md:text-xl opacity-90 mb-8" id="welcome-message">
          You're doing great! Every act of help counts in our community.
        </p>
      </div>

      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" className="fill-white opacity-10" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>
    </section>
  );
};

export default HelperHeroSection;
