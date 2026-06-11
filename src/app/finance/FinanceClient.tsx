"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "../../lib/auth-client";

interface TBRow { code: string; name: string; debit: string; credit: string }
const num = (s: string) => Number(String(s).replace(/,/g, ""));

export function FinanceClient() {
  const [rows, setRows] = useState<TBRow[]>([]);
  useEffect(() => {
    fetch(`${API_BASE}/meta/reports/finance-trial-balance/run`)
      .then((r) => r.json()).then((d) => setRows(d.rows ?? [])).catch(() => setRows([]));
  }, []);

  const totalDebit = rows.reduce((s, r) => s + num(r.debit), 0);
  const totalCredit = rows.reduce((s, r) => s + num(r.credit), 0);
  const balanced = totalDebit === totalCredit;
  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total debits", value: fmt(totalDebit) },
          { label: "Total credits", value: fmt(totalCredit) },
          { label: "Ledger status", value: balanced ? "Balanced ✓" : "Unbalanced ✗" }
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{k.label}</div>
            <div className={`mt-1 text-2xl font-black ${k.label === "Ledger status" ? (balanced ? "text-green-700" : "text-red-700") : "text-gray-900"}`}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3 text-lg font-bold text-gray-800">Trial balance</div>
        <table className="w-full text-sm">
          <thead className="bg-orange-500 text-left text-white">
            <tr><th className="px-4 py-3 font-semibold">Account</th><th className="px-4 py-3 font-semibold">Name</th><th className="px-4 py-3 text-right font-semibold">Debit</th><th className="px-4 py-3 text-right font-semibold">Credit</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.code} className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-700">{r.code}</td>
                <td className="px-4 py-3 text-gray-700">{r.name}</td>
                <td className="px-4 py-3 text-right text-gray-700">{r.debit}</td>
                <td className="px-4 py-3 text-right text-gray-700">{r.credit}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 font-bold text-gray-900">
              <td className="px-4 py-3" colSpan={2}>Totals</td>
              <td className="px-4 py-3 text-right">{fmt(totalDebit)}</td>
              <td className="px-4 py-3 text-right">{fmt(totalCredit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="text-xs text-gray-500">
        Journal entries are append-only and immutable; corrections are reversing entries only. The preparer of an entry
        can never be its approver (separation of duties).
      </p>
    </div>
  );
}
