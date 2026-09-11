import { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatePanel from "../components/StatePanel.jsx";
import { getAdminActivity } from "../services/api.js";

const toneMap = {
  High: "border-red-500/20 bg-red-500/10 text-red-200",
  Medium: "border-yellow-500/20 bg-yellow-500/10 text-yellow-200",
  Low: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
};

export default function AdminActivity() {
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });

  useEffect(() => {
    let mounted = true;
    getAdminActivity()
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
      <PageHeader eyebrow="Admin" title="System activity" description="Recent saved URL review activity across authenticated accounts." />
      <GlassCard>
        {status.loading && <StatePanel type="loading" title="Loading activity" message="Fetching recent scan records." />}
        {status.error && <StatePanel type="error" title="Unable to load activity" message={status.error} />}
        {!status.loading && !status.error && records.length === 0 && <StatePanel type="empty" title="No scan data available" message="User URL reviews will appear here after they are saved." />}
        {records.length > 0 && (
          <div className="space-y-3">
            {records.map((record) => (
              <article key={record.id || record.created_at} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-medium text-white">{record.summary}</p>
                    <p className="mt-1 break-all text-sm text-zinc-500">{record.target}</p>
                    <p className="mt-2 text-xs text-zinc-600">
                      Account: {record.owner_name}
                      {record.owner_email ? ` (${record.owner_email})` : ""}
                    </p>
                  </div>
                  <span className={`rounded-full border px-2 py-1 text-xs ${toneMap[record.risk_level] || toneMap.Low}`}>{record.risk_level || "Low"}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
