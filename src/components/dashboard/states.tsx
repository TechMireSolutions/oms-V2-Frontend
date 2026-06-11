"use client";

import type { ReactNode } from "react";
import { Lock, AlertTriangle } from "lucide-react";

export function CardShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-2.5 text-sm font-bold text-gray-800">{title}</div>
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  );
}

export function AccessDenied({ title }: { title: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
      <Lock className="h-6 w-6 text-gray-400" />
      <p className="text-sm font-semibold text-gray-600">Access denied</p>
      <p className="text-xs text-gray-500">{title}</p>
    </div>
  );
}

export function WidgetError({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-2 text-sm font-medium text-red-700">
      <AlertTriangle className="h-4 w-4 shrink-0" /> Failed to load: {message}
    </p>
  );
}

export function WidgetLoading() {
  return <div className="h-full w-full animate-pulse rounded-xl bg-gray-100" />;
}
