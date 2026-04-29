"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { projects } from '@/data/projects';

interface LogItem {
  name: string;
  subtitle: string;
  date: string;
  href: string;
}

const PROJECT_ITEMS: LogItem[] = projects.map(p => ({
  name: p.title,
  subtitle: p.subtitle,
  date: p.statusLabel,
  href: p.links.github || `/#projects`
}));

export default function LogBar() {
  const pathname = usePathname();
  const [blogItems, setBlogItems] = useState<LogItem[]>([]);

  useEffect(() => {
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
            name: e.node.title,
            subtitle: "",
            date: new Date(e.node.publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            href: `/blog/${e.node.slug}`
          }));
          setBlogItems(parsed.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching Hashnode posts for LogBar:', err);
      }
    }
    fetchLatestBlogs();
  }, []);

  const items = (pathname === '/' || !pathname.startsWith('/blog')) ? PROJECT_ITEMS : blogItems;

  // Triple items for continuous seamless marquee loop
  const displayItems = items.length > 0 ? [...items, ...items, ...items] : [];

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
              <span className="font-bold text-ink border-b border-dashed border-border-strong group-hover:border-accent transition-colors">{item.name}</span>
              {item.subtitle && <span className="text-ink-muted"> — {item.subtitle}</span>}
              {item.date && <span className="text-ink-faint"> ({item.date})</span>}
            </a>
          </div>
        ))}
      </div>

    </div>
  );
}
