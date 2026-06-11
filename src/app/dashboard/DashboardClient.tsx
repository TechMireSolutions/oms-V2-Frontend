"use client";

import { useEffect, useState } from "react";
import type { DashboardLayout } from "@oms/dto";
import { SessionProvider } from "../../lib/session";
import { DashboardGrid } from "../../components/dashboard/DashboardGrid";

// Sample dashboard composed from WidgetDefinitions + grid coordinates.
const LAYOUT: DashboardLayout = {
  id: "00000000-0000-0000-0000-000000000001",
  key: "superadmin-home",
  name: "SuperAdmin Home",
  cols: 12,
  rowHeight: 90,
  items: [
    { widgetId: "kpi-apps", x: 0, y: 0, w: 3, h: 1 },
    { widgetId: "kpi-welfare", x: 3, y: 0, w: 3, h: 1 },
    { widgetId: "kpi-pending", x: 6, y: 0, w: 3, h: 1 },
    { widgetId: "gauge-budget", x: 9, y: 0, w: 3, h: 2 },
    { widgetId: "chart-welfare", x: 0, y: 1, w: 6, h: 3 },
    { widgetId: "chart-apps", x: 6, y: 2, w: 6, h: 2 },
    { widgetId: "table-welfare", x: 0, y: 4, w: 12, h: 3 }
  ],
  widgets: [
    { id: "kpi-apps", type: "kpi", title: "Applications", reportKey: "applications-kpi", refreshSeconds: 60, options: { valueKey: "count" } },
    { id: "kpi-welfare", type: "kpi", title: "Welfare approvals (qtr)", reportKey: "welfare-approvals-kpi", refreshSeconds: 60, options: { valueKey: "count" } },
    { id: "kpi-pending", type: "kpi", title: "Journals pending", reportKey: "pending-journals-kpi", refreshSeconds: 30, options: { valueKey: "count" } },
    { id: "gauge-budget", type: "gauge", title: "AI budget used", reportKey: "budget-gauge", refreshSeconds: 60, options: { valueKey: "value", unit: "%", max: 100, thresholds: [{ at: 80, color: "#dc2626" }, { at: 60, color: "#d97706" }] } },
    { id: "chart-welfare", type: "bar", title: "Welfare spend by month", reportKey: "welfare-spend-by-month", refreshSeconds: 120, options: { xKey: "month", series: [{ key: "subsidy", label: "Subsidy" }, { key: "waiver", label: "Fee waiver", color: "#0ea5e9" }] } },
    { id: "chart-apps", type: "line", title: "Applications trend", reportKey: "applications-trend", refreshSeconds: 120, options: { xKey: "week", series: [{ key: "received", label: "Received" }, { key: "accepted", label: "Accepted", color: "#16a34a" }] } },
    { id: "table-welfare", type: "table", title: "Recent welfare requests", reportKey: "recent-welfare", refreshSeconds: 60, options: { columns: [{ key: "reference", label: "Reference" }, { key: "type", label: "Type" }, { key: "status", label: "Status" }, { key: "amount", label: "Amount (₱)" }] } }
  ]
};

export function DashboardClient() {
  // Demo session — SuperAdmin sees every widget. In production these come from
  // the verified JWT claims; the backend re-checks every request (zero-trust).
  const [width, setWidth] = useState(1080);
  useEffect(() => {
    const update = () => setWidth(Math.min(1320, (document.getElementById("grid-wrap")?.clientWidth ?? 1080)));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <SessionProvider userId="demo" roles={["super_admin"]} permissions={[]}>
      <div id="grid-wrap">
        <DashboardGrid layout={LAYOUT} width={width} />
      </div>
    </SessionProvider>
  );
}
