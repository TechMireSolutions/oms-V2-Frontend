"use client";

import { useEffect, useState } from "react";
import { Boxes, Wrench, Plus } from "lucide-react";
import { AppShell } from "../../components/shell/AppShell";
import { API_BASE, authHeaders } from "../../lib/auth-client";
import { useAuthGuard } from "../../lib/use-auth-guard";

const field =
  "rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500/20";

export default function OperationsPage() {
  const ready = useAuthGuard();
  const [assets, setAssets] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [tag, setTag] = useState(""); const [name, setName] = useState("");
  const [tTitle, setTTitle] = useState(""); const [msg, setMsg] = useState<string | null>(null);

  const load = () => {
    fetch(`${API_BASE}/assets/inventory`, { headers: authHeaders() }).then((r) => r.ok ? r.json() : []).then(setAssets).catch(() => {});
    fetch(`${API_BASE}/maintenance/tickets`, { headers: authHeaders() }).then((r) => r.ok ? r.json() : []).then(setTickets).catch(() => {});
  };
  useEffect(() => { if (ready) load(); }, [ready]);

  async function addAsset(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    const r = await fetch(`${API_BASE}/assets`, { method: "POST", headers: { "content-type": "application/json", ...authHeaders() }, body: JSON.stringify({ tag, name }) });
    setMsg(r.ok ? "Asset added" : `Failed (${r.status})`); if (r.ok) { setTag(""); setName(""); load(); }
  }
  async function addTicket(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    const r = await fetch(`${API_BASE}/maintenance/ticket`, { method: "POST", headers: { "content-type": "application/json", ...authHeaders() }, body: JSON.stringify({ title: tTitle }) });
    setMsg(r.ok ? "Ticket created" : `Failed (${r.status})`); if (r.ok) { setTTitle(""); load(); }
  }

  return (
    <AppShell appName="OMS">
      <h1 className="text-2xl font-black text-gray-900 md:text-3xl">Operations &amp; Assets</h1>
      <p className="mb-6 mt-1 text-sm font-medium text-gray-600">Hardware allocation, facilities, maintenance.</p>
      {msg && <p className="mb-4 rounded-xl border border-blue-300 bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700">{msg}</p>}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-800"><Boxes className="h-6 w-6 text-orange-500" /> Asset inventory</h3>
          <form onSubmit={addAsset} className="mb-4 flex gap-2">
            <input className={field} placeholder="Tag" value={tag} onChange={(e) => setTag(e.target.value)} required />
            <input className={field} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <button className="flex items-center gap-1 rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition-all duration-200 hover:bg-orange-600 active:scale-[0.98]"><Plus className="h-4 w-4" /> Add</button>
          </form>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-orange-500 text-left text-white"><tr><th className="px-4 py-3 font-semibold">Tag</th><th className="px-4 py-3 font-semibold">Name</th><th className="px-4 py-3 font-semibold">Status</th></tr></thead>
              <tbody>{assets.map((a) => <tr key={a.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50"><td className="px-4 py-3 font-mono text-xs text-gray-700">{a.tag}</td><td className="px-4 py-3 text-gray-700">{a.name}</td><td className="px-4 py-3 text-gray-700">{a.status}</td></tr>)}
                {!assets.length && <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">No assets</td></tr>}</tbody>
            </table>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-800"><Wrench className="h-6 w-6 text-orange-500" /> Maintenance tickets</h3>
          <form onSubmit={addTicket} className="mb-4 flex gap-2">
            <input className={`${field} flex-1`} placeholder="Issue title" value={tTitle} onChange={(e) => setTTitle(e.target.value)} required />
            <button className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition-all duration-200 hover:bg-orange-600 active:scale-[0.98]">Report</button>
          </form>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-orange-500 text-left text-white"><tr><th className="px-4 py-3 font-semibold">Ref</th><th className="px-4 py-3 font-semibold">Title</th><th className="px-4 py-3 font-semibold">Status</th></tr></thead>
              <tbody>{tickets.map((t) => <tr key={t.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50"><td className="px-4 py-3 font-mono text-xs text-gray-700">{t.reference}</td><td className="px-4 py-3 text-gray-700">{t.title}</td><td className="px-4 py-3 text-gray-700">{t.status}</td></tr>)}
                {!tickets.length && <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">No tickets</td></tr>}</tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
