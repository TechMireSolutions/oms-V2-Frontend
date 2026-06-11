"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { setToken, API_BASE as API } from "../../lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@oms.local");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const detail = res.status === 401 ? "Invalid credentials" :
          res.status === 429 ? "Too many attempts — try later" : `Sign-in failed (${res.status})`;
        throw new Error(detail);
      }
      const data = await res.json();
      if (data.accessToken) setToken(data.accessToken);
      if (data.mfaRequired) { setError("MFA required — not configured in this demo"); return; }
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const field =
    "w-full rounded-2xl border border-slate-800/80 bg-slate-950/40 py-3.5 pl-12 pr-4 text-sm text-slate-100 " +
    "transition-all duration-200 placeholder:text-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/20";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Email</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Password</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            className={field}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-all duration-200 hover:text-slate-200"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {error && (
        <p className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-100 px-3 py-2 text-sm font-medium text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}
      <motion.button
        type="submit"
        disabled={loading}
        whileTap={{ scale: 0.98 }}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 py-3.5 font-extrabold uppercase tracking-widest text-white shadow-xl shadow-orange-500/10 transition-all duration-200 hover:from-orange-600 hover:to-amber-700 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Signing in…" : "Sign in"}
      </motion.button>
      <p className="text-center text-xs text-slate-500">
        Backend requires Redis + seeded users for live auth.
      </p>
    </form>
  );
}
