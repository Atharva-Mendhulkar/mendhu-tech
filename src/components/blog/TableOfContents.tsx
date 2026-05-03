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
    handledHashRef.current = "";
  }, [html]);

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
      if (scrollLockRef.current) {
        releaseScrollLock();
        return;
      }

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
  }, [headings, releaseScrollLock, updateActiveHeading]);

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

  const navRef = useRef<HTMLDivElement>(null);

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
        className="overflow-y-auto pr-2 custom-scrollbar scroll-smooth border-l border-dashed border-border-strong"
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
              className="block font-mono text-[10px] py-1 transition-all leading-[1.5] relative"
              style={{
                paddingLeft: h.level === 3 ? "24px" : "16px",
                color: isActive ? "var(--accent)" : "var(--ink-faint)",
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
              {isActive && (
                <span 
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-3 bg-accent"
                  style={{ marginLeft: "-1px" }}
                />
              )}
              {h.text.length > 36 ? h.text.slice(0, 33) + "…" : h.text}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
