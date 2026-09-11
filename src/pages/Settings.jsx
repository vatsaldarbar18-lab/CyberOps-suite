import { BellRing, Globe2, LayoutPanelTop, Palette, Shield, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatePanel from "../components/StatePanel.jsx";
import { getPreferences, savePreferences } from "../services/api.js";

const defaultPreferences = {
  theme: "Dark",
  notifications: true,
  language: "English",
  profileName: "SOC Analyst",
  dashboardDensity: "Balanced",
};

export default function Settings() {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [status, setStatus] = useState({ loading: true, error: "", success: "" });

  useEffect(() => {
    let mounted = true;
    getPreferences()
      .then((response) => {
        if (!mounted) return;
        setPreferences({ ...defaultPreferences, ...(response.preferences || {}) });
        setStatus({ loading: false, error: "", success: "" });
      })
      .catch((error) => {
        if (!mounted) return;
        setStatus({ loading: false, error: error.message, success: "" });
      });

    return () => {
      mounted = false;
    };
  }, []);

  const updatePreference = (key, value) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  const save = async () => {
    setStatus({ loading: true, error: "", success: "" });
    try {
      await savePreferences(preferences);
      setStatus({ loading: false, error: "", success: "Settings saved successfully." });
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: "" });
    }
  };

  const reset = () => {
    setPreferences(defaultPreferences);
    setStatus({ loading: false, error: "", success: "Settings reset locally. Save to persist the defaults." });
  };

  return (
    <div className="page-enter">
      <PageHeader eyebrow="Console Preferences" title="Settings" description="Manage safe application preferences for the event demo." />

      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={save} disabled={status.loading} className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-100 hover:bg-blue-500/15">
          {status.loading ? "Saving..." : "Save Settings"}
        </button>
        <button onClick={reset} className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white hover:bg-zinc-900">Reset Defaults</button>
      </div>

      {status.loading && <StatePanel type="loading" title="Loading settings" message="Preparing preference values." className="mb-4" />}
      {status.error && <StatePanel type="error" title="Settings issue" message={status.error} className="mb-4" />}
      {status.success && <StatePanel type="success" title="Settings updated" message={status.success} className="mb-4" />}

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <SettingHeader icon={Palette} title="Theme" body="The application uses a professional dark theme for readability in presentation rooms." />
          <select className="mt-4 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-500" value={preferences.theme} onChange={(event) => updatePreference("theme", event.target.value)}>
            <option>Dark</option>
            <option>High Contrast</option>
          </select>
        </GlassCard>

        <GlassCard>
          <SettingHeader icon={BellRing} title="Notification Preferences" body="Control whether informational demo notifications should be highlighted." />
          <label className="mt-4 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
            Enable notifications
            <input className="h-5 w-5 accent-blue-500" type="checkbox" checked={preferences.notifications} onChange={(event) => updatePreference("notifications", event.target.checked)} />
          </label>
        </GlassCard>

        <GlassCard>
          <SettingHeader icon={Globe2} title="Language" body="Language preference for static interface labels in the demo." />
          <select className="mt-4 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-500" value={preferences.language} onChange={(event) => updatePreference("language", event.target.value)}>
            <option>English</option>
            <option>Hindi</option>
          </select>
        </GlassCard>

        <GlassCard>
          <SettingHeader icon={UserRound} title="Profile" body="Display name used for the demo analyst profile." />
          <input className="mt-4 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-blue-500" value={preferences.profileName} onChange={(event) => updatePreference("profileName", event.target.value)} maxLength={60} />
        </GlassCard>

        <GlassCard>
          <SettingHeader icon={LayoutPanelTop} title="Dashboard Density" body="Adjust how compact dashboard widgets should be during presentations." />
          <select className="mt-4 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-500" value={preferences.dashboardDensity} onChange={(event) => updatePreference("dashboardDensity", event.target.value)}>
            <option>Comfortable</option>
            <option>Balanced</option>
            <option>Compact</option>
          </select>
        </GlassCard>

        <GlassCard>
          <SettingHeader icon={Shield} title="About" body="CyberOps Suite is a safe cybersecurity operations demonstration for college events." />
          <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm leading-6 text-zinc-300">
            Version 1.1.0. The app does not scan networks, collect credentials, connect to devices, perform exploitation, or store passwords.
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function SettingHeader({ icon: Icon, title, body }) {
  return (
    <div className="flex items-start gap-4">
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-blue-200">
        <Icon size={22} />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{body}</p>
      </div>
    </div>
  );
}
