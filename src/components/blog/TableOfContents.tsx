// components/blog/TableOfContents.tsx
"use client";
import { useEffect, useState } from "react";

interface Heading { id: string; text: string; level: 2 | 3 }

function extractHeadings(content: string): Heading[] {
  if (!content) return [];
  const headings: Heading[] = [];
  
  // Try Markdown parsing
  const mdLines = content.split("\n");
  for (const line of mdLines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length as 2 | 3;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      headings.push({ id, text, level });
    }
  }

  // Fallback to HTML parsing
  if (headings.length === 0 && typeof window !== "undefined") {
    const div = document.createElement("div");
    div.innerHTML = content;
    div.querySelectorAll("h2, h3").forEach(el => {
      const text  = el.textContent ?? "";
      const id    = el.id || text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const level = parseInt(el.tagName[1]) as 2 | 3;
      headings.push({ id, text, level });
    });
  }
  
  return headings;
}

export default function TableOfContents({ html }: { html: string }) {
  const [headings, setHeadings]     = useState<Heading[]>([]);
  const [activeId, setActiveId]     = useState("");

  useEffect(() => {
    setHeadings(extractHeadings(html));
  }, [html]);

  useEffect(() => {
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id); });
      },
      { threshold: 0.5, rootMargin: "-80px 0px -40% 0px" }
    );
    headings.forEach(h => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  return (
    <div>
      <div className="font-mono text-[9px] text-ink-faint tracking-widest uppercase mb-4">
        Contents
      </div>
      <nav>
        {headings.map(h => {
          const isActive = h.id === activeId;
          return (
            <a
              key={h.id}
              href={`#${h.id}`}
              className="block font-mono text-[10px] py-1 transition-colors leading-[1.5]"
              style={{
                paddingLeft:  h.level === 3 ? "16px" : "10px",
                color:        isActive ? "var(--accent)" : "var(--ink-faint)",
                borderLeft:   isActive ? "2px dashed var(--accent)" : "2px solid transparent",
                marginLeft:   "-2px",
              }}
              onClick={e => {
                e.preventDefault();
                const el = document.getElementById(h.id);
                if (el) {
                  const offset = 40; // padding offset
                  const bodyRect = document.body.getBoundingClientRect().top;
                  const elementRect = el.getBoundingClientRect().top;
                  const elementPosition = elementRect - bodyRect;
                  const offsetPosition = elementPosition - offset;

                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                  });
                }
              }}
            >
              {h.text.length > 36 ? h.text.slice(0, 33) + "…" : h.text}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
