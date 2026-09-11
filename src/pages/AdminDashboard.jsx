import { Activity, ShieldAlert, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import StatePanel from "../components/StatePanel.jsx";
import { getAdminStats } from "../services/api.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: "" });

  useEffect(() => {
    let mounted = true;
    getAdminStats()
      .then((response) => {
        if (!mounted) return;
        setStats(response);
        setStatus({ loading: false, error: "" });
      })
      .catch((error) => {
        if (!mounted) return;
        setStatus({ loading: false, error: error.message });
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="page-enter">
      <PageHeader eyebrow="Admin" title="Admin dashboard" description="System-level users and scan statistics from actual application data." />
      {status.loading && <StatePanel type="loading" title="Loading admin dashboard" message="Fetching system statistics." className="mb-4" />}
      {status.error && <StatePanel type="error" title="Unable to load admin dashboard" message={status.error} className="mb-4" />}
      {stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={UsersRound} label="Registered Users" value={stats.totalUsers} trend="database profiles" tone="cyan" />
            <StatCard icon={Activity} label="Total URL Reviews" value={stats.totalScans} trend="saved scan records" tone="blue" />
            <StatCard icon={ShieldAlert} label="High Risk" value={stats.riskCounts.High || 0} trend="from scan history" tone="red" />
            <StatCard icon={ShieldAlert} label="Password Audits" value={stats.passwordAuditCount} trend="derived metadata only" tone="green" />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <GlassCard>
              <h2 className="text-lg font-semibold text-white">Risk Overview</h2>
              {stats.totalScans === 0 ? (
                <StatePanel type="empty" title="No scan data available" message="Run URL reviews from user accounts to populate this panel." className="mt-4" />
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {["Low", "Medium", "High"].map((level) => (
                    <div key={level} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                      <p className="text-sm text-zinc-500">{level}</p>
                      <p className="mt-2 text-3xl font-semibold text-white">{stats.riskCounts[level] || 0}</p>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
            <GlassCard>
              <h2 className="text-lg font-semibold text-white">Recently Registered Users</h2>
              {stats.recentUsers.length === 0 ? (
                <StatePanel type="empty" title="No registered users" message="Create user accounts to populate this panel." className="mt-4" />
              ) : (
                <div className="mt-4 space-y-3">
                  {stats.recentUsers.map((user) => (
                    <div key={user.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="text-sm text-zinc-500">{user.email} - {user.role}</p>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}
