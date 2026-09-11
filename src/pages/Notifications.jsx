import { Bell, Filter, Info, Search, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import GlassCard from "../components/GlassCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatePanel from "../components/StatePanel.jsx";
import { notifications } from "../data/mockData.js";

const iconMap = { Critical: TriangleAlert, Warning: Bell, Information: Info };
const toneMap = {
  Critical: "border-red-500/20 bg-red-500/10 text-red-100",
  Warning: "border-yellow-500/20 bg-yellow-500/10 text-yellow-100",
  Information: "border-blue-500/20 bg-blue-500/10 text-blue-100",
};

export default function Notifications() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const filtered = useMemo(() => notifications.filter((item) => (type === "All" || item.type === type) && `${item.title} ${item.message}`.toLowerCase().includes(query.toLowerCase())), [query, type]);

  return (
    <div className="page-enter">
      <PageHeader eyebrow="Notification Center" title="Alerts and recent events" description="Search and filter demo alerts, warnings, informational events, and recent application activity." />
      <GlassCard>
        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={17} />
            <input className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-3 pl-10 pr-4 outline-none focus:border-blue-500" placeholder="Search notifications" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <label className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={17} />
            <select className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-3 pl-10 pr-4 outline-none focus:border-blue-500" value={type} onChange={(event) => setType(event.target.value)}>
              {["All", "Critical", "Warning", "Information"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
        {filtered.length === 0 ? (
          <StatePanel type="empty" title="No notifications found" message="Try another search term or notification type." />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {filtered.map((item) => {
              const Icon = iconMap[item.type];
              return (
                <article key={item.id} className={`rounded-lg border p-4 ${toneMap[item.type]}`}>
                  <div className="flex items-start gap-3">
                    <Icon size={20} />
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="mt-1 text-sm opacity-80">{item.message}</p>
                      <p className="mt-3 text-xs opacity-60">{item.type} - {item.time}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
