"use client";

import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, PieChart, Pie,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import type { WidgetDefinition } from "@oms/dto";
import { useSession } from "../../lib/session";
import { useWidgetData } from "../../lib/use-widget-data";
import { AccessDenied, CardShell, WidgetError, WidgetLoading } from "./states";

interface Props {
  widget: WidgetDefinition;
  accessToken?: string;
}

/**
 * Renders a single widget. Permission-gated: if the session lacks the widget's
 * requiredPermission, a graceful Access Denied placeholder is shown for THIS
 * card only — the rest of the grid keeps working. Data is fetched independently
 * and re-fetched on the widget's refresh interval.
 */
export function Widget({ widget, accessToken }: Props) {
  const { can } = useSession();

  // RBAC gate — short-circuit before any data fetch.
  if (!can(widget.requiredPermission)) {
    return <AccessDenied title={widget.title} />;
  }

  // Hooks must run unconditionally after the gate above is resolved, so the
  // data-bound body lives in a child component.
  return <WidgetBody widget={widget} accessToken={accessToken} />;
}

function WidgetBody({ widget, accessToken }: Props) {
  const { data, loading, error } = useWidgetData(widget.reportKey, widget.refreshSeconds, accessToken);
  const o = widget.options;

  if (loading) return <CardShell title={widget.title}><WidgetLoading /></CardShell>;
  // A 403 from the server (defense in depth) also degrades gracefully.
  if (error === "forbidden") return <AccessDenied title={widget.title} />;
  if (error) return <CardShell title={widget.title}><WidgetError message={error} /></CardShell>;

  const rows = data?.rows ?? [];
  const primary = "#f97316"; // orange-500 — single brand color

  const body = () => {
    switch (widget.type) {
      case "kpi": {
        const value = data?.value ?? (o.valueKey ? Number(rows[0]?.[o.valueKey]) : rows.length);
        return (
          <div className="flex h-full flex-col justify-center">
            <span className="text-3xl font-black text-gray-900">
              {Number.isFinite(value) ? value.toLocaleString() : "—"}{o.unit ? ` ${o.unit}` : ""}
            </span>
          </div>
        );
      }
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey={o.xKey} fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              {(o.series ?? []).map((s) => (
                <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color ?? primary} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey={o.xKey} fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              {(o.series ?? []).map((s) => (
                <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color ?? primary} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      case "gauge": {
        const value = data?.value ?? (o.valueKey ? Number(rows[0]?.[o.valueKey]) : 0);
        const max = o.max ?? 100;
        const pct = Math.max(0, Math.min(1, value / max));
        const color = (o.thresholds ?? []).slice().sort((a, b) => b.at - a.at).find((t) => value >= t.at)?.color ?? primary;
        const gaugeData = [{ name: "v", value: pct }, { name: "rest", value: 1 - pct }];
        return (
          <div className="relative h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={gaugeData} dataKey="value" startAngle={180} endAngle={0}
                     innerRadius="60%" outerRadius="90%" paddingAngle={0} cy="80%">
                  <Cell fill={color} />
                  <Cell fill="#eef2f7" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-2xl font-black text-gray-900">
              {Number.isFinite(value) ? value.toLocaleString() : "—"}{o.unit ? ` ${o.unit}` : ""}
            </div>
          </div>
        );
      }
      case "table":
      case "list": {
        const cols = o.columns ?? (rows[0] ? Object.keys(rows[0]).map((k) => ({ key: k, label: k })) : []);
        return (
          <table className="w-full border-collapse overflow-hidden rounded-lg text-sm">
            <thead>
              <tr className="bg-orange-500 text-left text-white">
                {cols.map((c) => <th key={c.key} className="px-4 py-3 font-semibold">{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                  {cols.map((c) => <td key={c.key} className="px-4 py-3 text-gray-700">{String(r[c.key] ?? "")}</td>)}
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={cols.length || 1} className="py-4 text-center text-gray-400">No data</td></tr>}
            </tbody>
          </table>
        );
      }
      default:
        return <p className="text-sm text-gray-500">Unsupported widget type</p>;
    }
  };

  return <CardShell title={widget.title}>{body()}</CardShell>;
}
