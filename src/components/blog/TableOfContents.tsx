// components/blog/TableOfContents.tsx
"use client";
import { useCallback, useEffect, useState } from "react";

interface Heading { id: string; text: string; level: 2 | 3 }

function decodeHash(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

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

  const updateActiveHeading = useCallback((items: Heading[]) => {
    if (!items.length) return;

    const marker = window.scrollY + 112;
    let current = items[0].id;

    for (const heading of items) {
      const el = document.getElementById(heading.id);
      if (!el) continue;

      const top = el.getBoundingClientRect().top + window.scrollY;
      if (top <= marker) current = heading.id;
      else break;
    }

    setActiveId(current);
  }, []);

  useEffect(() => {
    const postBody = document.querySelector(".post-body");
    if (!postBody) return;

    const extract = () => {
      const nextHeadings = extractHeadingsFromDOM();
      setHeadings(nextHeadings);
      updateActiveHeading(nextHeadings);
    };

    extract();

    const observer = new MutationObserver(extract);
    observer.observe(postBody, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [html, updateActiveHeading]);

  useEffect(() => {
    if (!headings.length) return;

    let frame = 0;
    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => updateActiveHeading(headings));
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [headings, updateActiveHeading]);

  useEffect(() => {
    if (!headings.length || !window.location.hash) return;

    const targetId = decodeHash(window.location.hash.slice(1));
    const target = document.getElementById(targetId);
    if (!target) return;

    const frame = window.requestAnimationFrame(() => {
      target.scrollIntoView({ block: "start" });
      setActiveId(targetId);
    });

    return () => window.cancelAnimationFrame(frame);
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
