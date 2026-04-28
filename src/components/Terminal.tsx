"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  FolderOpen, BookOpen, Search, CornerDownLeft,
  ArrowUp, ArrowDown, Cpu, FlaskConical, Leaf, Layers,
} from "lucide-react";
import rawResearchData from "@/data/research.json";

// ── Data ──────────────────────────────────────────────────────────────────

const PROJECTS = [
  { id: "jointpinn", name: "JointPINN",  desc: "PM2.5 Source Identification via PINNs",     tag: "research", keywords: ["ml", "physics", "pinn", "air", "pollution"] },
  { id: "avara",     name: "AVARA",      desc: "Agent Runtime Security Authority",           tag: "systems",  keywords: ["agent", "security", "runtime", "llm"] },
  { id: "kphd",      name: "K-PHD",      desc: "Kernel Predictive Hang Detector",            tag: "kernel",   keywords: ["linux", "kernel", "hang", "ema", "c"] },
  { id: "floework",  name: "Floework",   desc: "Human-Aware SaaS Productivity Platform",    tag: "saas",     keywords: ["saas", "productivity", "node", "socket"] },
];

const GARDEN_FILES = rawResearchData.nodes.map((n: any) => ({
  id: n.id,
  name: n.name || n.label || n.id,
  desc: n.description || "",
  keywords: n.tags || [],
}));

// Tag icon map
const TAG_ICON: Record<string, React.ReactNode> = {
  research: <FlaskConical size={13} strokeWidth={1.5} />,
  systems:  <Layers       size={13} strokeWidth={1.5} />,
  kernel:   <Cpu          size={13} strokeWidth={1.5} />,
  saas:     <Layers       size={13} strokeWidth={1.5} />,
  garden:   <Leaf         size={13} strokeWidth={1.5} />,
};

// ── Types ─────────────────────────────────────────────────────────────────

type ProjectItem  = typeof PROJECTS[number];
type GardenItem   = typeof GARDEN_FILES[number];
type ResultItem   =
  | { kind: "project"; item: ProjectItem }
  | { kind: "garden";  item: GardenItem  };

interface SpotlightProps {
  onOpenProject: (id: string) => void;
  onOpenGarden:  (fileId?: string) => void;
}

// ── Fuzzy scorer ──────────────────────────────────────────────────────────
function score(query: string, target: string): number {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (!q) return 1;
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 60;
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length ? 30 : 0;
}

function scoreItem(query: string, name: string, desc: string, keywords: string[]): number {
  return Math.max(
    score(query, name) * 1.5,
    score(query, desc),
    ...keywords.map(k => score(query, k) * 0.8),
  );
}

// Levenshtein distance for "did you mean"
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

// ── Component ─────────────────────────────────────────────────────────────

