"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import {
  Plus, Pencil, Trash2, Search, ChevronUp, ChevronDown, ArrowUpDown, X,
  AlertTriangle, ExternalLink, Eye, Download, Upload, FileSpreadsheet, FileText, MoreVertical
} from "lucide-react";
import { AppShell } from "../../components/shell/AppShell";
import { API_BASE, authHeaders, getToken } from "../../lib/auth-client";
import { useAuthGuard } from "../../lib/use-auth-guard";

// ─── Types ─────────────────────────────────────────────────────────────
interface Project {
  id: number;
  project_name: string;
  website_link: string | null;
  ojt_name: string | null;
  framework: string | null;
  lead_name: string | null;
  project_given_date: string | null;
  start_date: string | null;
  end_date: string | null;
  deadline: string | null;
  status: string;
}

type FormState = Omit<Project, "id">;

const EMPTY_FORM: FormState = {
  project_name: "", website_link: "", ojt_name: "", framework: "", lead_name: "",
  project_given_date: "", start_date: "", end_date: "", deadline: "", status: "Not Started"
};

const STATUSES = ["Not Started", "In Progress", "Completed", "On Hold", "Incomplete"] as const;

const ENDPOINT = `${API_BASE}/project-tracker`;
const todayStr = () => new Date().toISOString().slice(0, 10);

// ─── Auto status logic (per spec) ──────────────────────────────────────
// end_date set → Completed; deadline passed without end_date → Incomplete;
// manual "Completed" without end_date is invalid → revert to "In Progress".
function autoStatus(f: FormState): string {
  if (f.end_date) return "Completed";
  if (f.deadline && f.deadline < todayStr()) return "Incomplete";
  if (f.status === "Completed" && !f.end_date) return "In Progress";
  return f.status || "Not Started";
}

const statusBadge: Record<string, string> = {
  Completed: "bg-green-100 text-green-700 border-green-300",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-300",
  "Not Started": "bg-gray-100 text-gray-600 border-gray-300",
  "On Hold": "bg-yellow-100 text-yellow-700 border-yellow-300",
  Incomplete: "bg-red-100 text-red-700 border-red-300"
};

function rowClass(status: string): string {
  if (status === "Incomplete") return "bg-red-50 hover:bg-red-100";
  if (status === "Completed") return "bg-green-50 hover:bg-green-100";
  return "hover:bg-gray-50";
}

// ─── Admin detection from JWT roles claim ──────────────────────────────
function useIsAdmin(): boolean {
  const [admin, setAdmin] = useState(false);
  useEffect(() => {
    try {
      const t = getToken();
      if (!t) return;
      const payload = JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      const roles: string[] = payload.roles ?? [];
      setAdmin(roles.includes("super_admin") || roles.includes("admin"));
    } catch { /* view-only */ }
  }, []);
  return admin;
}

// ─── Lenient column mapping for Excel import ───────────────────────────
const ALIASES: Record<keyof FormState, string[]> = {
  project_name: ["projectname", "project", "name", "title"],
  website_link: ["websitelink", "website", "link", "url", "site"],
  ojt_name: ["ojtname", "ojt", "intern", "developer", "assignee"],
  framework: ["framework", "tech", "stack", "technology"],
  lead_name: ["leadname", "lead", "teamlead", "manager"],
  project_given_date: ["projectgivendate", "givendate", "assigneddate", "dategiven", "given"],
  start_date: ["startdate", "start", "begin", "started"],
  end_date: ["enddate", "end", "completiondate", "finished"],
  deadline: ["deadline", "due", "duedate", "target"],
  status: ["status", "state", "progress"]
};
const norm = (s: unknown) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");

function mapRow(raw: Record<string, unknown>): Partial<FormState> {
  const out: Record<string, unknown> = {};
  const entries = Object.entries(raw);
  (Object.keys(ALIASES) as (keyof FormState)[]).forEach((field) => {
    const aliases = ALIASES[field];
    const hit = entries.find(([k]) => {
      const nk = norm(k);
      return nk === norm(field) || aliases.includes(nk);
    });
    if (hit && hit[1] != null && hit[1] !== "") out[field] = hit[1];
  });
  return out as Partial<FormState>;
}

