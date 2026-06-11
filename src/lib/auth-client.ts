"use client";

// Client-side token store (localStorage). UX convenience only — the backend
// re-validates every request and re-checks permissions (zero-trust).
const KEY = "oms.accessToken";

export function setToken(token: string) {
  try { localStorage.setItem(KEY, token); } catch { /* ignore */ }
}
export function getToken(): string | undefined {
  try { return localStorage.getItem(KEY) ?? undefined; } catch { return undefined; }
}
export function clearToken() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export function authHeaders(): Record<string, string> {
  const t = getToken();
  return t ? { authorization: `Bearer ${t}` } : {};
}

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "/api";
