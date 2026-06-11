"use client";

import { useEffect, useState } from "react";
import { RefreshCw, UserPlus } from "lucide-react";
import { AppShell } from "../../components/shell/AppShell";
import { API_BASE, authHeaders } from "../../lib/auth-client";
import { useAuthGuard } from "../../lib/use-auth-guard";

const statusBadge = (s: string) => {
  const v = String(s).toUpperCase();
  if (v.includes("DONE") || v.includes("SUCCESS") || v.includes("COMPLETE")) return "bg-green-100 text-green-700 border border-green-300";
  if (v.includes("RUN") || v.includes("PROGRESS") || v.includes("PENDING")) return "bg-blue-100 text-blue-700 border border-blue-300";
  if (v.includes("FAIL") || v.includes("ERROR")) return "bg-red-100 text-red-700 border border-red-300";
  return "bg-yellow-100 text-yellow-700 border border-yellow-300";
};

export default function IntegrationsPage() {
  const ready = useAuthGuard();
  const [jobs, setJobs] = useState<any[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const load = () => fetch(`${API_BASE}/integration/jobs`, { headers: authHeaders() }).then((r) => r.ok ? r.json() : []).then(setJobs).catch(() => {});
  useEffect(() => { if (ready) load(); }, [ready]);

  async function run(path: string, payload: unknown) {
    setMsg(null);
    const r = await fetch(`${API_BASE}/integration/${path}`, { method: "POST", headers: { "content-type": "application/json", ...authHeaders() }, body: JSON.stringify(payload) });
    setMsg(r.ok ? "Sync job completed" : `Failed (${r.status})`); load();
  }

  return (
    <AppShell appName="OMS">
      <h1 className="text-2xl font-black text-gray-900 md:text-3xl">Integration Gateway</h1>
      <p className="mb-6 mt-1 text-sm font-medium text-gray-600">Boundary to Moodle LMS — idempotent sync jobs with logging.</p>
      {msg && <p className="mb-4 rounded-xl border border-blue-300 bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700">{msg}</p>}
      <div className="mb-6 flex flex-wrap gap-3">
        <button onClick={() => run("moodle/sync-grades", { items: [1, 2, 3] })} className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition-all duration-200 hover:bg-orange-600 active:scale-[0.98]"><RefreshCw className="h-4 w-4" /> Sync grades</button>
        <button onClick={() => run("moodle/provision-user", { items: [1] })} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 active:scale-[0.98]"><UserPlus className="h-4 w-4 text-orange-500" /> Provision user</button>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3 text-lg font-bold text-gray-800">Sync jobs</div>
        <table className="w-full text-sm">
          <thead className="bg-orange-500 text-left text-white"><tr><th className="px-4 py-3 font-semibold">Kind</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Attempts</th><th className="px-4 py-3 font-semibold">Result</th></tr></thead>
          <tbody>
            {jobs.map((j) => <tr key={j.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50"><td className="px-4 py-3 font-mono text-xs text-gray-700">{j.kind}</td><td className="px-4 py-3"><span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${statusBadge(j.status)}`}>{j.status}</span></td><td className="px-4 py-3 text-gray-700">{j.attempts}</td><td className="px-4 py-3 font-mono text-xs text-gray-500">{j.result}</td></tr>)}
            {!jobs.length && <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">No jobs yet</td></tr>}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
