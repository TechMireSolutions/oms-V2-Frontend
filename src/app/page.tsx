import Link from "next/link";
import { getActiveBrand } from "../lib/branding";
import { LoginForm } from "../components/auth/LoginForm";
import { AuthCard } from "../components/auth/AuthCard";

export default async function LoginPage() {
  const brand = await getActiveBrand();
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4">
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-orange-600/10 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-[130px]" />

      <AuthCard>
        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-lg font-black text-white shadow-lg shadow-orange-500/30">
            {brand.appName.charAt(0)}
          </span>
          <div>
            <div className="text-lg font-bold text-white">{brand.appName}</div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Office Management</div>
          </div>
        </div>

        <h2 className="text-2xl font-black text-white">Sign in</h2>
        <p className="mb-6 mt-1 text-sm font-medium text-slate-400">
          {brand.tagline ?? "Welcome back. Enter your credentials."}
        </p>

        <LoginForm />

        <div className="mt-6 text-center text-sm text-slate-400">
          or{" "}
          <Link href="/dashboard" className="font-semibold text-orange-500 transition-all duration-200 hover:text-orange-400">
            explore the demo dashboard →
          </Link>
        </div>

        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.25em] text-slate-600">
          {brand.footerText ?? "© TechMire Solutions"}
        </p>
      </AuthCard>
    </div>
  );
}
