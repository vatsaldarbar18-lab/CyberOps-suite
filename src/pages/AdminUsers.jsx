import { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatePanel from "../components/StatePanel.jsx";
import { getAdminUsers } from "../services/api.js";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });

  useEffect(() => {
    let mounted = true;
    getAdminUsers()
      .then((response) => {
        if (!mounted) return;
        setUsers(response.records || []);
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
      <PageHeader eyebrow="Admin" title="User management" description="Non-sensitive account information for registered CyberOps Suite users." />
      <GlassCard>
        {status.loading && <StatePanel type="loading" title="Loading users" message="Fetching registered user profiles." />}
        {status.error && <StatePanel type="error" title="Unable to load users" message={status.error} />}
        {!status.loading && !status.error && users.length === 0 && <StatePanel type="empty" title="No users found" message="Registered users will appear here." />}
        {users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-zinc-500">
                <tr className="border-b border-zinc-800">
                  <th className="py-3">Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-zinc-900 text-zinc-300">
                    <td className="py-3 text-white">{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.status}</td>
                    <td>{new Date(user.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
