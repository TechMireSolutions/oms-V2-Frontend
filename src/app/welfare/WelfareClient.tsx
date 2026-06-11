"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "../../lib/auth-client";

interface Row { reference: string; type: string; status: string; amount: string }

const badge: Record<string, string> = {
  SUBMITTED: "bg-yellow-100 text-yellow-700 border border-yellow-300",
  RECOMMENDED: "bg-blue-100 text-blue-700 border border-blue-300",
  APPROVED: "bg-green-100 text-green-700 border border-green-300",
  REJECTED: "bg-red-100 text-red-700 border border-red-300"
};

export function WelfareClient() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    fetch(`${API_BASE}/meta/reports/recent-welfare/run`)
      .then((r) => r.json()).then((d) => setRows(d.rows ?? [])).catch(() => setRows([]));
  }, []);

  const steps = [
    { t: "Submit", d: "Applicant/officer files a welfare request (PII encrypted at rest)." },
    { t: "Recommend", d: "Welfare Officer recommends — the maker." },
    { t: "Decide", d: "Welfare Approver approves/rejects — the checker. Cannot be the recommender." },
    { t: "Post", d: "On approval, Finance posts the subsidy/waiver journal entry." }
  ];

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        {steps.map((s, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white shadow-lg shadow-orange-500/30">{i + 1}</div>
            <div className="text-sm font-bold text-gray-800">{s.t}</div>
            <div className="mt-1 text-xs text-gray-500">{s.d}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3 text-lg font-bold text-gray-800">Recent welfare requests</div>
        <table className="w-full text-sm">
          <thead className="bg-orange-500 text-left text-white">
            <tr><th className="px-4 py-3 font-semibold">Reference</th><th className="px-4 py-3 font-semibold">Type</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Amount (₱)</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.reference} className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-700">{r.reference}</td>
                <td className="px-4 py-3 text-gray-700">{r.type}</td>
                <td className="px-4 py-3"><span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${badge[r.status] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>{r.status}</span></td>
                <td className="px-4 py-3 text-gray-700">{r.amount}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">No data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
