import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const iconMap = {
  loading: Loader2,
  success: CheckCircle2,
  error: AlertCircle,
  empty: AlertCircle,
};

const toneMap = {
  loading: "border-blue-500/20 bg-blue-500/10 text-blue-200",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
  error: "border-red-500/20 bg-red-500/10 text-red-200",
  empty: "border-zinc-700 bg-zinc-900/70 text-zinc-300",
};

export default function StatePanel({ type = "empty", title, message, className = "" }) {
  const Icon = iconMap[type] || AlertCircle;

  return (
    <div className={`rounded-lg border p-4 text-sm ${toneMap[type]} ${className}`} role={type === "error" ? "alert" : "status"}>
      <div className="flex items-start gap-3">
        <Icon className={type === "loading" ? "mt-0.5 animate-spin" : "mt-0.5"} size={18} />
        <div>
          {title && <p className="font-medium">{title}</p>}
          {message && <p className="mt-1 leading-6 opacity-85">{message}</p>}
        </div>
      </div>
    </div>
  );
}
