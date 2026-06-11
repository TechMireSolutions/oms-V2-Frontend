"use client";

import { useState } from "react";
import { API_BASE, authHeaders } from "../../lib/auth-client";

const field = "w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500/20";

export function AdmissionsClient() {
  const [form, setForm] = useState({ programKey: "diploma-2026", fullName: "", email: "", householdSize: "", needsSubsidy: "no" });
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null); setResult(null);
    try {
      const body = {
        programKey: form.programKey,
        applicant: { fullName: form.fullName, email: form.email },
        // Dynamic fields flow into custom_data (validated server-side).
        customData: {
          householdSize: form.householdSize ? Number(form.householdSize) : undefined,
          needsSubsidy: form.needsSubsidy
        }
      };
      const res = await fetch(`${API_BASE}/admissions/apply`, {
        method: "POST",
        headers: { "content-type": "application/json", ...authHeaders() },
        body: JSON.stringify(body)
      });
      if (res.status === 401) throw new Error("Not signed in — sign in first.");
      if (!res.ok) throw new Error(`Submit failed (${res.status})`);
      const data = await res.json();
      setResult(`Application created: ${data.reference} (status ${data.status})`);
    } catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid max-w-2xl gap-5">
      <form onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-xs font-medium uppercase tracking-wide text-gray-500">New application</h3>
        <div className="grid grid-cols-2 gap-4">
          <label className="col-span-2 flex flex-col gap-1.5 text-sm font-medium text-gray-700">Program
            <select className={field} value={form.programKey} onChange={(e) => set("programKey", e.target.value)}>
              <option value="diploma-2026">Diploma 2026</option>
              <option value="certificate-2026">Certificate 2026</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">Full name
            <input className={field} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} required />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">Email
            <input type="email" className={field} value={form.email} onChange={(e) => set("email", e.target.value)} required />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">Household size
            <input type="number" className={field} value={form.householdSize} onChange={(e) => set("householdSize", e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">Needs subsidy?
            <select className={field} value={form.needsSubsidy} onChange={(e) => set("needsSubsidy", e.target.value)}>
              <option value="no">No</option><option value="yes">Yes</option>
            </select>
          </label>
        </div>
        <button disabled={busy} className="mt-5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-600 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50">
          {busy ? "Submitting…" : "Submit application"}
        </button>
        {result && <p className="mt-4 rounded-xl border border-green-300 bg-green-100 px-3 py-2 text-sm font-medium text-green-700">{result}</p>}
        {error && <p className="mt-4 rounded-xl border border-red-300 bg-red-100 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}
      </form>
      <p className="text-xs text-slate-400">
        Core fields go to typed columns; <code>householdSize</code> / <code>needsSubsidy</code> are stored in the
        entity&apos;s <code>custom_data</code> JSONB and validated server-side (Part M).
      </p>
    </div>
  );
}
