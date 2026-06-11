"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ReportResultSchema, type ReportResult } from "@oms/dto";

const API = process.env.NEXT_PUBLIC_API_BASE ?? "/api";

interface State {
  data: ReportResult | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetches a widget's data independently from its report endpoint and refreshes
 * on an interval. Each widget owns its own polling loop so one slow/failing
 * widget never blocks the rest of the grid. Aborts in flight on unmount/refresh.
 */
export function useWidgetData(
  reportKey: string | undefined,
  refreshSeconds: number,
  accessToken?: string
): State & { reload: () => void } {
  const [state, setState] = useState<State>({ data: null, loading: !!reportKey, error: null });
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    if (!reportKey) { setState({ data: null, loading: false, error: null }); return; }
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(`${API}/meta/reports/${encodeURIComponent(reportKey)}/run`, {
        signal: ac.signal,
        headers: accessToken ? { authorization: `Bearer ${accessToken}` } : {}
      });
      if (res.status === 403) throw new Error("forbidden");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const parsed = ReportResultSchema.parse(await res.json());
      setState({ data: parsed, loading: false, error: null });
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setState({ data: null, loading: false, error: (err as Error).message });
    }
  }, [reportKey, accessToken]);

  useEffect(() => {
    load();
    if (!reportKey) return;
    const id = setInterval(load, refreshSeconds * 1000);
    return () => { clearInterval(id); abortRef.current?.abort(); };
  }, [load, refreshSeconds, reportKey]);

  return { ...state, reload: load };
}
