// components/blog/TableOfContents.tsx
"use client";
import { useEffect, useState } from "react";

interface Heading { id: string; text: string; level: 2 | 3 }

function extractHeadingsFromDOM(): Heading[] {
  if (typeof document === "undefined") return [];
  const headingElements = document.querySelectorAll(".post-body h2, .post-body h3");
  const headings: Heading[] = [];
  
  headingElements.forEach(el => {
    headings.push({
      id: el.id,
      text: el.textContent || "",
      level: parseInt(el.tagName[1]) as 2 | 3
    });
  });
  
  return headings;
}

export default function TableOfContents({ html }: { html: string }) {
  const [headings, setHeadings]     = useState<Heading[]>([]);
  const [activeId, setActiveId]     = useState("");

  useEffect(() => {
    // We need to wait for PostBody to render. A small timeout or just relying on
    // React's rendering cycle is usually enough. Let's do it immediately, and 
    // also set a small timeout as a fallback for complex markdown parsing.
    const extract = () => setHeadings(extractHeadingsFromDOM());
    extract(); // Initial extraction
    const timer = setTimeout(extract, 100); // Fallback after render
    return () => clearTimeout(timer);
  }, [html]);

  useEffect(() => {
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      entries => {
        // Find the visible entry with the highest intersection ratio
        const visibleEntries = entries.filter(e => e.isIntersecting);
        if (visibleEntries.length > 0) {
          // If multiple are visible, pick the first one from top (which is what we care about for TOC)
          setActiveId(visibleEntries[0].target.id);
        }
      },
      { threshold: 0.1, rootMargin: "-80px 0px -40% 0px" }
    );
    
    // Disconnect old observer before observing new elements
    observer.disconnect();
    
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
