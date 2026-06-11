"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

/** Animated glassmorphism card used on the auth page. */
export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative z-10 w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-xl"
    >
      {children}
    </motion.div>
  );
}
