import { Activity, Cpu, DatabaseZap, LockKeyhole, Radar, ShieldCheck, Siren, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import StatePanel from "../components/StatePanel.jsx";
import { TrafficChart } from "../components/Charts.jsx";
import { activityLogs, devices, loginAttempts, recommendations, threatTimeline, trafficSeries, vulnerabilities } from "../data/mockData.js";
import { getDashboard, getHistory } from "../services/api.js";

const severityClass = {
  Critical: "text-red-300 bg-red-500/10",
  High: "text-red-200 bg-red-500/10",
  Medium: "text-yellow-200 bg-yellow-500/10",
  Low: "text-emerald-200 bg-emerald-500/10",
};

export default function Dashboard() {
  const critical = vulnerabilities.filter((item) => item.severity === "Critical").length;
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });

  useEffect(() => {
    let mounted = true;

    Promise.all([getDashboard(), getHistory()])
      .then(([dashboard, historyResponse]) => {
        if (!mounted) return;
        setSummary(dashboard);
        setHistory(historyResponse.records || []);
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

  const stats = summary?.stats || {
    securityScore: 87,
    activeDevices: devices.filter((device) => device.status !== "Offline").length,
    totalDevices: devices.length,
    threatAlerts: critical + 8,
    vulnerabilitiesFound: vulnerabilities.length,
    firewallStatus: "Protected",
    cpuUsage: 62,
    ramUsage: 74,
    bandwidthUsage: 58,
  };

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Command Overview"
        title="Security operations dashboard"
        description="A safe overview of local analysis activity and clearly labeled sample SOC data for the event demonstration."
      />

      {status.loading && <StatePanel type="loading" title="Loading dashboard" message="Preparing the latest safe demo summary." className="mb-4" />}
      {status.error && <StatePanel type="error" title="Using sample dashboard data" message={status.error} className="mb-4" />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ShieldCheck} label="Security Score" value={`${stats.securityScore}/100`} trend="demo posture index" tone="green" />
        <StatCard icon={Wifi} label="Sample Devices" value={stats.activeDevices} trend={`${stats.totalDevices} assets in dataset`} tone="cyan" />
        <StatCard icon={Siren} label="Review Items" value={stats.threatAlerts} trend="from sample records" tone="red" />
        <StatCard icon={Radar} label="Open Findings" value={stats.vulnerabilitiesFound} trend="safe demo dataset" tone="yellow" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Traffic Overview</h2>
              <p className="text-sm text-zinc-400">Inbound, outbound, and blocked traffic from sample records</p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-200">{stats.firewallStatus}</span>
          </div>
          <TrafficChart data={summary?.trafficSeries || trafficSeries} />
        </GlassCard>
        <GlassCard>
          <h2 className="text-lg font-semibold text-white">Resource Utilization</h2>
          {[
            { label: "CPU Usage", value: stats.cpuUsage, icon: Cpu, color: "bg-blue-400" },
            { label: "RAM Usage", value: stats.ramUsage, icon: DatabaseZap, color: "bg-blue-400" },
            { label: "Bandwidth Usage", value: stats.bandwidthUsage, icon: Activity, color: "bg-emerald-400" },
          ].map((item) => (
            <div key={item.label} className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-zinc-300"><item.icon size={16} />{item.label}</span>
                <span className="text-white">{item.value}%</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-800">
                <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </GlassCard>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <GlassCard>
          <h2 className="text-lg font-semibold text-white">Threat Timeline</h2>
          <div className="mt-4 space-y-3">
            {(summary?.threatTimeline || threatTimeline).slice(0, 7).map((item) => (
              <div key={`${item.time}-${item.event}`} className="flex items-center justify-between rounded-lg bg-zinc-950 p-3">
                <div>
                  <p className="text-sm text-white">{item.event}</p>
                  <p className="text-xs text-zinc-500">{item.time}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs ${severityClass[item.severity]}`}>{item.severity}</span>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <h2 className="text-lg font-semibold text-white">Recent Activities</h2>
          <div className="mt-4 space-y-3">
            {activityLogs.slice(0, 7).map((item) => (
              <div key={item.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                <p className="text-sm text-white">{item.user}</p>
                <p className="text-xs text-zinc-500">{item.action} - {item.time}</p>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <h2 className="text-lg font-semibold text-white">Login Attempts</h2>
          <div className="mt-4 space-y-3">
            {(summary?.loginAttempts || loginAttempts).slice(0, 7).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg bg-zinc-950 p-3">
                <div>
                  <p className="text-sm text-white">{item.account}</p>
                  <p className="text-xs text-zinc-500">{item.location}</p>
                </div>
                <span className={item.result === "Blocked" ? "text-red-300" : "text-emerald-300"}>{item.result}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white"><LockKeyhole size={19} /> Security Recommendations</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {(summary?.recommendations || recommendations).map((item) => (
            <div key={item} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm leading-6 text-zinc-300">{item}</div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="mt-4">
        <h2 className="text-lg font-semibold text-white">Recent Safe Analyses</h2>
        {history.length === 0 ? (
          <StatePanel type="empty" title="No saved analyses yet" message="Run a URL review to add a non-sensitive history item." className="mt-4" />
        ) : (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {history.slice(0, 4).map((item) => (
              <div key={item.id || item.created_at} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm font-medium text-white">{item.summary}</p>
                <p className="mt-1 break-all text-xs text-zinc-500">{item.target}</p>
                <p className="mt-3 text-xs text-zinc-500">{new Date(item.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
