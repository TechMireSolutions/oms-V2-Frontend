"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "../../components/shell/AppShell";
import { API_BASE, authHeaders } from "../../lib/auth-client";
import { useAuthGuard } from "../../lib/use-auth-guard";

export default function AuditPage() {
  const ready = useAuthGuard();
  const [events, setEvents] = useState<any[]>([]);
  const [action, setAction] = useState("");

  const load = () => {
    const q = action ? `?action=${encodeURIComponent(action)}` : "";
    fetch(`${API_BASE}/audit/search${q}`, { headers: authHeaders() }).then((r) => r.ok ? r.json() : []).then(setEvents).catch(() => {});
  };
  useEffect(() => { if (ready) load(); }, [ready]);

  return (
    <AppShell appName="OMS">
      <h1 className="text-2xl font-black text-gray-900 md:text-3xl">Audit Trail</h1>
      <p className="mb-6 mt-1 text-sm font-medium text-gray-600">Immutable, append-only event store of every sensitive action.</p>
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500/20" placeholder="filter by action (e.g. policy.publish)" value={action} onChange={(e) => setAction(e.target.value)} />
        </div>
        <button onClick={load} className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition-all duration-200 hover:bg-orange-600 active:scale-[0.98]">Search</button>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-orange-500 text-left text-white"><tr><th className="px-4 py-3 font-semibold">When</th><th className="px-4 py-3 font-semibold">Action</th><th className="px-4 py-3 font-semibold">Entity</th><th className="px-4 py-3 font-semibold">Actor</th></tr></thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(e.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium text-gray-700">{e.action}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-700">{e.entityType}:{String(e.entityId).slice(0, 8)}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-700">{String(e.actorId).slice(0, 8)}</td>
              </tr>
            ))}
            {!events.length && <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">No audit events yet — perform an action (publish a policy, apply, etc.)</td></tr>}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
