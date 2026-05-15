"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

const HEADING_OFFSET = 96;

function decodeHash(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#[0-9]+;/g, (match) => {
      const code = parseInt(match.slice(2, -1), 10);
      return !isNaN(code) ? String.fromCharCode(code) : match;
    });
}

function scrollToHeading(el: HTMLElement, behavior: ScrollBehavior) {
  const top = el.getBoundingClientRect().top + window.scrollY - HEADING_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior });
}

function extractHeadingsFromDOM(): Heading[] {
  if (typeof document === "undefined") return [];

  const selectors = [
    ".post-body h1[id]",
    ".post-body h2[id]",
    ".post-body h3[id]",
    ".post-body h4[id]",
    ".post-body h5[id]",
    ".post-body h6[id]",
  ].join(", ");

  return Array.from(document.querySelectorAll<HTMLHeadingElement>(selectors))
    .map((el) => {
      let rawText = el.textContent?.trim() || "";
      rawText = decodeHtmlEntities(rawText);
      const level = parseInt(el.tagName[1], 10) || 2;
      return {
        id: el.id,
        text: rawText,
        level,
      };
    })
    .filter((heading) => heading.id && heading.text);
}

export default function TableOfContents({ headings: initialHeadings, html }: { headings?: Heading[]; html?: string }) {
  const [headings, setHeadings] = useState<Heading[]>(initialHeadings || []);
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

  // Extract active headings from DOM when content changes
  useEffect(() => {
    if (initialHeadings && initialHeadings.length > 0) {
      setHeadings(initialHeadings);
      return;
    }

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
  }, [html, initialHeadings]);

  // Use IntersectionObserver for robust scroll tracking
  useEffect(() => {
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollLockRef.current) return;

        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        threshold: 1.0,
        rootMargin: "-96px 0px -55% 0px",
      }
    );

    headings.forEach((h) => {
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
    <div className="flex flex-col select-none">
      <div className="font-mono text-[9px] text-ink-faint tracking-widest uppercase mb-6 pb-2 border-b border-dashed border-border-strong font-bold">
        [TABLE OF CONTENTS]
      </div>
      <nav ref={navRef} className="flex flex-col gap-1 pr-2 max-h-[calc(100vh-200px)] overflow-y-auto scroll-smooth" style={{ scrollbarWidth: "none" }}>
        {headings.map((h) => {
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

              onClick={(e) => {
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
              title={h.text}
            >
              {h.text}
            </a>
          );
        })}
      </nav>

    </div>
  );
}
