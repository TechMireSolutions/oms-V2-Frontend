"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ClipboardList, GraduationCap, HandHeart, Wallet, Wrench,
  FileText, Plug, ShieldCheck, Puzzle, Sparkles, Palette,
  Menu, X, ChevronLeft, ChevronRight, LogOut, type LucideIcon
} from "lucide-react";

const nav: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/project-tracker", label: "Project Tracker", icon: ClipboardList },
  { href: "/admissions", label: "Admissions", icon: GraduationCap },
  { href: "/welfare", label: "Welfare", icon: HandHeart },
  { href: "/finance", label: "Finance", icon: Wallet },
  { href: "/operations", label: "Operations", icon: Wrench },
  { href: "/policy", label: "Policy", icon: FileText },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/audit", label: "Audit", icon: ShieldCheck },
  { href: "/customization", label: "Builder", icon: Puzzle },
  { href: "/ai", label: "AI Assistant", icon: Sparkles },
  { href: "/branding", label: "Branding", icon: Palette }
];

function NavItems({ collapsed, pathname, onNavigate }: { collapsed: boolean; pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 py-3">
      {nav.map((n) => {
        const active = pathname === n.href || pathname.startsWith(n.href + "/");
        const Icon = n.icon;
        return (
          <Link
            key={n.href}
            href={n.href as never}
            onClick={onNavigate}
            title={collapsed ? n.label : undefined}
            className={`mx-2 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              active
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                : "text-gray-300 hover:bg-white/10 hover:text-white"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <Icon className={`h-5 w-5 shrink-0 ${active ? "text-white" : "text-gray-400"}`} />
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  {n.label}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarInner({
  appName, collapsed, pathname, onNavigate
}: { appName: string; collapsed: boolean; pathname: string; onNavigate?: () => void }) {
  return (
    <>
      <div className={`flex h-14 items-center gap-2 border-b border-white/5 px-4 ${collapsed ? "justify-center" : ""}`}>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-orange-500 text-sm font-black text-white shadow-lg shadow-orange-500/30">
          {appName.charAt(0)}
        </span>
        {!collapsed && <span className="truncate text-sm font-bold text-white">{appName}</span>}
      </div>
      <NavItems collapsed={collapsed} pathname={pathname} onNavigate={onNavigate} />
      <div className={`border-t border-white/5 px-4 py-3 text-[10px] uppercase tracking-[0.25em] text-gray-500 ${collapsed ? "text-center" : ""}`}>
        {collapsed ? "v1" : "v0.1 · SQLite dev"}
      </div>
    </>
  );
}

export function AppShell({ appName, children }: { appName: string; children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Desktop sidebar */}
      <motion.aside
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1, width: collapsed ? 72 : 230 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r border-white/5 bg-[#111827] md:flex"
      >
        <SidebarInner appName={appName} collapsed={collapsed} pathname={pathname} />
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-16 grid h-6 w-6 place-items-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-500/30 transition-all duration-200 hover:bg-orange-600 active:scale-95"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[230px] flex-col border-r border-white/5 bg-[#111827] md:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarInner appName={appName} collapsed={false} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top navbar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-black px-4 text-white shadow-md md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg text-gray-300 transition-all duration-200 hover:bg-gray-700 hover:text-white md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-gray-300">Office Management System</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-md border border-green-300 bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
              <span className="h-1.5 w-1.5 rounded-full bg-green-600" /> Live
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-orange-500 text-xs font-bold text-white">SA</span>
            <Link
              href={"/" as never}
              className="hidden items-center gap-1.5 rounded-lg bg-gray-500 px-3 py-1.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-gray-700 sm:flex"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
