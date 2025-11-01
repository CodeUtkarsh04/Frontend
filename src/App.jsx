import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import Layout from "./Pages/Layout";
import AuthLayout from "./Pages/AuthLayout.jsx";
import LandingPage from "./Pages/LandingPage.jsx";
import TasksPage from "./Pages/TasksPage.jsx";
import ServicesPage from "./Pages/ServicesPage";
import RequestPage from "./Pages/RequestPage";
import NotFound from "./Pages/NotFound";
import HowDDWorks from "./Components/HowDDWorks.jsx";
import SignUpPage from "./Pages/SignUpPage.jsx";
import LogInPage from "./Pages/LogInPage.jsx";
import AboutDailyDone from "./Pages/AboutDailyDone.jsx";
import HelpPage from "./Pages/HelpPage.jsx";
import UserTasksPage from "./Components/UserTaskPage.jsx";
import HelperLandingPage from "./Pages/HelperLanding.jsx";
import UserDashboard from "./Pages/UserDashboard.jsx";
import WhyHelperGrid from "./Components/WhyHelperGrid.jsx";
import StepToStartHelper from "./Components/StepToStartHelper.jsx";
import HelperLandLayout from "./Pages/HelperLandLayout.jsx";
import HelperDashboard from "./Pages/HelperDashboard.jsx";
import HelperDashLayout from "./Pages/HelperDashLayout.jsx";
import UserDashLayout from "./Pages/UserDashLayout.jsx";
import FaqHelper from "./Pages/FaqHelper.jsx";
import ProtectedRoute from "./Pages/ProtectedRoute";
import CompleteProfile from "./Pages/CompleteProfile.jsx";
import ProfileSetupNotice from "./Pages/ProfileSetupNotice.jsx";
import Profile from "./Pages/Profile.jsx";
import HelperTaskPage from "./Components/HelperTaskPage.jsx";
import CommunityGuidelines from "./Pages/CommunityGuidelines.jsx";
import TermsAndConditions from "./Pages/TermsAndConditions.jsx";
import PrivacyPolicy from "./Pages/PrivacyPolicy.jsx";

export default function App() {
  return (
    <Routes>

      {/* Public layout with Navbar + Footer */}
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="request" element={<RequestPage />} />
        <Route path="how" element={<HowDDWorks />} />
        <Route path="about" element={<AboutDailyDone />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="recent-tasks" element={<UserTasksPage />} />
        <Route path="community-guidelines" element={<CommunityGuidelines />} />
        <Route path="terms" element={<TermsAndConditions />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
  
      </Route>

      {/* Auth (public) — ONLY signup/login under AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={<LogInPage mode="user" />} />
        <Route path="helper/login" element={<LogInPage mode="helper" />} />
         <Route path="signup" element={<SignUpPage mode="user" />} />
        <Route path="login" element={<LogInPage mode="helper" />} />
      </Route>

      {/* Setup flow (JWT required, any role) */}
      <Route
        path="/notice"
        element={
          <ProtectedRoute>
            <ProfileSetupNotice />
          </ProtectedRoute>
        }
      />
      <Route
        path="/setup"
        element={
          <ProtectedRoute>
            <CompleteProfile />
          </ProtectedRoute>
        }
      />

      {/* User dashboard (JWT + role=user) */}
      <Route
        path="/user"
        element={
          <ProtectedRoute allowed={["user","helper"]}>
            <UserDashLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="tasks" element={<UserTasksPage />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Helper landing/info (public) */}
      <Route path="/helper" element={<HelperLandLayout />}>
        <Route index element={<HelperLandingPage />} />
        <Route path="why" element={<WhyHelperGrid />} />
        <Route path="steps" element={<StepToStartHelper />} />
        <Route path="about" element={<AboutDailyDone />} />
        <Route path="faq" element={<FaqHelper />} />
      </Route>

      {/* Helper dashboard (JWT + role=helper) */}
      <Route
        path="/helper/dashboard"
        element={
          <ProtectedRoute allowed={["user","helper"]}>
            <HelperDashLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HelperDashboard />} />
        <Route path="tasks" element={<HelperTaskPage />} />
         <Route path="profile" element={<Profile />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
