"use client";

import React, { useEffect, useState } from 'react';

interface LogItem {
  text: string;
  date: string;
  href: string;
}

interface LogBarProps {
  mode?: 'blogs' | 'projects';
}

const FEATURED_PROJECTS: LogItem[] = [
  { text: "CAPS — Agentic UPI for cross-border fintech payloads", date: "Jan 2025", href: "#" },
  { text: "AVARA — Agent Runtime Security Authority mapping", date: "Nov 2024", href: "#" },
  { text: "K-PHD — Kernel Predictive Hang Detector for Linux subsystems", date: "Sep 2024", href: "#" }
];

export default function LogBar({ mode = 'blogs' }: LogBarProps) {
  const [items, setItems] = useState<LogItem[]>(mode === 'projects' ? FEATURED_PROJECTS : []);

  useEffect(() => {
    if (mode === 'projects') {
      setItems(FEATURED_PROJECTS);
      return;
    }

    async function fetchLatestBlogs() {
      try {
        const query = `
          query {
            publication(host: "atharvarta.hashnode.dev") {
              posts(first: 3) {
                edges {
                  node {
                    title
                    publishedAt
                    slug
                  }
                }
              }
            }
          }
        `;
        const res = await fetch('https://gql.hashnode.com', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': '0cb3d74f-1448-421d-b181-962fd449b69e'
          },
          body: JSON.stringify({ query }),
        });
        const json = await res.json();
        const edges = json.data?.publication?.posts?.edges || [];
        if (edges.length > 0) {
          const parsed = edges.map((e: any) => ({
            text: e.node.title,
            date: new Date(e.node.publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            href: `/blog/${e.node.slug}`
          }));
          setItems(parsed.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching Hashnode posts for LogBar:', err);
      }
    }
    fetchLatestBlogs();
  }, [mode]);

  // Triple items for continuous seamless marquee loop
  const displayItems = [...items, ...items, ...items];

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
              className="group hover:text-ink transition-colors"
            >
              <span className="border-b border-dashed border-border-strong group-hover:border-accent text-ink pb-0.5 transition-colors">{item.text}</span> — {item.date}
            </a>
          </div>
        ))}
      </div>

    </div>
  );
}
