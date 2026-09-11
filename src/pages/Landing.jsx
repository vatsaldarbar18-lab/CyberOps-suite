import { Link, Navigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, Shield, UserPlus } from "lucide-react";
import GlassCard from "../components/GlassCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Landing() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="signal-grid pointer-events-none fixed inset-0 opacity-30" />
      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-black px-3 py-1 text-sm text-zinc-400">
              <Shield size={16} className="text-blue-200" />
              Safe cybersecurity operations demo
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">CyberOps Suite</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
              A professional SOC dashboard with real authentication, user-owned analysis history, and admin role checks for a secure college event demonstration.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login" className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-100 hover:bg-blue-500/15">
                Sign in
                <ArrowRight size={17} />
              </Link>
              <Link to="/register" className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-5 py-3 text-sm text-white hover:bg-zinc-900">
                Create account
                <UserPlus size={17} />
              </Link>
            </div>
          </section>

          <GlassCard>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white"><LockKeyhole size={19} /> What is protected</h2>
            <div className="mt-5 space-y-4 text-sm leading-6 text-zinc-300">
              <p>Each account gets its own URL analysis history and password audit summaries.</p>
              <p>Admin pages are role-checked by the backend, not by hidden frontend state.</p>
              <p>No real network scanning is performed, and password analyzer inputs are never stored.</p>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
