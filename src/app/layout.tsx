import "./globals.css";
import "@oms/ui/styles.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { getActiveBrand, tokensToCssVars } from "../lib/branding";

// Title/favicon come from the active brand at runtime (no redeploy).
export async function generateMetadata(): Promise<Metadata> {
  const brand = await getActiveBrand();
  return {
    title: { default: brand.appName, template: `%s · ${brand.appName}` },
    description: brand.tagline ?? undefined,
    icons: brand.imagery.favicon ? { icon: brand.imagery.favicon } : undefined
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const brand = await getActiveBrand();
  const cssVars = tokensToCssVars(brand.tokens);

  return (
    <html lang="en" data-brand={brand.etag} style={{ colorScheme: brand.tokens.mode }}>
      <head>
        {/* Inject design tokens as global CSS variables. A theme change restyles
            the entire UI instantly because every component reads var(--color-*). */}
        <style id="oms-theme" dangerouslySetInnerHTML={{ __html: cssVars }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
