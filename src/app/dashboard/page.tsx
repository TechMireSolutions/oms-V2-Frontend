import { getActiveBrand } from "../../lib/branding";
import { AppShell } from "../../components/shell/AppShell";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const brand = await getActiveBrand();
  return (
    <AppShell appName={brand.appName}>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 md:text-3xl">SuperAdmin Dashboard</h1>
        <p className="mt-1 text-sm font-medium text-gray-600">Live KPIs, analytics and recent activity — composed from widget definitions.</p>
      </div>
      <DashboardClient />
    </AppShell>
  );
}
