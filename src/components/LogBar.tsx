"use client";

import React from 'react';

const logItems = [
  { text: "CAPS: Context-Aware Agentic Payment System", date: "May 2026", href: "https://github.com/Atharva-Mendhulkar/CAPS" },
  { text: "AVARA Runtime Governance for LLM Agents", date: "Apr 2026", href: "https://github.com/Atharva-Mendhulkar" },
  { text: "K-PHD: Linux Kernel Starvation Monitoring", date: "Mar 2026", href: "https://github.com/Atharva-Mendhulkar/K-PHD" }
];

export default function LogBar() {
  // Duplicate items for seamless marquee loop
  const displayItems = [...logItems, ...logItems];

  return (
    <div className="log-bar sticky top-0 z-[100] border-b border-dashed border-border-strong bg-[rgba(253,253,251,0.92)] backdrop-blur-[4px] overflow-hidden">
      {/* Subtle diagonal hatch overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.04]" 
        style={{
          backgroundImage: `repeating-linear-gradient(-45deg, var(--ink) 0, var(--ink) 1px, transparent 1px, transparent 8px)`
        }}
      />
      
      <div className="flex items-center whitespace-nowrap animate-marquee py-2.5">
        {displayItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 px-8 font-mono text-[10.5px] text-ink-muted shrink-0">
            <div className="w-[3px] h-[3px] rounded-full bg-accent" />
            <a 
              href={item.href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-ink transition-colors"
            >
              <span className="border-b border-dashed border-border-strong text-ink pb-0.5">{item.text}</span> — {item.date}
            </a>
          </div>
        ))}
      </div>

    </div>
  );
}
