import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import DDLogo from "../assets/DDLogo.jpg";

const HelperDashNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHelperView, setIsHelperView] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsHelperView(location.pathname.startsWith("/helper"));
  }, [location.pathname]);

  const handleSwitch = () => {
    if (isHelperView) {
      navigate("/user/dashboard");
    } else {
      navigate("/helper/dashboard");
    }
  };

  const linkClasses = ({ isActive }) =>
    `transition font-medium ${
      isActive
        ? "text-blue-600 font-semibold"
        : "text-gray-600 hover:text-blue-600"
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 left-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <NavLink to="/" className="flex items-center space-x-2">
            <img src={DDLogo} alt="DailyDone Logo" className="h-10 w-auto" />
          </NavLink>
        </div>

        {/* Center Nav Links */}
        <ul className="hidden md:flex space-x-10 font-medium">
          <li>
            <NavLink to="/helper/dashboard" end className={linkClasses}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/helper/dashboard/tasks"
              className={linkClasses}
            >
              My Tasks
            </NavLink>
          </li>
          <li>
              <NavLink
                to="/helper/dashboard/profile"
                className={linkClasses}
                onClick={() => setIsOpen(false)}
              >
                Profile
              </NavLink>
            </li>
        </ul>

        {/* Right Side - Switch Button ONLY */}
        <div className="hidden md:flex items-center">
          <div
            onClick={handleSwitch}
            className="flex cursor-pointer rounded-full border border-blue-500 overflow-hidden"
          >
            <div
              className={`px-5 py-2 text-sm font-medium transition-all ${
                isHelperView ? "bg-white text-blue-600" : "bg-blue-600 text-white"
              }`}
            >
              Switch to User
            </div>
            <div
              className={`px-5 py-2 text-sm font-medium transition-all ${
                isHelperView ? "bg-blue-600 text-white" : "bg-white text-blue-600"
              }`}
            >
              Switch to Helper
            </div>
          </div>
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
              <NavLink
                to="/helper/dashboard"
                end
                className={linkClasses}
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/helper/dashboard/tasks"
                className={linkClasses}
                onClick={() => setIsOpen(false)}
              >
                My Tasks
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/helper/dashboard/profile"
                className={linkClasses}
                onClick={() => setIsOpen(false)}
              >
                Profile
              </NavLink>
            </li>
          </ul>

          {/* Mobile Switch */}
          <div className="flex pt-4 border-t border-gray-100">
            <div
              onClick={() => {
                handleSwitch();
                setIsOpen(false);
              }}
              className="flex w-full rounded-full border border-blue-500 overflow-hidden text-center"
            >
              <div
                className={`w-1/2 px-4 py-2 text-sm font-medium ${
                  isHelperView ? "bg-white text-blue-600" : "bg-blue-600 text-white"
                }`}
              >
                Switch to User
              </div>
              <div
                className={`w-1/2 px-4 py-2 text-sm font-medium ${
                  isHelperView ? "bg-blue-600 text-white" : "bg-white text-blue-600"
                }`}
              >
                Switch to Helper
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default HelperDashNavbar;
