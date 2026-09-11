import { Navigate, useLocation } from "react-router-dom";
import StatePanel from "./StatePanel.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
        <StatePanel type="loading" title="Checking session" message="Verifying your CyberOps Suite access." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" replace state={{ forbidden: true }} />;
  }

  return children;
}
