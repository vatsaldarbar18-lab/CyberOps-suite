import { Copy, Eye, EyeOff, KeyRound, RefreshCw, ShieldAlert, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import GlassCard from "../components/GlassCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import StatePanel from "../components/StatePanel.jsx";
import { analyzePassword, generatePassword, getPasswordAudits } from "../services/api.js";

const labelTone = {
  Excellent: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
  Strong: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
  Fair: "border-yellow-500/20 bg-yellow-500/10 text-yellow-200",
  Weak: "border-red-500/20 bg-red-500/10 text-red-200",
  "Very weak": "border-red-500/20 bg-red-500/10 text-red-200",
};

export default function PasswordVault() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [generated, setGenerated] = useState("");
  const [audits, setAudits] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });
  const [generatorStatus, setGeneratorStatus] = useState("");

  const weakAuditCount = useMemo(() => audits.filter((audit) => audit.score < 55).length, [audits]);
  const averageScore = useMemo(() => {
    if (!audits.length) return 0;
    return Math.round(audits.reduce((sum, audit) => sum + audit.score, 0) / audits.length);
  }, [audits]);

  const loadAudits = () => {
    getPasswordAudits()
      .then((response) => setAudits(response.records || []))
      .catch(() => setAudits([]));
  };

  useEffect(() => {
    loadAudits();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!password.trim()) {
      setStatus({ loading: false, error: "Enter a password to analyze.", success: "" });
      return;
    }

    setStatus({ loading: true, error: "", success: "" });
    setAnalysis(null);

    try {
      const response = await analyzePassword(password);
      setAnalysis(response.analysis);
      setPassword("");
      setShowPassword(false);
      setStatus({ loading: false, error: "", success: response.privacy });
      loadAudits();
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: "" });
    }
  };

  const runGenerator = async () => {
    setGeneratorStatus("Generating password...");
    try {
      const response = await generatePassword(20);
      setGenerated(response.password);
      setGeneratorStatus("Generated locally by the backend.");
    } catch (error) {
      setGeneratorStatus(error.message);
    }
  };

  const copyGenerated = async () => {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated);
      setGeneratorStatus("Copied to clipboard.");
    } catch {
      setGeneratorStatus("Unable to copy automatically. Select and copy it manually.");
    }
  };

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Password Security"
        title="Password tools"
        description="Analyze password strength without storing the password, generate strong sample passwords, and review non-sensitive audit summaries."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={KeyRound} label="Audit Records" value={audits.length} trend="derived metadata only" tone="cyan" />
        <StatCard icon={ShieldAlert} label="Weak Audits" value={weakAuditCount} trend="score below 55" tone={weakAuditCount ? "yellow" : "green"} />
        <StatCard icon={Sparkles} label="Average Score" value={audits.length ? `${averageScore}/100` : "N/A"} trend="recent analyses" tone="blue" />
        <StatCard icon={Copy} label="Stored Passwords" value="0" trend="raw passwords are never saved" tone="green" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <GlassCard>
          <form onSubmit={submit}>
            <label className="text-sm font-medium text-zinc-200" htmlFor="password-input">Password to analyze</label>
            <div className="mt-2 flex flex-col gap-3 md:flex-row">
              <div className="relative min-w-0 flex-1">
                <input
                  id="password-input"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 pr-12 text-white outline-none placeholder:text-zinc-600 focus:border-blue-500"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter a password for local analysis"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button
                className="flex items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/15"
                disabled={status.loading}
              >
                <ShieldAlert size={17} />
                {status.loading ? "Analyzing..." : "Analyze Strength"}
              </button>
            </div>
          </form>

          <div className="mt-4 space-y-3">
            {status.loading && <StatePanel type="loading" title="Analyzing password" message="The password is processed in memory and is not written to history." />}
            {status.error && <StatePanel type="error" title="Unable to analyze password" message={status.error} />}
            {status.success && <StatePanel type="success" title="Password not stored" message={status.success} />}
          </div>

          {analysis && (
            <div className="mt-5 rounded-lg border border-zinc-800 bg-zinc-950 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Strength score</p>
                  <p className="mt-2 text-4xl font-semibold text-white">{analysis.score}/100</p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-sm ${labelTone[analysis.label]}`}>{analysis.label}</span>
              </div>

              <div className="mt-5 h-2 rounded-full bg-zinc-800">
                <div className="h-2 rounded-full bg-blue-400" style={{ width: `${analysis.score}%` }} />
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-zinc-800 bg-black p-4">
                  <p className="text-sm text-zinc-500">Entropy estimate</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{analysis.entropy} bits</p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-black p-4">
                  <p className="text-sm text-zinc-500">Length</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{analysis.length} characters</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">Warnings</h2>
                  <div className="mt-3 space-y-2">
                    {analysis.warnings.length === 0 ? (
                      <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">No major local policy warnings found.</p>
                    ) : analysis.warnings.map((warning) => (
                      <p key={warning} className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">{warning}</p>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">Recommendations</h2>
                  <div className="mt-3 space-y-2">
                    {analysis.recommendations.map((recommendation) => (
                      <p key={recommendation} className="rounded-lg border border-zinc-800 bg-black p-3 text-sm leading-6 text-zinc-300">{recommendation}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        <div className="space-y-4">
          <GlassCard>
            <h2 className="text-lg font-semibold text-white">Password Generator</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Generates a strong sample password on the backend. Nothing is saved.</p>
            <div className="mt-4 rounded-lg border border-zinc-800 bg-black p-4 font-mono text-sm text-zinc-100">
              {generated || "Generate a password to display it here."}
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button onClick={runGenerator} className="flex items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-100 hover:bg-blue-500/15">
                <RefreshCw size={17} />
                Generate
              </button>
              <button onClick={copyGenerated} disabled={!generated} className="flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white hover:bg-zinc-900">
                <Copy size={17} />
                Copy
              </button>
            </div>
            {generatorStatus && <p className="mt-3 text-sm text-zinc-400">{generatorStatus}</p>}
          </GlassCard>

          <GlassCard>
            <h2 className="text-lg font-semibold text-white">Recent Audit Summaries</h2>
            {audits.length === 0 ? (
              <StatePanel type="empty" title="No audits yet" message="Analyze a password to create a non-sensitive summary." className="mt-4" />
            ) : (
              <div className="mt-4 space-y-3">
                {audits.slice(0, 8).map((audit) => (
                  <div key={audit.id || audit.created_at} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">{audit.score}/100</p>
                      <span className={`rounded-full border px-2 py-1 text-xs ${labelTone[audit.strength_label] || labelTone.Fair}`}>{audit.strength_label}</span>
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">Length {audit.password_length}, warnings {audit.warning_count}</p>
                    <p className="mt-2 text-xs text-zinc-600">{new Date(audit.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
