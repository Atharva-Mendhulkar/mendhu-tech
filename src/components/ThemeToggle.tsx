"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { ThemeToggleCircular } from "@/components/ThemeToggleCircular";

/** The draggable Porygon anchors the circular ripple — wherever it currently is. */
const PORYGON_SELECTOR = "[data-porygon-anchor]";

export default function ThemeToggle() {
  // Hydration-safe: the icon pair is rendered statically and swapped via CSS
  // (`.dark` variant), so server HTML always matches the client's first render
  // regardless of what localStorage holds. State is only used to keep the
  // `dark` class on <html> in sync after mount.
  const [isDark, setIsDark] = React.useState(false);

  // Sync from saved theme + keep <html>.dark in sync with state (client-only).
  React.useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("theme");
    } catch {
      /* storage unavailable */
    }
    const initial = saved === "dark" || document.documentElement.classList.contains("dark");
    setIsDark(initial);
    document.documentElement.classList[initial ? "add" : "remove"]("dark");
  }, []);

  React.useEffect(() => {
    document.documentElement.classList[isDark ? "add" : "remove"]("dark");
  }, [isDark]);

  const handleToggle = () => {
    const next = !isDark;
    // Mutate the class synchronously so the view-transition snapshots are correct.
    document.documentElement.classList[next ? "add" : "remove"]("dark");
    setIsDark(next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* storage unavailable */
    }
  };

  return (
    // No fixed positioning here — the consumer decides where the toggle lives
    // (inline next to the spotlight pill on home, fixed top-right on /blog).
    <div className="shrink-0">
      <ThemeToggleCircular
        theme={isDark ? "dark" : "light"}
        onToggle={handleToggle}
        speed={0.9}
        blur={0}
        originSelector={PORYGON_SELECTOR}
        className="group w-11 h-11 rounded-full border border-dashed border-accent text-accent flex items-center justify-center bg-paper hover:bg-accent-light hover:-rotate-[10deg] transition-[background,color,transform,border-style] duration-200"
      >
        <Sun
          size={16}
          className="hidden dark:block group-hover:rotate-90 transition-transform duration-500"
        />
        <Moon
          size={16}
          className="dark:hidden group-hover:rotate-90 transition-transform duration-500"
        />
      </ThemeToggleCircular>
    </div>
  );
}