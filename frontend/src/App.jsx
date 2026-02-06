import "./App.css";
import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import Calendar from "./components/Calendar";
import GigWorkersPage from "./components/GigWorkersPage";
import JobPostingForm from "./components/JobPostingForm";
import LandingPage from "./components/LandingPage";
import JobsApplied from "./components/JobsApplied";
import PasswordReset from "./components/PasswordReset";
import PasswordResetInitiation from "./components/PasswordResetInitiation";
import ProfilePage from "./components/ProfilePage";
import Register from "./components/Register";
import RegistrationSuccess from "./components/RegistrationSuccess";
import SignIn from "./components/SignIn";
import VerifyEmailPage from "./components/VerifyEmailPage";
import Dashboard from "./components/Dashboard";
import Notifications from "./components/Notifications";
import JobBoard from "./components/JobBoard";
import JobPosting from "./components/JobPosting";
import Messages from "./components/Messages";
import WorkerBoard from "./components/WorkerBoard";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoutes";
import AccountSelection from "./components/AccountSelection";
import SearchPage from "./components/SearchPage";

import { UserProvider } from "./components/UserContext";
import { WorkerProvider } from "./components/WorkerContext";
import { BusinessProvider } from "./components/BusinessContext";

const App = () => {
  return (
    <UserProvider>
      <WorkerProvider>
        <BusinessProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/account-selection" element={<AccountSelection />} />
              <Route path="/verify/:token" element={<VerifyEmailPage />} />
              <Route path="/initiate-password-reset" element={<PasswordResetInitiation />} />
              <Route path="/verify/password-reset/:uniqueIdentifier" element={<PasswordReset />} />
              <Route path="/registration-success" element={<RegistrationSuccess />} />

              {/* Protected Routes with Layout */}
              <Route element={<Layout />}>
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jobs-applied"
                  element={
                    <ProtectedRoute>
                      <JobsApplied />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-jobs"
                  element={
                    <ProtectedRoute>
                      <JobPosting />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/gig-workers"
                  element={
                    <ProtectedRoute>
                      <GigWorkersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-calendar"
                  element={
                    <ProtectedRoute>
                      <Calendar />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/find-gigs"
                  element={
                    <ProtectedRoute>
                      <JobBoard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/worker-board"
                  element={
                    <ProtectedRoute>
                      <WorkerBoard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/search"
                  element={
                    <ProtectedRoute>
                      <SearchPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </Router>
        </BusinessProvider>
      </WorkerProvider>
    </UserProvider>
  );
};

export default App;