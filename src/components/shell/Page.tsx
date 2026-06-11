import type { ReactNode } from "react";
import { getActiveBrand } from "../../lib/branding";
import { AppShell } from "./AppShell";

// Server wrapper: fetches the active brand and renders the app shell with a
// page header. Keeps each route page tiny.
export async function Page({
  title, subtitle, children
}: { title: string; subtitle?: string; children: ReactNode }) {
  const brand = await getActiveBrand();
  return (
    <AppShell appName={brand.appName}>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm font-medium text-gray-600">{subtitle}</p>}
      </div>
      {children}
    </AppShell>
  );
}

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}>
      {title && <h3 className="mb-3 text-lg font-bold text-gray-800">{title}</h3>}
      {children}
    </div>
  );
}
