"use client";

import { useEffect, useState } from "react";
import { FileText, CheckCircle2 } from "lucide-react";
import { AppShell } from "../../components/shell/AppShell";
import { API_BASE, authHeaders } from "../../lib/auth-client";
import { useAuthGuard } from "../../lib/use-auth-guard";

const field =
  "w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500/20";

export default function PolicyPage() {
  const ready = useAuthGuard();
  const [active, setActive] = useState<any[]>([]);
  const [key, setKey] = useState("code-of-conduct");
  const [title, setTitle] = useState("Code of Conduct");
  const [body, setBody] = useState("All staff must act with integrity…");
  const [msg, setMsg] = useState<string | null>(null);

  const load = () => fetch(`${API_BASE}/policies/active`, { headers: authHeaders() }).then((r) => r.ok ? r.json() : []).then(setActive).catch(() => {});
  useEffect(() => { if (ready) load(); }, [ready]);

  async function publish(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    const d = await fetch(`${API_BASE}/policies/draft`, { method: "POST", headers: { "content-type": "application/json", ...authHeaders() }, body: JSON.stringify({ key, title, body }) });
    if (!d.ok) { setMsg(`Draft failed (${d.status})`); return; }
    const ver = await d.json();
    const p = await fetch(`${API_BASE}/policies/${ver.id}/publish`, { method: "POST", headers: authHeaders() });
    setMsg(p.ok ? `Published v${ver.version}` : `Publish failed (${p.status})`); load();
  }
  async function ack(id: string) {
    const r = await fetch(`${API_BASE}/policies/${id}/acknowledge`, { method: "POST", headers: authHeaders() });
    setMsg(r.ok ? "Acknowledged" : r.status === 409 ? "Already acknowledged" : `Failed (${r.status})`); load();
  }

  return (
    <AppShell appName="OMS">
      <h1 className="text-2xl font-black text-gray-900 md:text-3xl">Policy &amp; Compliance</h1>
      <p className="mb-6 mt-1 text-sm font-medium text-gray-600">Versioned policies with publish lifecycle and acknowledgement tracking.</p>
      {msg && <p className="mb-4 rounded-xl border border-blue-300 bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700">{msg}</p>}
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={publish} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-800"><FileText className="h-6 w-6 text-orange-500" /> Draft &amp; publish</h3>
          <div className="space-y-3">
            <input className={field} value={key} onChange={(e) => setKey(e.target.value)} placeholder="key" />
            <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="title" />
            <textarea className={field} rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
            <button className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition-all duration-200 hover:bg-orange-600 active:scale-[0.98]">Publish new version</button>
          </div>
        </form>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-bold text-gray-800">Active policies</h3>
          <div className="space-y-3">
            {active.map((v) => (
              <div key={v.id} className="rounded-xl border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div><div className="text-sm font-medium text-gray-800">{v.policy?.title}</div><div className="text-xs text-gray-500">v{v.version} · {v.status}</div></div>
                  <button onClick={() => ack(v.id)} className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-all duration-200 hover:bg-gray-200"><CheckCircle2 className="h-4 w-4" /> Acknowledge</button>
                </div>
              </div>
            ))}
            {!active.length && <p className="py-4 text-center text-sm text-gray-400">No published policies</p>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
