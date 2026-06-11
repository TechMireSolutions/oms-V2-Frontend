import { ActiveBrandSchema, type ActiveBrand, type ThemeTokens } from "@oms/dto";

// Server-side base URL for the API (internal Docker network in prod).
const API_BASE =
  process.env.OMS_API_INTERNAL ?? process.env.NEXT_PUBLIC_API_BASE ?? "http://api-1:4000";

/**
 * Fetch the active brand at runtime (Server Component). Revalidates every 60s
 * so a publish (which also invalidates the backend Redis cache) is reflected
 * across the app within a minute — no redeploy. Falls back to OMS defaults if
 * the API is unreachable, so the app always renders.
 */
export async function getActiveBrand(locationId?: string): Promise<ActiveBrand> {
  try {
    const url = new URL(`${API_BASE}/branding/active`);
    if (locationId) url.searchParams.set("locationId", locationId);
    const res = await fetch(url, { next: { revalidate: 60, tags: ["branding"] } });
    if (!res.ok) throw new Error(`branding ${res.status}`);
    return ActiveBrandSchema.parse(await res.json());
  } catch {
    return ActiveBrandSchema.parse({
      id: "00000000-0000-0000-0000-000000000000",
      scope: "GLOBAL", version: 0, appName: "OMS", tagline: null, footerText: null,
      imagery: {}, tokens: { colors: { primary: "#1d4ed8" } }, etag: "default"
    });
  }
}

/**
 * Serialise theme tokens into a `:root { --var: value; }` CSS block.
 * Values are already constrained by the server-side Zod allow-list (hex/rgb,
 * length units, font names) — so this is injection-safe.
 */
export function tokensToCssVars(tokens: ThemeTokens): string {
  const v: Record<string, string> = {};
  for (const [k, val] of Object.entries(tokens.colors)) {
    if (val) v[`--color-${kebab(k)}`] = val;
  }
  v["--radius-base"] = tokens.radius.base;
  if (tokens.radius.sm) v["--radius-sm"] = tokens.radius.sm;
  if (tokens.radius.lg) v["--radius-lg"] = tokens.radius.lg;
  v["--font-base"] = tokens.typography.fontBase;
  v["--type-scale"] = String(tokens.typography.scale);
  v["--color-scheme"] = tokens.mode;

  const body = Object.entries(v).map(([key, val]) => `${key}: ${val};`).join(" ");
  return `:root { color-scheme: ${tokens.mode}; ${body} }`;
}

function kebab(s: string): string {
  return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}
