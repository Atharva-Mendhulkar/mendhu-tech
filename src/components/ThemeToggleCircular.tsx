"use client";
import * as React from "react";

export interface ThemeToggleCircularProps {
  children: React.ReactNode;
  onToggle?: () => void;
  theme?: "light" | "dark";
  className?: string;
  speed?: number;
  blur?: number;
  /** DOM selector whose center anchors the circular ripple (e.g. the Porygon). Falls back to the click point. */
  originSelector?: string;
}

export function ThemeToggleCircular({
  children,
  onToggle,
  theme,
  className,
  speed = 3.0,
  blur = 0,
  originSelector,
}: ThemeToggleCircularProps) {
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTransitioning) return;
    if (!document.startViewTransition) {
      onToggle?.();
      return;
    }
    setIsTransitioning(true);

    // Ripple originates from the anchor element (the Porygon) when present,
    // otherwise from the click point itself.
    let x = e.clientX;
    let y = e.clientY;
    if (originSelector) {
      const anchor = document.querySelector(originSelector);
      if (anchor) {
        const r = anchor.getBoundingClientRect();
        x = r.left + r.width / 2;
        y = r.top + r.height / 2;
      }
    }

    const isDark = document.documentElement.classList.contains("dark");
    const targetTheme = isDark ? "to-light" : "to-dark";
    document.documentElement.style.setProperty("--x", `${x}px`);
    document.documentElement.style.setProperty("--y", `${y}px`);
    document.documentElement.style.setProperty(
      "--transition-speed",
      `${speed}s`,
    );
    document.documentElement.style.setProperty(
      "--transition-blur",
      `${blur}px`,
    );
    document.documentElement.setAttribute("data-theme-transition", targetTheme);
    try {
      const transition = document.startViewTransition(() => {
        onToggle?.();
      });
      await transition.finished;
    } catch (error) {
      console.error("Theme transition error:", error);
    } finally {
      document.documentElement.removeAttribute("data-theme-transition");
      setIsTransitioning(false);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={className}
      style={{ pointerEvents: isTransitioning ? "none" : "auto" }}
      data-theme-toggle=""
      role="button"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {children}
    </div>
  );
}