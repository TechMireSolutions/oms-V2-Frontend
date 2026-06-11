import { Page } from "../../components/shell/Page";
import { getActiveBrand } from "../../lib/branding";

export default async function BrandingPage() {
  const brand = await getActiveBrand();
  const colors = brand.tokens.colors as Record<string, string | undefined>;
  return (
    <Page title="Branding" subtitle="Runtime white-labeling — tokens served as CSS variables, no redeploy.">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-bold text-gray-800">Active brand</h3>
          <dl className="grid grid-cols-3 gap-y-3 text-sm">
            <dt className="text-gray-500">App name</dt><dd className="col-span-2 font-medium text-gray-800">{brand.appName}</dd>
            <dt className="text-gray-500">Tagline</dt><dd className="col-span-2 text-gray-700">{brand.tagline ?? "—"}</dd>
            <dt className="text-gray-500">Scope</dt><dd className="col-span-2 text-gray-700">{brand.scope}</dd>
            <dt className="text-gray-500">Version</dt><dd className="col-span-2 text-gray-700">{brand.version}</dd>
            <dt className="text-gray-500">Mode</dt><dd className="col-span-2 text-gray-700">{brand.tokens.mode}</dd>
            <dt className="text-gray-500">Radius</dt><dd className="col-span-2 text-gray-700">{brand.tokens.radius.base}</dd>
            <dt className="text-gray-500">Font</dt><dd className="col-span-2 truncate text-gray-700">{brand.tokens.typography.fontBase}</dd>
          </dl>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-bold text-gray-800">Theme tokens (live)</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(colors).filter(([, v]) => v).map(([name, value]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-xl border border-gray-200" style={{ background: value }} />
                <div className="text-sm">
                  <div className="font-medium text-gray-800">--color-{name}</div>
                  <div className="text-xs text-gray-500">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs text-gray-500">
        Published via <code>POST /branding/:id/publish</code> (SuperAdmin). The active brand is cached in Redis,
        invalidated on publish, and injected into <code>:root</code> as CSS variables — the whole UI re-skins instantly.
      </p>
    </Page>
  );
}
