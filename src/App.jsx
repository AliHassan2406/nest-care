
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { initializeUsers } from "./utils/auth";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import RoleDashboard from "./pages/RoleDashboard";
import Home from "./pages/Home";
import Submit from "./pages/Submit";
import Services from "./pages/Services";
import AdminWorkers from "./pages/AdminWorkers";
import AdminRequests from "./pages/AdminRequests";
import WorkerRequests from "./pages/WorkerRequests";
import Dashboard from "./pages/Dashboard";

export default function App() {
  useEffect(() => {
    // Initialize default users on first load
    initializeUsers();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-[#f7f9f6]">
        <Navbar />
        <main className="app-main">
          <Routes>
            {/* Public Routes */}
<Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />

            {/* Protected Routes - All Authenticated Users */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RoleDashboard />
                </ProtectedRoute>
              }
            />

            {/* User Routes */}
            <Route
              path="/submit"
              element={
                <ProtectedRoute allowedRoles={["User"]}>
                  <Submit />
                </ProtectedRoute>
              }
            />

            <Route path="/services" element={<Services />} />

            {/* Worker Routes */}
            <Route
              path="/my-requests"
              element={
                <ProtectedRoute allowedRoles={["Worker"]}>
                  <WorkerRequests />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin-workers"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminWorkers />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin-requests"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminRequests />
                </ProtectedRoute>
              }
            />

            {/* Fallback - Old Dashboard (for backward compatibility) */}
            <Route
              path="/requests"
              element={
                <ProtectedRoute allowedRoles={["User"]}>
                  <Dashboard isAdmin={false} />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
