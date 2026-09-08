"use client";

import React from 'react';
import { GitHubCalendar } from 'react-github-calendar';

/** Tracks the `dark` class on <html> so the heatmap re-renders on theme toggle. */
function useIsDarkTheme(): boolean {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const root = document.documentElement;
    const sync = () => setIsDark(root.classList.contains('dark'));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

export default function GithubGraph() {
  const isDark = useIsDarkTheme();

  // Heatmap palette — graphite base with blue intensity rising with activity.
  // Light shares the same blue family (--accent: #0047FF).
  const explicitTheme = {
    light: ['#EDF1F7', '#B3C7FF', '#6690FF', '#1A59FF', '#0047FF'],
    dark: ['#252A30', '#283653', '#3155A0', '#3E68CC', '#4D7CFF'],
  };

  return (
    <div className="border border-dashed border-border-strong p-4 md:p-8 bg-card hover:bg-card-hover hover:border-solid hover:border-accent transition-all duration-300 flex justify-center relative rounded-2xl group mb-8 w-full overflow-hidden">
      <span className="absolute top-1 left-1 font-mono text-[8px] text-ink-faint opacity-30">+</span>
      <span className="absolute top-1 right-1 font-mono text-[8px] text-ink-faint opacity-30">+</span>
      <span className="absolute bottom-1 left-1 font-mono text-[8px] text-ink-faint opacity-30">+</span>
      <span className="absolute bottom-1 right-1 font-mono text-[8px] text-ink-faint opacity-30">+</span>
      
      <div className="w-full flex justify-center overflow-x-auto hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
        <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        <div className="min-w-max pr-2">
          <GitHubCalendar 
            username="Atharva-Mendhulkar" 
            colorScheme={isDark ? 'dark' : 'light'}
            theme={explicitTheme as any}
            blockMargin={4}
            blockSize={11}
            fontSize={10}
          />
        </div>
      </div>
    </div>
  );
}