export default function Spotlight({ onOpenProject, onOpenGarden }: SpotlightProps) {
  const [open,   setOpen]   = useState(false);
  const [query,  setQuery]  = useState("");
  const [cursor, setCursor] = useState(0);
  const [mode,   setMode]   = useState<"all" | "garden">("all");
  
  // Pagination limits for 'Show More'
  const [visibleCount, setVisibleCount] = useState(5);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);

  // ── Drag & Session Position ───────────────────────────────────────────────
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("spotlight-pos");
      if (saved) return JSON.parse(saved);
    }
    return { x: 0, y: 0 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "BUTTON") return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      setPosition({ x: newX, y: newY });
      sessionStorage.setItem("spotlight-pos", JSON.stringify({ x: newX, y: newY }));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, position]);

  // ── Looping Placeholders ──────────────────────────────────────────────────
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const placeholders = useMemo(() => [
    "type 'avara' to goto avara",
    "type 'garden' to enter knowledge garden",
    "Ctrl + Space to search",
    "pinn overview",
    "temporal stability",
  ], []);

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setPlaceholderIndex(i => (i + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [open, placeholders]);

  // Reset pagination on query change
  useEffect(() => {
    setVisibleCount(5);
  }, [query]);

  // ── Search ────────────────────────────────────────────────────────────────

  const { results, suggestions } = useMemo(() => {
    const q = query.trim();

    if (!q) {
      if (mode === "garden") {
        const results: ResultItem[] = GARDEN_FILES.map(item => ({ kind: "garden" as const, item }));
        return { results, suggestions: [] };
      }
      return { results: [], suggestions: [] };
    }

    const availableProjects = mode === "all" ? PROJECTS : [];
    const availableGarden   = GARDEN_FILES;

    const scored: { r: ResultItem; s: number }[] = [
      ...availableProjects.map(item => ({
        r: { kind: "project" as const, item },
        s: scoreItem(q, item.name, item.desc, item.keywords),
      })),
      ...availableGarden.map(item => ({
        r: { kind: "garden" as const, item },
        s: scoreItem(q, item.name, item.desc, item.keywords),
      })),
    ];

    const hits = scored.filter(x => x.s > 0).sort((a, b) => b.s - a.s).map(x => x.r);

    let suggestions: string[] = [];
    if (hits.length === 0) {
      const allNames = [
        ...availableProjects.map(p => p.name),
        ...availableGarden.map(f => f.name),
      ];
      suggestions = allNames
        .map(n => ({ n, d: levenshtein(q.toLowerCase(), n.toLowerCase()) }))
        .filter(x => x.d <= 3 && x.d < q.length)
        .sort((a, b) => a.d - b.d)
        .map(x => x.n)
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .slice(0, 3);
    }

    return { results: hits, suggestions };
  }, [query, mode]);

  // ── Open / close ──────────────────────────────────────────────────────────

  const open_ = useCallback(() => { setOpen(true); setQuery(""); setMode("all"); setCursor(0); }, []);
  const close_ = useCallback(() => { setOpen(false); setQuery(""); setMode("all"); setCursor(0); }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "Space") { 
        e.preventDefault(); 
        open ? close_() : open_(); 
      }
      if (e.key === "Escape" && open) close_();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, open_, close_]);

  useEffect(() => {
    const handleToggle = () => { open ? close_() : open_(); };
    window.addEventListener('toggle-terminal', handleToggle);
    return () => window.removeEventListener('toggle-terminal', handleToggle);
  }, [open, open_, close_]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);

  // ── Keyboard nav ──────────────────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { 
      e.preventDefault(); 
      setCursor(c => Math.min(c + 1, Math.min(results.length, visibleCount) - 1)); 
    }
    else if (e.key === "ArrowUp") { 
      e.preventDefault(); 
      setCursor(c => Math.max(c - 1, 0)); 
    }
    else if (e.key === "Enter") { 
      e.preventDefault(); 
      if (results[cursor]) activate(results[cursor]); 
    }
    else if (e.key === "Tab") {
      const lower = query.toLowerCase().trim();
      if (lower === "knowledge garden" || lower === "garden") {
        e.preventDefault();
        setMode("garden");
        setQuery("");
      }
    }
    else if (e.key === "Backspace" && query === "" && mode === "garden") {
      setMode("all");
    }
  };

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${cursor}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  useEffect(() => { setCursor(0); }, [query, mode]);

  // ── Activate ──────────────────────────────────────────────────────────────

  const activate = (r: ResultItem) => {
    close_();
    if (r.kind === "project") setTimeout(() => onOpenProject(r.item.id), 100);
    else setTimeout(() => onOpenGarden(r.item.id), 100);
  };

  // ── Highlight ─────────────────────────────────────────────────────────────

  const highlight = (text: string) => {
    if (!query.trim()) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase().trim());
    if (idx === -1) return <>{text}</>;
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-accent">{text.slice(idx, idx + query.trim().length)}</span>
        {text.slice(idx + query.trim().length)}
      </>
    );
  };

  // ── Rendering sections ────────────────────────────────────────────────────

  const projectResults = results.filter(r => r.kind === "project");
  const gardenResults  = results.filter(r => r.kind === "garden");
  const hasResults     = results.length > 0;

  return (
    <>
      {/* Scrim (Translucent, NO BLUR) */}
      {open && (
        <div
          className="fixed inset-0 z-[99998]"
          style={{ background: "rgba(10,10,10,0.15)" }}
          onClick={close_}
        />
      )}

      {/* Panel */}
      {open && (
        <div
          className="fixed z-[99999] left-1/2"
          style={{ 
            top: "26%", 
            left: "50%",
            transform: `translate(calc(-50% + ${position.x}px), ${position.y}px)`, 
            width: "min(640px, 92vw)",
            cursor: isDragging ? "grabbing" : "grab",
          }}
          onMouseDown={handleMouseDown}
        >
          <div style={{
            background: "rgba(253,253,251,0.96)",
            border: "1px dashed rgba(26,26,26,0.18)",
            borderRadius: 16,
            boxShadow: "0 40px 100px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.05)",
            overflow: "hidden",
            animation: "spot-in 0.16s cubic-bezier(0.16,1,0.3,1) forwards",
          }}>

            {/* Input */}
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px dashed rgba(26,26,26,0.1)" }}>
              <Search size={15} className="text-ink-faint shrink-0" strokeWidth={1.5} />
              
              {mode === "garden" && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-accent border border-dashed border-accent/40 bg-accent/5 px-2 py-0.5 rounded shrink-0">
                  <Leaf size={11} /> garden
                  <button onClick={() => setMode("all")} className="hover:text-ink ml-1 font-bold cursor-pointer">×</button>
                </span>
              )}

              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholders[placeholderIndex]}
                className="mac-text-cursor flex-1 bg-transparent outline-none font-mono text-[13px] text-ink placeholder:text-ink-faint"
                spellCheck={false}
                autoComplete="off"
              />
              
              {query && (
                <span className="font-mono text-[9px] text-ink-faint border border-dashed border-border-strong px-1.5 py-0.5" style={{ borderRadius: 4 }}>
                  {results.length} hit{results.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Body */}
            {(hasResults || (mode === "garden" && !query)) && (
              <div ref={listRef} className="overflow-y-auto" style={{ maxHeight: 360, scrollbarWidth: "none" }}>

                {/* Projects section */}
                {projectResults.length > 0 && (
                  <>
                    <SectionHeader label="Projects" />
                    {projectResults.slice(0, visibleCount).map(r => (
                      <Row
                        key={r.item.id}
                        r={r}
                        idx={results.indexOf(r)}
                        isActive={cursor === results.indexOf(r)}
                        onClick={() => activate(r)}
                        onHover={() => setCursor(results.indexOf(r))}
                        highlight={highlight}
                      />
                    ))}
                    
                    {projectResults.length > visibleCount && (
                      <div className="flex justify-end px-5 py-2">
                        <button 
                          onClick={() => setVisibleCount(v => v + 5)}
                          className="font-mono text-[10px] text-accent border border-dashed border-accent/30 bg-accent/5 px-2 py-1 rounded hover:bg-accent/10 cursor-pointer"
                        >
                          Show More
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Garden section */}
                {gardenResults.length > 0 && (
                  <>
                    <SectionHeader label="Garden" />
                    {gardenResults.slice(0, visibleCount).map(r => (
                      <Row
                        key={r.item.id}
                        r={r}
                        idx={results.indexOf(r)}
                        isActive={cursor === results.indexOf(r)}
                        onClick={() => activate(r)}
                        onHover={() => setCursor(results.indexOf(r))}
                        highlight={highlight}
                      />
                    ))}

                    {gardenResults.length > visibleCount && (
                      <div className="flex justify-end px-5 py-2">
                        <button 
                          onClick={() => setVisibleCount(v => v + 5)}
                          className="font-mono text-[10px] text-accent border border-dashed border-accent/30 bg-accent/5 px-2 py-1 rounded hover:bg-accent/10 cursor-pointer"
                        >
                          Show More
                        </button>
                      </div>
                    )}
                  </>
                )}

                <div className="h-1" />
              </div>
            )}

            {/* Empty state while searching */}
            {!hasResults && query && (
              <div className="px-5 py-8">
                <p className="font-mono text-[11px] text-ink-faint text-center mb-4">
                  No results for <span className="text-ink">&ldquo;{query}&rdquo;</span>
                </p>

                {suggestions.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <p className="font-mono text-[9px] text-ink-faint uppercase tracking-widest text-center mb-2">
                      Did you mean?
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {suggestions.map(s => (
                        <button
                          key={s}
                          onClick={() => setQuery(s)}
                          className="font-mono text-[11px] text-accent border border-dashed border-accent px-3 py-1 hover:bg-accent-light transition-colors cursor-pointer"
                          style={{ borderRadius: 6 }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer hints */}
            <div
              className="flex items-center gap-4 px-5 py-2.5"
              style={{ borderTop: "1px dashed rgba(26,26,26,0.08)", background: "rgba(26,26,26,0.02)" }}
            >
              <Hint keys={["↵"]}       label="open"     />
              <Hint keys={["↑", "↓"]}  label="navigate" />
              {mode === "all" && query.toLowerCase().includes("gar") && <Hint keys={["⇥"]} label="lock mode" />}
              <Hint keys={["esc"]}      label="close"    />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spot-in {
          from { opacity:0; transform:scale(0.96) translateY(-8px); }
          to   { opacity:1; transform:scale(1)    translateY(0);    }
        }
      `}</style>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-5 pt-3 pb-1 font-mono text-[9px] text-ink-faint uppercase tracking-widest flex items-center gap-2">
      <span>{label}</span>
      <span className="flex-1 border-t border-dashed" style={{ borderColor: "rgba(26,26,26,0.1)" }} />
    </div>
  );
}

function Row({ r, idx, isActive, onClick, onHover, highlight }: {
  r: ResultItem;
  idx: number;
  isActive: boolean;
  onClick: () => void;
  onHover: () => void;
  highlight: (t: string) => React.ReactNode;
}) {
  const tag = r.kind === "project" ? (r.item as ProjectItem).tag : "garden";

  return (
    <button
      data-idx={idx}
      onClick={onClick}
      onMouseEnter={onHover}
      className="w-full flex items-center gap-3 px-5 py-2.5 text-left transition-all cursor-pointer"
      style={{
        background:  isActive ? "rgba(0,71,255,0.055)" : "transparent",
        borderLeft:  `2px solid ${isActive ? "var(--accent)" : "transparent"}`,
      }}
    >
      <div
        className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center transition-colors"
        style={{
          background:   isActive ? "rgba(0,71,255,0.1)"  : "rgba(26,26,26,0.04)",
          border:       "1px dashed",
          borderColor:  isActive ? "rgba(0,71,255,0.28)" : "rgba(26,26,26,0.13)",
        }}
      >
        <span className={isActive ? "text-accent" : "text-ink-faint"}>
          {r.kind === "project"
            ? <FolderOpen size={14} strokeWidth={1.5} />
            : <BookOpen   size={14} strokeWidth={1.5} />}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-mono text-[12px] text-ink truncate">{highlight(r.item.name)}</div>
        <div className="font-mono text-[10px] text-ink-faint truncate">{highlight(r.item.desc)}</div>
      </div>

      <div
        className="shrink-0 flex items-center gap-1 font-mono text-[8px] px-2 py-0.5 border border-dashed transition-colors"
        style={{
          color:       isActive ? "var(--accent)"           : "var(--ink-faint)",
          borderColor: isActive ? "rgba(0,71,255,0.28)"     : "rgba(26,26,26,0.14)",
          background:  isActive ? "rgba(0,71,255,0.06)"     : "transparent",
          borderRadius: 4,
        }}
      >
        <span>{TAG_ICON[tag]}</span>
        <span>{tag}</span>
      </div>
    </button>
  );
}

function Hint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {keys.map(k => (
        <kbd
          key={k}
          className="font-mono text-[9px] text-ink-faint flex items-center justify-center"
          style={{
            border: "1px dashed rgba(26,26,26,0.18)",
            borderRadius: 4,
            padding: "1px 5px",
            background: "rgba(26,26,26,0.04)",
            minWidth: 20,
          }}
        >
          {k}
        </kbd>
      ))}
      <span className="font-mono text-[9px] text-ink-faint">{label}</span>
    </div>
  );
}