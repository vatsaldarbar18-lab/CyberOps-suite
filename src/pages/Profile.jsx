import { Mail, Shield, UserRound } from "lucide-react";
import GlassCard from "../components/GlassCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="page-enter">
      <PageHeader eyebrow="Account" title="Profile" description="Your authenticated CyberOps Suite account details." />
      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-zinc-200 p-4 text-zinc-950">
              <UserRound size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">{user.name}</h2>
              <p className="mt-1 text-zinc-400">{user.email}</p>
            </div>
          </div>
          <dl className="mt-6 grid gap-4 md:grid-cols-2">
            <ProfileField icon={Mail} label="Email" value={user.email} />
            <ProfileField icon={Shield} label="Role" value={user.role} />
            <ProfileField label="Status" value={user.status} />
            <ProfileField label="Created" value={new Date(user.created_at).toLocaleString()} />
          </dl>
        </GlassCard>
        <GlassCard>
          <h2 className="text-lg font-semibold text-white">Security Notice</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Role assignment is read from the server-side profile. Changing browser storage, form fields, or URLs cannot grant admin access.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}

function ProfileField({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <p className="flex items-center gap-2 text-sm text-zinc-500">{Icon && <Icon size={16} />} {label}</p>
      <p className="mt-2 break-all text-white">{value || "Not available"}</p>
    </div>
  );
}