// ═══════════════════════════════════════════════════════════════════════
export default function ProjectTrackerPage() {
  const ready = useAuthGuard();
  const isAdmin = useIsAdmin();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Project>("project_name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    fetch(ENDPOINT, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : { projects: [] }))
      .then((d) => setProjects(d.projects ?? []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { if (ready) load(); }, [ready]);

  // ── Search + sort ──
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = projects;
    if (q) {
      list = list.filter((p) =>
        [p.project_name, p.ojt_name, p.lead_name, p.framework]
          .some((v) => (v ?? "").toLowerCase().includes(q))
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const av = (a[sortKey] ?? "") as string | number;
      const bv = (b[sortKey] ?? "") as string | number;
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [projects, search, sortKey, sortDir]);

  const toggleSort = (key: keyof Project) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  // ── Modal ──
  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({
      project_name: p.project_name ?? "", website_link: p.website_link ?? "", ojt_name: p.ojt_name ?? "",
      framework: p.framework ?? "", lead_name: p.lead_name ?? "", project_given_date: p.project_given_date ?? "",
      start_date: p.start_date ?? "", end_date: p.end_date ?? "", deadline: p.deadline ?? "", status: p.status ?? "Not Started"
    });
    setModalOpen(true);
  };

  // Update a field, then re-derive status whenever dates/status change.
  const setField = (key: keyof FormState, value: string) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "end_date" || key === "deadline" || key === "status") {
        next.status = autoStatus(next);
      }
      return next;
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.project_name.trim()) { setMsg("Project name is required"); return; }
    setSaving(true); setMsg(null);
    const payload = { ...form, status: autoStatus(form) };
    try {
      const url = editing ? `${ENDPOINT}/${editing.id}` : ENDPOINT;
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, {
        method, headers: { "content-type": "application/json", ...authHeaders() }, body: JSON.stringify(payload)
      });
      if (!r.ok) throw new Error(`Save failed (${r.status})`);
      setModalOpen(false);
      setMsg(editing ? "Project updated" : "Project created");
      load();
    } catch (err) { setMsg((err as Error).message); }
    finally { setSaving(false); }
  };

  const remove = async (p: Project) => {
    if (!confirm(`Delete project "${p.project_name}"?`)) return;
    const r = await fetch(`${ENDPOINT}/${p.id}`, { method: "DELETE", headers: authHeaders() });
    setMsg(r.ok ? "Project deleted" : `Delete failed (${r.status})`);
    load();
  };

  // ── Export Excel ──
  const exportExcel = () => {
    setMenuOpen(false);
    const rows = projects.map((p) => ({
      "Project Name": p.project_name, "Website": p.website_link ?? "", "OJT Name": p.ojt_name ?? "",
      Framework: p.framework ?? "", "Lead Name": p.lead_name ?? "", "Given Date": p.project_given_date ?? "",
      "Start Date": p.start_date ?? "", "End Date": p.end_date ?? "", Deadline: p.deadline ?? "", Status: p.status
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Projects");
    XLSX.writeFile(wb, "project-tracker.xlsx");
  };

  // ── Export PDF (landscape A4, orange header) ──
  const exportPdf = async () => {
    setMenuOpen(false);
    const { pdf, Document, Page, View, Text, StyleSheet } = await import("@react-pdf/renderer");
    const s = StyleSheet.create({
      page: { padding: 24, fontSize: 8 },
      title: { fontSize: 16, marginBottom: 12, color: "#ea580c", fontWeight: 700 },
      row: { flexDirection: "row" },
      headRow: { flexDirection: "row", backgroundColor: "#f97316" },
      cell: { padding: 4, borderWidth: 0.5, borderColor: "#e5e7eb", flexGrow: 1, flexBasis: 0 },
      headCell: { padding: 4, color: "#ffffff", fontWeight: 700, flexGrow: 1, flexBasis: 0 }
    });
    const cols: { key: keyof Project; label: string }[] = [
      { key: "project_name", label: "Project" }, { key: "ojt_name", label: "OJT" },
      { key: "framework", label: "Framework" }, { key: "lead_name", label: "Lead" },
      { key: "project_given_date", label: "Given" }, { key: "start_date", label: "Start" },
      { key: "end_date", label: "End" }, { key: "deadline", label: "Deadline" }, { key: "status", label: "Status" }
    ];
    const doc = (
      <Document>
        <Page size="A4" orientation="landscape" style={s.page}>
          <Text style={s.title}>Project Progress Tracker</Text>
          <View style={s.headRow}>
            {cols.map((c) => <Text key={c.key} style={s.headCell}>{c.label}</Text>)}
          </View>
          {projects.map((p) => (
            <View key={p.id} style={s.row} wrap={false}>
              {cols.map((c) => <Text key={c.key} style={s.cell}>{String(p[c.key] ?? "")}</Text>)}
            </View>
          ))}
        </Page>
      </Document>
    );
    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "project-tracker.pdf"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Import Excel ──
  const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
      const projectsPayload = raw.map(mapRow).filter((r) => r.project_name);
      if (!projectsPayload.length) { setMsg("No valid rows found in file"); return; }
      const r = await fetch(`${ENDPOINT}/bulk-import`, {
        method: "POST", headers: { "content-type": "application/json", ...authHeaders() },
        body: JSON.stringify({ projects: projectsPayload })
      });
      const d = await r.json().catch(() => ({}));
      setMsg(d.message ?? (r.ok ? "Imported" : `Import failed (${r.status})`));
      load();
    } catch { setMsg("Failed to parse the Excel file"); }
  };

  // ── Sortable header cell ──
  const Th = ({ k, label }: { k: keyof Project; label: string }) => (
    <th className="cursor-pointer select-none px-4 py-3 text-left font-semibold" onClick={() => toggleSort(k)}>
      <span className="inline-flex items-center gap-1">
        {label}
        {sortKey === k
          ? (sortDir === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)
          : <ArrowUpDown className="h-3 w-3 opacity-50" />}
      </span>
    </th>
  );

  const inputCls =
    "w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500/20";

  return (
    <AppShell appName="OMS">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-gray-900 md:text-3xl">
            Project Progress Tracker
            {!isAdmin && (
              <span className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                <Eye className="h-3.5 w-3.5" /> View Only
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-600">Track OJT projects, leads, deadlines and delivery status.</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button onClick={openAdd} className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition-all duration-200 hover:bg-orange-600 active:scale-[0.98]">
              <Plus className="h-4 w-4" /> Add Project
            </button>
          )}
          <div className="relative">
            <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 active:scale-[0.98]">
              <MoreVertical className="h-4 w-4 text-orange-500" /> Export / Import
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
                  >
                    <button onClick={exportExcel} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 transition-all duration-200 hover:bg-gray-50">
                      <FileSpreadsheet className="h-4 w-4 text-green-600" /> Export to Excel
                    </button>
                    <button onClick={exportPdf} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 transition-all duration-200 hover:bg-gray-50">
                      <FileText className="h-4 w-4 text-red-600" /> Export to PDF
                    </button>
                    {isAdmin && (
                      <button onClick={() => { setMenuOpen(false); fileRef.current?.click(); }} className="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-2.5 text-left text-sm text-gray-700 transition-all duration-200 hover:bg-gray-50">
                        <Upload className="h-4 w-4 text-orange-500" /> Import from Excel
                      </button>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onImportFile} />
        </div>
      </div>

      {msg && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-blue-300 bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
          <span>{msg}</span>
          <button onClick={() => setMsg(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by project, OJT, lead, framework…"
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500/20"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[1100px] text-sm">
          <thead className="bg-orange-500 text-white">
            <tr>
              <Th k="project_name" label="Project" />
              <th className="px-4 py-3 text-left font-semibold">Website</th>
              <Th k="ojt_name" label="OJT" />
              <Th k="framework" label="Framework" />
              <Th k="lead_name" label="Lead" />
              <Th k="project_given_date" label="Given" />
              <Th k="start_date" label="Start" />
              <Th k="end_date" label="End" />
              <Th k="deadline" label="Deadline" />
              <Th k="status" label="Status" />
              {isAdmin && <th className="px-4 py-3 text-left font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={isAdmin ? 11 : 10} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>}
            {!loading && visible.map((p) => (
              <tr key={p.id} className={`border-b border-gray-100 transition-colors ${rowClass(p.status)}`}>
                <td className="px-4 py-3 font-medium text-gray-800">
                  <span className="inline-flex items-center gap-1.5">
                    {p.status === "Incomplete" && <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />}
                    {p.project_name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {p.website_link
                    ? <a href={p.website_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-orange-600 hover:text-orange-700"><ExternalLink className="h-3.5 w-3.5" /> Link</a>
                    : <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-700">{p.ojt_name || "—"}</td>
                <td className="px-4 py-3 text-gray-700">{p.framework || "—"}</td>
                <td className="px-4 py-3 text-gray-700">{p.lead_name || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{p.project_given_date || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{p.start_date || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{p.end_date || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{p.deadline || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${statusBadge[p.status] ?? statusBadge["Not Started"]}`}>{p.status}</span>
                </td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(p)} className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 transition-all duration-200 hover:bg-orange-100 hover:text-orange-600" title="Edit"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => remove(p)} className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 transition-all duration-200 hover:bg-red-100 hover:text-red-600" title="Delete"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {!loading && !visible.length && (
              <tr><td colSpan={isAdmin ? 11 : 10} className="px-4 py-8 text-center text-gray-400">No projects found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">{editing ? "Edit Project" : "Add Project"}</h2>
                <button onClick={() => setModalOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={save} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700 sm:col-span-2">
                  Project Name <span className="text-red-600">*</span>
                  <input className={inputCls} value={form.project_name} onChange={(e) => setField("project_name", e.target.value)} required />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700 sm:col-span-2">
                  Website Link
                  <input className={inputCls} type="url" placeholder="https://…" value={form.website_link ?? ""} onChange={(e) => setField("website_link", e.target.value)} />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                  OJT Name
                  <input className={inputCls} value={form.ojt_name ?? ""} onChange={(e) => setField("ojt_name", e.target.value)} />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                  Framework
                  <input className={inputCls} value={form.framework ?? ""} onChange={(e) => setField("framework", e.target.value)} />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                  Lead Name
                  <input className={inputCls} value={form.lead_name ?? ""} onChange={(e) => setField("lead_name", e.target.value)} />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                  Project Given Date
                  <input className={inputCls} type="date" value={form.project_given_date ?? ""} onChange={(e) => setField("project_given_date", e.target.value)} />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                  Start Date
                  <input className={inputCls} type="date" value={form.start_date ?? ""} onChange={(e) => setField("start_date", e.target.value)} />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                  End Date
                  <input className={inputCls} type="date" value={form.end_date ?? ""} onChange={(e) => setField("end_date", e.target.value)} />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                  Deadline
                  <input className={inputCls} type="date" value={form.deadline ?? ""} onChange={(e) => setField("deadline", e.target.value)} />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                  Status
                  <select className={inputCls} value={form.status} onChange={(e) => setField("status", e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <p className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-700 sm:col-span-2">
                  End date set = <b>Completed</b> · Deadline passed without end date = <b>Incomplete</b>
                </p>
                <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={saving} className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition-all duration-200 hover:bg-orange-600 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50">
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
