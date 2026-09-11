import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NetworkMonitor from "./pages/NetworkMonitor.jsx";
import VulnerabilityScanner from "./pages/VulnerabilityScanner.jsx";
import PasswordVault from "./pages/PasswordVault.jsx";
import LinuxLearningCenter from "./pages/LinuxLearningCenter.jsx";
import Reports from "./pages/Reports.jsx";
import Notifications from "./pages/Notifications.jsx";
import Settings from "./pages/Settings.jsx";
import Profile from "./pages/Profile.jsx";
import ScanHistory from "./pages/ScanHistory.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminActivity from "./pages/AdminActivity.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/network" element={<NetworkMonitor />} />
        <Route path="/scanner" element={<VulnerabilityScanner />} />
        <Route path="/vault" element={<PasswordVault />} />
        <Route path="/linux" element={<LinuxLearningCenter />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/history" element={<ScanHistory />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/activity" element={<ProtectedRoute adminOnly><AdminActivity /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
