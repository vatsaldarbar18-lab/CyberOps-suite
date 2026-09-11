import { Download, FileSpreadsheet, Printer } from "lucide-react";
import { useState } from "react";
import GlassCard from "../components/GlassCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatePanel from "../components/StatePanel.jsx";
import { DeviceBar, RiskPie, TrendChart } from "../components/Charts.jsx";
import { devices, monthlyRisk, riskDistribution, vulnerabilities } from "../data/mockData.js";

const reportLibrary = [
  "Monthly Security Posture",
  "Weekly SOC Operations",
  "Threat Summary",
  "Asset Risk Register",
  "Training Progress Review",
];

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState(reportLibrary[0]);
  const [exportStatus, setExportStatus] = useState("");
  const deviceStats = ["Healthy", "Watching", "Contained", "Offline"].map((status) => ({
    status,
    count: devices.filter((device) => device.status === status).length,
  }));

  const exportCsv = async () => {
    setExportStatus("Preparing CSV export...");
    try {
      const response = await fetch("/api/reports/security-summary.csv");
      if (!response.ok) throw new Error("Unable to export CSV. Please try again.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "cyberops-security-summary.csv";
      link.click();
      URL.revokeObjectURL(url);
      setExportStatus("CSV export completed.");
    } catch (error) {
      setExportStatus(error.message);
    }
  };

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Reporting"
        title="Security reports"
        description="Charts and report previews built from local demo data and safe analysis history."
        action={
          <div className="flex flex-wrap gap-2">
            <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white hover:bg-zinc-900">
              <Printer size={17} />
              Print PDF
            </button>
            <button onClick={exportCsv} className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-100 hover:bg-blue-500/15">
              <FileSpreadsheet size={17} />
              Export CSV
            </button>
          </div>
        }
      />

      {exportStatus && <StatePanel type={exportStatus.includes("Unable") ? "error" : "success"} title="Report export" message={exportStatus} className="mb-4" />}

      <div className="grid gap-4 xl:grid-cols-2">
        <GlassCard>
          <h2 className="text-lg font-semibold text-white">Threat Trends</h2>
          <TrendChart data={monthlyRisk} />
        </GlassCard>
        <GlassCard>
          <h2 className="text-lg font-semibold text-white">Risk Distribution</h2>
          <RiskPie data={riskDistribution} />
          <div className="grid grid-cols-2 gap-2">
            {riskDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-300">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}: {item.value}
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <h2 className="text-lg font-semibold text-white">Device Statistics</h2>
          <DeviceBar data={deviceStats} />
        </GlassCard>
        <GlassCard>
          <h2 className="text-lg font-semibold text-white">Report Library</h2>
          <div className="mt-4 space-y-3">
            {reportLibrary.map((report, index) => (
              <div key={report} className="flex items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <div>
                  <p className="font-medium text-white">{report}</p>
                  <p className="text-xs text-zinc-500">{`Generated from safe demo data - 2026-06-${24 + index}`}</p>
                </div>
                <button onClick={() => setSelectedReport(report)} className="rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm text-white hover:bg-zinc-900">Open</button>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{selectedReport}</h2>
            <p className="mt-1 text-sm text-zinc-400">Preview generated from local sample records and non-sensitive analysis metadata.</p>
          </div>
          <span className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-sm text-zinc-300">{vulnerabilities.length} demo findings</span>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-sm text-zinc-500">Critical</p>
            <p className="mt-2 text-3xl font-semibold text-red-200">{riskDistribution.find((item) => item.name === "Critical")?.value || 0}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-sm text-zinc-500">Tracked Devices</p>
            <p className="mt-2 text-3xl font-semibold text-white">{devices.length}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-sm text-zinc-500">Accepted Risk</p>
            <p className="mt-2 text-3xl font-semibold text-yellow-200">{vulnerabilities.filter((item) => item.status === "Accepted Risk").length}</p>
          </div>
        </div>
        <a href="/api/reports/security-summary.csv" download className="mt-5 inline-flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200">
          <Download size={16} />
          Download security summary CSV
        </a>
      </GlassCard>
    </div>
  );
}
