"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  FolderOpen, BookOpen, Search,
  Cpu, FlaskConical, Leaf, Layers, Terminal as TermIcon, FileText, X
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

const COMMANDS = [
  { id: "garden",   name: "open garden",    desc: "Open knowledge garden interface" },
  { id: "resume",   name: "open resume",    desc: "Renders LaTeX resume source code directly" },
  { id: "linkedin", name: "goto linkedin",  desc: "Redirect to standard profile credentials" },
  { id: "github",   name: "goto github",    desc: "View public version control workspaces" },
  { id: "twitter",  name: "goto twitter",   desc: "Check research workflows online" },
  { id: "help",     name: "show commands",  desc: "List all active utility pointers" },
];

const RESUME_TEX_SOURCE = `%-------------------------
% Resume in Latex
% Tailored for: Salesforce SWE Intern (AMTS) — Class of 2028
%-------------------------

\\documentclass[letterpaper,10pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.6in}
\\addtolength{\\textheight}{1.2in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{#1 \\vspace{-2pt}}
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
\\begin{document}

%-----------HEADER-----------
\\begin{center}
    \\textbf{\\Huge \\scshape Atharva Mendhulkar} \\\\ \\vspace{1pt}
    \\small +91 8591436357 $|$
    \\href{mailto:mendhu36@outlook.com}{\\underline{mendhu36@outlook.com}} $|$
    \\href{https://linkedin.com/in/mendhu36}{\\underline{LinkedIn}} $|$
    \\href{https://github.com/Atharva-Mendhulkar}{\\underline{GitHub}} $|$
    \\href{https://mendhu.tech}{\\underline{Portfolio}}
\\end{center}

%-----------EDUCATION-----------
\\section{Education}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {Vellore Institute of Technology, Vellore}{Jul. 2024 -- Aug. 2028}
      {B.Tech in Information Technology}{}
  \\resumeSubHeadingListEnd

%-----------EXPERIENCE-----------
\\section{Experience}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {Indian Institute of Technology, Gandhinagar \\& Maker Bhavan Foundation, USA}{Gujarat, India}
      {Summer Intern (InventX Scholar) — Embedded Systems and Assistive device}{May 2025 -- Jul. 2025}
      \\resumeItemListStart
        \\resumeItem{Selected in \\textbf{top 1\\%} of 2000+ applicants for a competitive embedded systems research program.}
        \\resumeItem{Improved system responsiveness by \\textbf{22\\%} through optimized sensor data processing pipelines, reducing latency in the real-time telemetry loop.}
        \\resumeItem{Designed algorithmic logic for a \\textbf{patented assistive device} and collaborated across a multi-disciplinary hardware/firmware/software team, mirroring an agile Scrum engineering environment.}
      \\resumeItemListEnd
  \\resumeSubHeadingListEnd

%-----------PROJECTS-----------
\\section{Projects}
  \\resumeSubHeadingListStart

    \\resumeProjectHeading
      {\\textbf{floework — SaaS Productivity \\& Collaboration Platform} $|$
       \\href{https://github.com/Atharva-Mendhulkar/floework}{\\small GitHub} $|$
       \\href{https://floework.vercel.app/}{\\small Demo}}{Feb. 2026 -- Present}
      \\resumeItemListStart
        \\resumeItem{\\textbf{Developed} a real-time \\textbf{multi-tenant SaaS} platform with \\textbf{sub-100ms WebSocket} task synchronization via Socket.IO event-driven architecture, sustaining live collaboration for concurrent 3--15 member teams.}
        \\resumeItem{Designed a dual-database backend (\\textbf{PostgreSQL + Redis}) with 15-min cache TTLs and \\textbf{BullMQ async job queues}, offloading compute-heavy analytics to background workers for low-latency critical API paths.}
        \\resumeItem{\\textbf{Established} \\textbf{20+ RESTful API endpoints} enforcing \\textbf{JWT authentication} and \\textbf{RBAC} across Admin/Member roles, ensuring strict tenant data isolation across concurrent multi-workspace deployments.}
        \\resumeItem{\\textbf{Skills:} React, Node.js, PostgreSQL, Redis, WebSockets, REST APIs, Docker, TypeScript}
      \\resumeItemListEnd

    \\resumeProjectHeading
      {\\textbf{AVARA — Autonomous Validation \\& Agent Risk Authority} $|$
       \\href{https://github.com/Atharva-Mendhulkar/AVARA}{\\small GitHub} $|$
       \\href{https://drive.google.com/file/d/1TkBaTVRV62F2AURQg8SXpCerhrzlmO04/view?usp=sharing}{\\small Demo}}{Jan. 2026 -- Present}
      \\resumeItemListStart
        \\resumeItem{Architected a \\textbf{9-component runtime security authority} defending against \\textbf{9+ threat vectors} including indirect prompt injection, \\textbf{RAG-based permission} bypass, \\textbf{MCP supply-chain} attacks, and zero-click exploitation.}
        \\resumeItem{\\textbf{Implemented} an async \\textbf{circuit breaker} with real-time webhook approval flow, halting high-risk agent actions and requiring explicit human authorization before execution via \\textbf{FastAPI REST endpoints}.}
        \\resumeItem{\\textbf{Devised} an \\textbf{immutable SQLite audit ledger} capturing full replayable execution timelines across all agent decisions; developed a \\textbf{LangChain callback adapter} enabling 3-line developer integration.}
        \\resumeItem{\\textbf{Skills:} Python, FastAPI, LangChain, SQLite, Docker, Security Architecture, REST APIs}
      \\resumeItemListEnd

  \\resumeSubHeadingListEnd

%-----------PATENT-----------
\\section{Patent}
  \\resumeSubHeadingListStart
    \\resumeProjectHeading
      {\\textbf{UPRS — Universal Process Responsiveness System} $|$ \\textit{Patent Filed}}{Dec. 2025 -- Present}
      \\resumeItemListStart
        \\resumeItem{\\textbf{Engineered} a predictive background daemon in \\textbf{C and Swift} intercepting kernel telemetry to detect application hangs \\textbf{0.5--5 seconds before} manifestation — enabling pre-emptive mitigation over reactive recovery.}
        \\resumeItem{\\textbf{Built} a \\textbf{$<$15ms} data pipeline powering an \\textbf{XGBoost} inference engine achieving \\textbf{92.5\\% precision} and reducing UI freezes by \\textbf{82\\%}, operating at \\textbf{$<$1\\% CPU overhead}.}
        \\resumeItem{Ported core architecture across \\textbf{macOS (XNU kernel)} and \\textbf{Linux}, demonstrating cross-platform systems programming depth with thread-safe mitigation under real production workloads.}
      \\resumeItemListEnd
  \\resumeSubHeadingListEnd

%-----------TECHNICAL SKILLS-----------
\\section{Technical Skills}
  \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
      \\textbf{Languages}{: Java, Python, C/C++, JavaScript, TypeScript, SQL, Bash/Shell} \\\\
      \\textbf{Frameworks \\& Libraries}{: React, Node.js, Express.js, FastAPI, LangChain, Redux Toolkit, Socket.IO} \\\\
      \\textbf{Databases \\& Storage}{: PostgreSQL, Redis, SQLite --- relational modeling, schema design, query optimization} \\\\
      \\textbf{Core CS}{: Data Structures \\& Algorithms, OOP, DBMS, Computer Networks, System Design, Distributed Systems} \\\\
      \\textbf{Tools}{: Git, Docker, Kubernetes, Linux CLI, CI/CD}
    }}
  \\end{itemize}

%-----------ACHIEVEMENTS-----------
\\section{Achievements}
  \\resumeSubHeadingListStart
    \\resumeItem{\\textbf{Samsung PRISM Metaverse 2.0 2026 Finalist:} Top 20 of 450+ participants.}
    \\resumeItem{\\textbf{CodechefVIT DevSoc'26 Winner} — Digital Economy track (among 500+ participants): Built CAPS, an Agentic-UPI payment platform. $|$ \\href{https://github.com/Atharva-Mendhulkar/CAPS}{\\small GitHub}}
    \\resumeItem{\\textbf{Smart India Hackathon 2025 Semi-finalist} among 400+ competing teams nationally.}
    \\resumeItem{\\textbf{Innovation Week 2025:} Pitched AI-based maternal health platform to a panel consisting of Investors and Scientists from ISRO and DRDO.}
  \\resumeSubHeadingListEnd

\\end{document}`;

