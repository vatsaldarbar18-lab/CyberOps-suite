import { useEffect, useState } from "react";
import { Clock, ShieldCheck } from "lucide-react";
import GlassCard from "../components/GlassCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatePanel from "../components/StatePanel.jsx";
import { getHistory } from "../services/api.js";

const toneMap = {
  High: "border-red-500/20 bg-red-500/10 text-red-200",
  Medium: "border-yellow-500/20 bg-yellow-500/10 text-yellow-200",
  Low: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
};

export default function ScanHistory() {
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });

  useEffect(() => {
    let mounted = true;
    getHistory()
      .then((response) => {
        if (!mounted) return;
        setRecords(response.records || []);
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
      <PageHeader eyebrow="Personal Records" title="Scan history" description="Only your authenticated account's URL review history is shown here." />
      <GlassCard>
        {status.loading && <StatePanel type="loading" title="Loading history" message="Fetching your saved analysis records." />}
        {status.error && <StatePanel type="error" title="Unable to load history" message={status.error} />}
        {!status.loading && !status.error && records.length === 0 && (
          <StatePanel type="empty" title="No scan data available" message="Run a URL security review to create your first history item." />
        )}
        {records.length > 0 && (
          <div className="grid gap-3 lg:grid-cols-2">
            {records.map((record) => (
              <article key={record.id || record.created_at} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 font-medium text-white"><ShieldCheck size={17} /> {record.summary}</p>
                    <p className="mt-2 break-all text-sm text-zinc-400">{record.target}</p>
                  </div>
                  <span className={`rounded-full border px-2 py-1 text-xs ${toneMap[record.risk_level] || toneMap.Low}`}>{record.risk_level || "Low"}</span>
                </div>
                <p className="mt-4 flex items-center gap-2 text-xs text-zinc-500"><Clock size={14} /> {new Date(record.created_at).toLocaleString()}</p>
              </article>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
