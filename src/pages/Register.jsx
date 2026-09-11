import { Link, Navigate, useNavigate } from "react-router-dom";
import { Shield, UserPlus } from "lucide-react";
import { useState } from "react";
import GlassCard from "../components/GlassCard.jsx";
import StatePanel from "../components/StatePanel.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const passwordHelp = "Use at least 12 characters with uppercase, lowercase, a number, and a symbol.";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [status, setStatus] = useState({ loading: false, error: "" });

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      setStatus({ loading: false, error: "All fields are required." });
      return;
    }
    if (form.password !== form.confirmPassword) {
      setStatus({ loading: false, error: "Password confirmation does not match." });
      return;
    }

    setStatus({ loading: true, error: "" });
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="signal-grid pointer-events-none fixed inset-0 opacity-30" />
      <main className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
        <Link to="/" className="mb-6 inline-flex items-center gap-3 text-white">
          <span className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-blue-200"><Shield size={24} /></span>
          <span>
            <span className="block text-lg font-semibold">CyberOps Suite</span>
            <span className="block text-xs text-zinc-500">Create secure access</span>
          </span>
        </Link>
        <GlassCard>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Create account</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">New accounts are created with the normal user role. Admin access must be granted separately by a secure setup process.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-zinc-200">
              Name
              <input className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-blue-500" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} maxLength={80} autoComplete="name" />
            </label>
            <label className="block text-sm font-medium text-zinc-200">
              Email
              <input className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-blue-500" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" />
            </label>
            <label className="block text-sm font-medium text-zinc-200">
              Password
              <input className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-blue-500" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete="new-password" />
            </label>
            <label className="block text-sm font-medium text-zinc-200">
              Confirm password
              <input className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-blue-500" type="password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} autoComplete="new-password" />
            </label>
            <p className="text-xs leading-5 text-zinc-500">{passwordHelp}</p>
            {status.error && <StatePanel type="error" title="Unable to create account" message={status.error} />}
            <button disabled={status.loading} className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-100 hover:bg-blue-500/15">
              <UserPlus size={17} />
              {status.loading ? "Creating account..." : "Create account"}
            </button>
          </form>
          <p className="mt-5 text-sm text-zinc-400">
            Already registered? <Link className="text-blue-300 hover:text-blue-200" to="/login">Sign in</Link>
          </p>
        </GlassCard>
      </main>
    </div>
  );
}
