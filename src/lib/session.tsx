"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

export interface SessionContextValue {
  userId: string | null;
  roles: string[];
  permissions: string[];
  /** True if the session carries every required permission (SuperAdmin bypass). */
  can: (permission?: string) => boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * Client-side session context. Permissions are derived from the JWT claims the
 * server placed in the session. This is a UX gate ONLY — the backend re-checks
 * every request (zero-trust); a tampered client just sees broken widgets, never
 * unauthorized data.
 */
export function SessionProvider({
  children, userId, roles, permissions
}: { children: ReactNode; userId: string | null; roles: string[]; permissions: string[] }) {
  const value = useMemo<SessionContextValue>(() => {
    const set = new Set(permissions);
    const isSuper = roles.includes("super_admin");
    return {
      userId, roles, permissions,
      can: (permission?: string) => !permission || isSuper || set.has(permission)
    };
  }, [userId, roles, permissions]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within <SessionProvider>");
  return ctx;
}
