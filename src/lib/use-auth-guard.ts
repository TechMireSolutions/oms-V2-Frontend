"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "./auth-client";

/**
 * Client auth guard for protected pages. If no token is present, redirect to
 * the login screen instead of firing unauthenticated requests (which 401).
 * Returns `ready` — gate data fetches on it so nothing runs before auth check.
 */
export function useAuthGuard(): boolean {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!getToken()) router.replace("/");
    else setReady(true);
  }, [router]);
  return ready;
}
