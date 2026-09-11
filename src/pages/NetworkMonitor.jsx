import { Filter, Search, Shield, Wifi } from "lucide-react";
import { useMemo, useState } from "react";
import GlassCard from "../components/GlassCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import StatePanel from "../components/StatePanel.jsx";
import { TrafficChart } from "../components/Charts.jsx";
import { devices, trafficSeries } from "../data/mockData.js";

export default function NetworkMonitor() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const filtered = useMemo(
    () => devices.filter((device) => (status === "All" || device.status === status) && `${device.name} ${device.ip} ${device.os}`.toLowerCase().includes(query.toLowerCase())),
    [query, status],
  );

  return (
    <div className="page-enter">
      <PageHeader eyebrow="Sample Inventory" title="SOC device dataset" description="Explore sample endpoint status, throughput, firewall posture, and review signals without touching real infrastructure." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Wifi} label="Sample Devices" value={devices.length} trend="100+ demo assets" />
        <StatCard icon={Shield} label="Firewall Posture" value="Protected" trend="9 sample reviews" tone="green" />
        <StatCard icon={Wifi} label="Upload Average" value="418 Mbps" trend="sample aggregate" tone="blue" />
        <StatCard icon={Wifi} label="Download Speed" value="1.8 Gbps" trend="stable" tone="cyan" />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <GlassCard className="xl:col-span-2">
          <h2 className="text-lg font-semibold text-white">Sample Traffic</h2>
          <TrafficChart data={trafficSeries} />
        </GlassCard>
        <GlassCard>
          <h2 className="text-lg font-semibold text-white">Active Connections</h2>
          <div className="mt-4 space-y-3">
            {devices.slice(0, 8).map((device) => (
              <div key={device.id} className="flex items-center justify-between rounded-lg bg-zinc-950 p-3">
                <div>
                  <p className="text-sm text-white">{device.name}</p>
                  <p className="text-xs text-zinc-500">{device.connections} sample sessions</p>
                </div>
                <span className="text-sm text-blue-100">{device.firewall}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
      <GlassCard className="mt-4">
        <div className="mb-4 flex flex-col gap-3 md:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={17} />
            <input className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-3 pl-10 pr-4 outline-none focus:border-blue-500" placeholder="Search devices or IP addresses" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <label className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={17} />
            <select className="rounded-lg border border-zinc-800 bg-zinc-950 py-3 pl-10 pr-8 text-white outline-none focus:border-blue-500" value={status} onChange={(event) => setStatus(event.target.value)}>
              {["All", "Healthy", "Watching", "Contained", "Offline"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-zinc-500">
              <tr className="border-b border-zinc-800">
                <th className="py-3">Device</th><th>IP</th><th>Operating System</th><th>Status</th><th>Upload</th><th>Download</th><th>Alerts</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 24).map((device) => (
                <tr key={device.id} className="border-b border-zinc-900 text-zinc-300">
                  <td className="py-3 text-white">{device.name}</td><td>{device.ip}</td><td>{device.os}</td><td>{device.status}</td><td>{device.upload} Mbps</td><td>{device.download} Mbps</td><td>{device.risk > 60 ? "Review" : "None"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <StatePanel type="empty" title="No devices match your filters" message="Try a different status or search term." className="mt-4" />}
      </GlassCard>
    </div>
  );
}
