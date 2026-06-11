import type { Config } from "tailwindcss";

// Tailwind reads the branding CSS variables (Module 12) so utilities like
// `bg-primary` / `rounded-base` follow the runtime theme with no rebuild.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        bg: "var(--color-bg)",
        fg: "var(--color-fg)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)"
      },
      borderRadius: {
        base: "var(--radius-base)",
        sm: "var(--radius-sm)",
        lg: "var(--radius-lg)"
      },
      fontFamily: {
        base: "var(--font-base)"
      }
    }
  },
  plugins: []
};
export default config;
