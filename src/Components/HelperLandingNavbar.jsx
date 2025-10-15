import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import DDLogo from "../assets/DDLogo.jpg";

const HelperLandingNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const linkClasses = ({ isActive }) =>
    isActive
      ? "text-blue-600 font-semibold"
      : "text-gray-600 hover:text-gray-900";

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 left-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo + Brand */}
        <div className="flex items-center space-x-3">
          <NavLink to="/helper" className="flex items-center space-x-2">
            <img src={DDLogo} alt="DailyDone Logo" className="h-10 w-auto" />
          </NavLink>
        </div>

        {/* Center Nav Links (desktop only) */}
        <ul className="hidden md:flex space-x-10 font-medium">
          <li>
            <NavLink to="/helper/why" className={linkClasses}>
              Why DailyDone
            </NavLink>
          </li>
          <li>
            <NavLink to="/helper/steps" className={linkClasses}>
              How it works
            </NavLink>
          </li>
          <li>
            <NavLink to="/helper/about" className={linkClasses}>
              About
            </NavLink>
          </li>
          <li>
            <NavLink to="/helper/faq" className={linkClasses}>
              FAQ
            </NavLink>
          </li>
          
        </ul>

        {/* Right Auth Buttons (desktop only) */}
        <div className="hidden md:flex items-center space-x-4">
          <NavLink
            to="/login"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Log in
          </NavLink>
          <NavLink
            to="/signup"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign up
          </NavLink>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-700 hover:text-gray-900 focus:outline-none text-2xl"
          >
            {isOpen ? "×" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-6 py-4 space-y-4 shadow-lg">
          <ul className="space-y-3 font-medium">
            <li>
              <NavLink to="/helper/why" className={linkClasses}>
                Why DailyDone
              </NavLink>
            </li>
            <li>
              <NavLink to="/helper/steps" className={linkClasses}>
                How it works
              </NavLink>
            </li>
            <li>
              <NavLink to="/helper/about" className={linkClasses}>
                About
              </NavLink>
            </li>
            <li>
              <NavLink to="/helper/faq" className={linkClasses}>
                FAQ
              </NavLink>
            </li>
          </ul>

          <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
            <NavLink
              to="/login"
              className="w-full text-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Log in
            </NavLink>
            <NavLink
              to="/signup"
              className="w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Sign up
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

export default HelperLandingNavbar;
