"use client";

import React from 'react';
import { GitHubCalendar } from 'react-github-calendar';

export default function GithubGraph() {
  // Using the shades of blue from the website (--accent: #0047FF)
  const explicitTheme = {
    light: ['#F2F6FF', '#B3C7FF', '#6690FF', '#1A59FF', '#0047FF'],
    dark: ['#F2F6FF', '#B3C7FF', '#6690FF', '#1A59FF', '#0047FF'],
  };

  return (
    <div className="border border-dashed border-border-strong p-4 md:p-8 bg-[rgba(253,253,251,0.72)] hover:bg-[rgba(0,71,255,0.025)] hover:border-solid hover:border-accent transition-all duration-300 flex justify-center relative rounded-2xl group mb-8 w-full overflow-hidden">
      <span className="absolute top-1 left-1 font-mono text-[8px] text-ink-faint opacity-30">+</span>
      <span className="absolute top-1 right-1 font-mono text-[8px] text-ink-faint opacity-30">+</span>
      <span className="absolute bottom-1 left-1 font-mono text-[8px] text-ink-faint opacity-30">+</span>
      <span className="absolute bottom-1 right-1 font-mono text-[8px] text-ink-faint opacity-30">+</span>
      
      <div className="w-full flex justify-center overflow-x-auto hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
        <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        <div className="min-w-max pr-2">
          <GitHubCalendar 
            username="Atharva-Mendhulkar" 
            colorScheme="light"
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
