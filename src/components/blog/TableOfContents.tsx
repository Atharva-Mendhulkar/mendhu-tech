// components/blog/TableOfContents.tsx
"use client";
import { useEffect, useState } from "react";

interface Heading { id: string; text: string; level: 2 | 3 }

function extractHeadingsFromDOM(): Heading[] {
  if (typeof document === "undefined") return [];

  return Array.from(document.querySelectorAll<HTMLHeadingElement>(".post-body h2[id], .post-body h3[id]"))
    .map(el => ({
      id: el.id,
      text: el.textContent?.trim() || "",
      level: Number(el.tagName.slice(1)) as 2 | 3,
    }))
    .filter(heading => heading.id && heading.text);
}

export default function TableOfContents({ html }: { html: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const postBody = document.querySelector(".post-body");
    if (!postBody) return;

    const extract = () => {
      setHeadings(extractHeadingsFromDOM());
    };

    extract();

    const observer = new MutationObserver(extract);
    observer.observe(postBody, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [html]);

  useEffect(() => {
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      entries => {
        const visibleEntries = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visibleEntries[0]?.target.id) setActiveId(visibleEntries[0].target.id);
      },
      { threshold: 0.1, rootMargin: "-96px 0px -55% 0px" }
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
              href={`#${encodeURIComponent(h.id)}`}
              className="block font-mono text-[10px] py-1 transition-colors leading-[1.5]"
              style={{
                paddingLeft: h.level === 3 ? "16px" : "10px",
                color: isActive ? "var(--accent)" : "var(--ink-faint)",
                borderLeft: isActive ? "2px dashed var(--accent)" : "2px solid transparent",
                marginLeft: "-2px",
              }}
              onClick={e => {
                e.preventDefault();
                const el = document.getElementById(h.id);
                if (el) {
                  setActiveId(h.id);
                  history.pushState(null, "", `#${encodeURIComponent(h.id)}`);
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
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
