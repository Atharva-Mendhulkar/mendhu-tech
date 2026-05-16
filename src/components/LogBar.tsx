"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { formatDate, MediumPost } from '@/lib/medium';

interface LogItem {
  name: string;
  subtitle: string;
  date: string;
  href: string;
}

interface LogBarProps {
  initialBlogPosts?: MediumPost[];
}

export default function LogBar({ initialBlogPosts = [] }: LogBarProps) {
  const pathname = usePathname();

  const BLOG_ITEMS: LogItem[] = initialBlogPosts.slice(0, 3).map((post) => ({
    name: post.title,
    subtitle: "Latest Log",
    date: formatDate(post.pubDate),
    href: `/blog/${post.slug}`,
  }));

  const items = BLOG_ITEMS;

  // Quadruple items for exact 50% continuous seamless marquee loop math
  const displayItems = items.length > 0 ? [...items, ...items, ...items, ...items] : [];


  return (
    <div className="log-bar sticky top-0 z-[100] border-b border-dashed border-[rgba(0,71,255,0.3)] bg-[rgba(253,253,251,0.92)] backdrop-blur-[4px] overflow-hidden">
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
              target={item.href.startsWith('http') ? '_blank' : undefined}
              rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="group hover:text-ink transition-colors"
            >
              <span className="font-normal text-ink border-b border-dashed border-border-strong group-hover:border-accent transition-colors">{item.name}</span>
              {item.subtitle && <span className="text-ink-muted"> — {item.subtitle}</span>}
              {item.date && <span className="text-ink-faint"> ({item.date})</span>}
            </a>
          </div>
        ))}
      </div>

    </div>
  );
}
