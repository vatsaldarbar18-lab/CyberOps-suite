import { ArrowUpRight } from "lucide-react";
import GlassCard from "./GlassCard.jsx";

export default function StatCard({ icon: Icon, label, value, trend, tone = "cyan" }) {
  const tones = {
    cyan: "border-blue-500/20 bg-blue-500/10 text-blue-200",
    purple: "border-zinc-700 bg-zinc-800 text-zinc-200",
    green: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
    yellow: "border-yellow-500/20 bg-yellow-500/10 text-yellow-200",
    red: "border-red-500/20 bg-red-500/10 text-red-200",
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-200",
  };

  return (
    <GlassCard className="group overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-400">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{value}</p>
          <p className="mt-3 flex items-center gap-1 text-sm text-zinc-400">
            <ArrowUpRight size={15} />
            {trend}
          </p>
        </div>
        <div className={`rounded-lg border p-3 ${tones[tone]}`}>
          <Icon size={24} />
        </div>
      </div>
    </GlassCard>
  );
}
