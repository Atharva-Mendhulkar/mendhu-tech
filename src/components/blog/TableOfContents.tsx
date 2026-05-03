// components/blog/TableOfContents.tsx
"use client";
import { useCallback, useEffect, useRef, useState } from "react";

interface Heading { id: string; text: string; level: 2 | 3 }

const HEADING_OFFSET = 96;

function decodeHash(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function scrollToHeading(el: HTMLElement, behavior: ScrollBehavior) {
  const top = el.getBoundingClientRect().top + window.scrollY - HEADING_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior });
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
  const scrollLockRef = useRef<number | null>(null);
  const handledHashRef = useRef("");
  const navRef = useRef<HTMLDivElement>(null);

  const releaseScrollLock = useCallback(() => {
    if (scrollLockRef.current) window.clearTimeout(scrollLockRef.current);
    scrollLockRef.current = window.setTimeout(() => {
      scrollLockRef.current = null;
    }, 650);
  }, []);

  useEffect(() => {
    return () => {
      if (scrollLockRef.current) window.clearTimeout(scrollLockRef.current);
    };
  }, []);

  // Update active heading based on viewport position
  useEffect(() => {
    const postBody = document.querySelector(".post-body");
    if (!postBody) return;

    const extract = () => {
      const nextHeadings = extractHeadingsFromDOM();
      setHeadings(nextHeadings);
    };

    extract();

    const observer = new MutationObserver(extract);
    observer.observe(postBody, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [html]);

  // Use IntersectionObserver for robust scroll tracking
  useEffect(() => {
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollLockRef.current) return;

        // Find the "most relevant" visible heading
        // Usually the one closest to the top of the viewport (with some offset)
        const visibleEntries = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id);
        } else {
          // If no headings are currently intersecting, we might be between headings
          // We can fallback to checking window.scrollY if needed, or just stay on last one
        }
      },
      { 
        threshold: 1.0, 
        rootMargin: "-96px 0px -70% 0px" // Only consider headings in the top 30% of view
      }
    );

    headings.forEach(h => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  // Handle initial hash navigation
  useEffect(() => {
    const hash = window.location.hash;
    if (!headings.length || !hash || handledHashRef.current === hash) return;

    handledHashRef.current = hash;

    const targetId = decodeHash(hash.slice(1));
    const target = document.getElementById(targetId);
    if (!target) return;

    const frame = window.requestAnimationFrame(() => {
      scrollToHeading(target, "auto");
      setActiveId(targetId);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [headings]);

  // Auto-scroll ToC to keep active item in view
  useEffect(() => {
    if (!activeId || !navRef.current) return;
    const activeLink = navRef.current.querySelector(`a[href$="${encodeURIComponent(activeId)}"]`);
    if (activeLink) {
      activeLink.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeId]);

  if (!headings.length) return null;

  return (
    <div className="flex flex-col max-h-[calc(100vh-120px)]">
      <div className="font-mono text-[9px] text-ink-faint tracking-widest uppercase mb-4 shrink-0">
        Contents
      </div>
      <nav 
        ref={navRef}
        className="overflow-y-auto pl-1 pr-2 custom-scrollbar scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { display: none; }
        `}</style>
        {headings.map(h => {
          const isActive = h.id === activeId;
          return (
            <a
              key={h.id}
              href={`#${encodeURIComponent(h.id)}`}
              className="block font-mono text-[10px] py-1 transition-all leading-[1.5]"
              style={{
                paddingLeft: h.level === 3 ? "24px" : "16px",
                color: isActive ? "var(--accent)" : "var(--ink-faint)",
                borderLeft: isActive ? "2px dashed var(--accent)" : "2px solid transparent",
              }}
              onClick={e => {
                e.preventDefault();
                const el = document.getElementById(h.id);
                if (el) {
                  const hash = `#${encodeURIComponent(h.id)}`;
                  setActiveId(h.id);
                  handledHashRef.current = hash;
                  releaseScrollLock();
                  scrollToHeading(el, "smooth");
                  history.pushState(null, "", hash);
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
