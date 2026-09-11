import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { LogIn, Shield } from "lucide-react";
import { useState } from "react";
import GlassCard from "../components/GlassCard.jsx";
import StatePanel from "../components/StatePanel.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: "" });

  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;

  const submit = async (event) => {
    event.preventDefault();
    if (!form.email.trim() || !form.password) {
      setStatus({ loading: false, error: "Email and password are required." });
      return;
    }

    setStatus({ loading: true, error: "" });
    try {
      const signedIn = await login(form);
      const target = location.state?.from || (signedIn.role === "admin" ? "/admin" : "/dashboard");
      navigate(target, { replace: true });
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  };

  return (
    <AuthShell title="Sign in" description="Access your CyberOps Suite dashboard and personal analysis history.">
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium text-zinc-200">
          Email
          <input className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-blue-500" type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>
        <label className="block text-sm font-medium text-zinc-200">
          Password
          <input className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-blue-500" type="password" autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        </label>
        {status.error && <StatePanel type="error" title="Unable to sign in" message={status.error} />}
        <button disabled={status.loading} className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-100 hover:bg-blue-500/15">
          <LogIn size={17} />
          {status.loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="mt-5 text-sm text-zinc-400">
        Need an account? <Link className="text-blue-300 hover:text-blue-200" to="/register">Create one</Link>
      </p>
    </AuthShell>
  );
}

function AuthShell({ title, description, children }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="signal-grid pointer-events-none fixed inset-0 opacity-30" />
      <main className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
        <Link to="/" className="mb-6 inline-flex items-center gap-3 text-white">
          <span className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-blue-200"><Shield size={24} /></span>
          <span>
            <span className="block text-lg font-semibold">CyberOps Suite</span>
            <span className="block text-xs text-zinc-500">Secure access</span>
          </span>
        </Link>
        <GlassCard>
          <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
          <div className="mt-6">{children}</div>
        </GlassCard>
      </main>
    </div>
  );
}
