import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  Gauge,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Moon,
  Network,
  ScanSearch,
  Search,
  Settings,
  Shield,
  User,
  UsersRound,
  Vault,
  X,
  FileBarChart,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const userNavigation = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/network", label: "Network Monitor", icon: Network },
  { to: "/scanner", label: "URL Security Review", icon: ScanSearch },
  { to: "/vault", label: "Password Tools", icon: Vault },
  { to: "/history", label: "Scan History", icon: ListChecks },
  { to: "/linux", label: "Linux Learning Center", icon: BookOpen },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

const adminNavigation = [
  { to: "/admin", label: "Admin Dashboard", icon: Gauge },
  { to: "/admin/users", label: "Users", icon: UsersRound },
  { to: "/admin/activity", label: "System Activity", icon: ListChecks },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highContrast, setHighContrast] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navigation = user?.role === "admin" ? [...userNavigation, ...adminNavigation] : userNavigation;

  const submitSearch = (event) => {
    event.preventDefault();
    const term = search.trim().toLowerCase();
    if (!term) return;
    const match = navigation.find((item) => item.label.toLowerCase().includes(term));
    if (match) {
      navigate(match.to);
      setSearch("");
    }
  };

  const toggleContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    document.documentElement.classList.toggle("high-contrast", next);
  };

  const signOut = async () => {
    setSigningOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="signal-grid pointer-events-none fixed inset-0 opacity-30" />
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-zinc-800 bg-black/90 p-4 backdrop-blur-xl transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-blue-200">
              <Shield size={26} />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">CyberOps Suite</p>
              <p className="text-xs text-zinc-500">Safe SOC demonstration</p>
            </div>
          </div>
          <button className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        <nav className="mt-8 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                  isActive
                    ? "border border-zinc-700 bg-zinc-900 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`
              }
            >
              <item.icon size={19} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="mt-6 flex w-full items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"
          onClick={signOut}
          disabled={signingOut}
        >
          <LogOut size={19} />
          {signingOut ? "Signing out..." : "Logout"}
        </button>

        <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex items-center gap-2 text-blue-200">
            <Gauge size={18} />
            <span className="text-sm font-medium">Demo-safe mode</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-zinc-500">The app never scans networks, stores passwords, or performs offensive actions.</p>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-zinc-800 bg-black/72 px-4 py-3 backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-900 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
              <Menu size={22} />
            </button>
            <form className="relative hidden flex-1 md:block" onSubmit={submitSearch}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500"
                placeholder="Search pages: dashboard, scanner, history..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </form>
            <button className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-zinc-300 hover:text-white" aria-label="Notifications" onClick={() => navigate("/notifications")}>
              <Bell size={19} />
            </button>
            <button className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-zinc-300 hover:text-white" aria-label="Toggle high contrast" aria-pressed={highContrast} onClick={toggleContrast}>
              <Moon size={19} />
            </button>
            <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
              <div className="rounded-full bg-zinc-200 p-2 text-zinc-950">
                <User size={17} />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white">{user?.name || "CyberOps User"}</p>
                <p className="text-xs text-zinc-500">{user?.role === "admin" ? "Administrator" : "User profile"}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="relative z-10 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
