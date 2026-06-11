"use client";

import { useState } from "react";
import { Sparkles, AlertCircle } from "lucide-react";
import { API_BASE, authHeaders } from "../../lib/auth-client";

export function AiClient() {
  const [prompt, setPrompt] = useState("Summarise welfare approvals over ₱10,000 this quarter by location.");
  const [meta, setMeta] = useState<string | null>(null);
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setBusy(true); setErr(null); setOut(""); setMeta(null);
    try {
      const res = await fetch(`${API_BASE}/ai/query`, {
        method: "POST",
        headers: { "content-type": "application/json", ...authHeaders() },
        body: JSON.stringify({ freeText: prompt, outputKind: "answer" })
      });
      if (res.status === 401) throw new Error("Not signed in — sign in first.");
      if (res.status === 403) throw new Error("Missing ai.query permission or quota exhausted.");
      if (!res.body) throw new Error(`Request failed (${res.status})`);

      // Parse the SSE stream of structured chunks.
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const events = buf.split("\n\n");
        buf = events.pop() ?? "";
        for (const ev of events) {
          const line = ev.split("\n").find((l) => l.startsWith("data:"));
          if (!line) continue;
          try {
            const chunk = JSON.parse(line.slice(5).trim());
            if (chunk.type === "meta") setMeta(`${chunk.provider} · ${chunk.model} · ${chunk.classification}`);
            if (chunk.type === "delta") setOut((o) => o + chunk.text);
            if (chunk.type === "error") setErr(chunk.message);
          } catch { /* ignore partial */ }
        }
      }
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid max-w-3xl gap-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <textarea className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500/20"
          rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <div className="mt-3 flex items-center gap-3">
          <button disabled={busy} onClick={run}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition-all duration-200 hover:bg-orange-600 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50">
            <Sparkles className="h-4 w-4" /> {busy ? "Streaming…" : "Ask assistant"}
          </button>
          {meta && <span className="text-xs text-gray-500">Routed via {meta}</span>}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Response (draft)</h3>
          <span className="inline-flex rounded-md border border-yellow-300 bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">human-in-the-loop · not executed</span>
        </div>
        <div className="min-h-[160px] whitespace-pre-wrap text-sm text-gray-700">{out || <span className="text-gray-400">No output yet.</span>}</div>
        {err && <p className="mt-3 flex items-center gap-2 rounded-xl border border-red-300 bg-red-100 px-3 py-2 text-sm font-medium text-red-700"><AlertCircle className="h-4 w-4 shrink-0" /> {err}</p>}
      </div>
      <p className="text-xs text-gray-500">
        Prompts pass a mandatory PII redaction gate; sensitive data is forced to a local model. Hosted providers need an
        API key, or a local Ollama at <code>OLLAMA_BASE_URL</code>. Without one, the stream returns an error — by design.
      </p>
    </div>
  );
}