// Tag icon map
const TAG_ICON: Record<string, React.ReactNode> = {
  research: <FlaskConical size={13} strokeWidth={1.5} />,
  systems:  <Layers       size={13} strokeWidth={1.5} />,
  kernel:   <Cpu          size={13} strokeWidth={1.5} />,
  saas:     <Layers       size={13} strokeWidth={1.5} />,
  garden:   <Leaf         size={13} strokeWidth={1.5} />,
  command:  <TermIcon     size={13} strokeWidth={1.5} />,
};

// ── Types ─────────────────────────────────────────────────────────────────

type ProjectItem  = typeof PROJECTS[number];
type GardenItem   = typeof GARDEN_FILES[number];
type CommandItem  = typeof COMMANDS[number];
type ResultItem   =
  | { kind: "project"; item: ProjectItem }
  | { kind: "garden";  item: GardenItem  }
  | { kind: "command"; item: CommandItem };

interface SpotlightProps {
  onOpenProject: (id: string) => void;
  onOpenGarden:  (fileId?: string) => void;
}

// ── Word Intersect Scorer ──────────────────────────────────────────────────
function scoreItem(query: string, name: string, desc: string, keywords: string[]): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  
  const words = q.split(/\s+/);
  let totalScore = 0;
  
  for (const word of words) {
    let wordScore = 0;
    if (name.toLowerCase().includes(word)) {
      wordScore += name.toLowerCase().startsWith(word) ? 100 : 50;
    }
    if (desc.toLowerCase().includes(word)) {
      wordScore += 25;
    }
    for (const kw of keywords) {
      if (kw && kw.toLowerCase().includes(word)) {
        wordScore += 20;
      }
    }
    totalScore += wordScore;
  }
  return totalScore;
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
  const [isShowingResume, setIsShowingResume] = useState(false);
  
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
    // Prevent drag when clicking inputs, buttons, or actionable links
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "BUTTON" || target.closest("a")) return;
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
    "type 'open garden' directly",
    "type 'open resume' to view info",
    "type 'show commands' anytime",
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
    const q = query.trim().toLowerCase();

    // If query empty
    if (!q) {
      if (mode === "garden") {
        const results: ResultItem[] = GARDEN_FILES.map(item => ({ kind: "garden" as const, item }));
        return { results, suggestions: [] };
      }
      return { results: [], suggestions: [] };
    }

    // Context scoping
    const availableProjects = mode === "all" ? PROJECTS : [];
    const availableGarden   = GARDEN_FILES;

    // Filter commands directly
    const matchedCommands: ResultItem[] = COMMANDS.filter(cmd => {
      if (q === "show commands" || q === "show" || q === "commands" || q === "help") return true;
      return cmd.name.toLowerCase().includes(q) || cmd.desc.toLowerCase().includes(q);
    }).map(item => ({ kind: "command" as const, item }));

    // Scored search
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

    const hits = [
      ...matchedCommands,
      ...scored.filter(x => x.s > 0).sort((a, b) => b.s - a.s).map(x => x.r)
    ];

    // Suggestions via Levenshtein
    let suggestions: string[] = [];
    if (hits.length === 0) {
      const allNames = [
        ...availableProjects.map(p => p.name),
        ...availableGarden.map(f => f.name),
        ...COMMANDS.map(c => c.name),
      ];
      suggestions = allNames
        .map(n => ({ n, d: levenshtein(q, n.toLowerCase()) }))
        .filter(x => x.d <= 3 && x.d < q.length)
        .sort((a, b) => a.d - b.d)
        .map(x => x.n)
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .slice(0, 3);
    }

    return { results: hits, suggestions };
  }, [query, mode]);

  // ── Open / close ──────────────────────────────────────────────────────────

  const open_ = useCallback(() => { 
    setOpen(true); setQuery(""); setMode("all"); setCursor(0); setIsShowingResume(false); 
  }, []);
  
  const close_ = useCallback(() => { 
    setOpen(false); setQuery(""); setMode("all"); setCursor(0); setIsShowingResume(false); 
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === "`" || e.code === "Backquote")) { 
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
      if (lower === "knowledge garden" || lower === "garden" || lower === "open garden") {
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
    if (r.kind === "project") {
      close_();
      setTimeout(() => onOpenProject(r.item.id), 100);
    } else if (r.kind === "garden") {
      close_();
      setTimeout(() => onOpenGarden(r.item.id), 100);
    } else if (r.kind === "command") {
      if (r.item.id === "garden") {
        close_();
        setTimeout(() => onOpenGarden(), 100);
      } else if (r.item.id === "resume") {
        setIsShowingResume(true);
      } else if (r.item.id === "linkedin") {
        window.open("https://linkedin.com/in/mendhu36/", "_blank");
        close_();
      } else if (r.item.id === "github") {
        window.open("https://github.com/Atharva-Mendhulkar", "_blank");
        close_();
      } else if (r.item.id === "twitter") {
        window.open("https://x.com/atharvarta", "_blank");
        close_();
      } else if (r.item.id === "help") {
        setQuery("show");
      }
    }
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

  const commandResults = results.filter(r => r.kind === "command");
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

      {/* LaTeX Fullscreen Overlay */}
      {isShowingResume && (
        <div className="fixed inset-0 z-[100000] bg-paper/95 backdrop-blur-md p-8 overflow-y-auto flex flex-col items-center">
          <div className="w-full max-w-3xl flex justify-between items-center pb-4 mb-6 border-b border-dashed border-border-strong">
            <h2 className="font-mono text-base font-bold text-ink flex items-center gap-2">
              <FileText size={18} className="text-accent" /> resume.tex
            </h2>
            <button 
              onClick={() => setIsShowingResume(false)}
              className="flex items-center gap-2 font-mono text-[11px] text-ink border border-dashed border-border-strong px-3 py-1.5 hover:text-accent hover:border-accent transition-all rounded cursor-pointer select-none"
            >
              <X size={14} /> Close
            </button>
          </div>
          <pre className="w-full max-w-3xl font-mono text-[12px] text-ink-muted leading-relaxed bg-paper-light p-6 rounded-lg border border-dashed border-border-strong overflow-x-auto whitespace-pre">
            {RESUME_TEX_SOURCE}
          </pre>
        </div>
      )}

      {/* Panel with Glassmorphism */}
      {open && !isShowingResume && (
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
            background: "rgba(253, 253, 251, 0.72)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px dashed rgba(26, 26, 26, 0.18)",
            borderRadius: 16,
            boxShadow: "0 40px 100px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.04)",
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

                {/* Commands section */}
                {commandResults.length > 0 && (
                  <>
                    <SectionHeader label="Commands" />
                    {commandResults.map(r => (
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
                  </>
                )}

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
  const tag = r.kind === "project" ? (r.item as ProjectItem).tag : r.kind === "garden" ? "garden" : "command";

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
            : r.kind === "garden"
              ? <BookOpen size={14} strokeWidth={1.5} />
              : <TermIcon size={14} strokeWidth={1.5} />}
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