"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
interface TerminalLine {
  id: number;
  type: "input" | "output" | "error" | "success" | "system" | "ascii" | "matrix";
  content: string | string[];
}

interface TerminalProps {
  onNavigate: (section: string) => void;
  onOpenProject: (id: string) => void;
  onOpenGarden: (fileId?: string) => void;
}

// ── ASCII Art ──────────────────────────────────────────────────────────────
const BOOT_ASCII = [
  "  ███╗   ███╗███████╗███╗   ██╗██████╗ ██╗  ██╗██╗   ██╗",
  "  ████╗ ████║██╔════╝████╗  ██║██╔══██╗██║  ██║██║   ██║",
  "  ██╔████╔██║█████╗  ██╔██╗ ██║██║  ██║███████║██║   ██║",
  "  ██║╚██╔╝██║██╔══╝  ██║╚██╗██║██║  ██║██╔══██║██║   ██║",
  "  ██║ ╚═╝ ██║███████╗██║ ╚████║██████╔╝██║  ██║╚██████╔╝",
  "  ╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ",
  "",
  "  mendhu.tech OS v2.0.4 — Systems Engineer & AI Researcher",
  "  Type 'help' for available commands.",
];

const PORYGON_ASCII = [
  "      ▄▄████▄▄",
  "    ▄█  ████  █▄",
  "   ██  ██████  ██",
  "  ██   ██  ██   ██",
  "  ██   ██████   ██",
  "   ██  ██  ██  ██",
  "    ▀█▄        ▄█▀",
  "      ▀████████▀",
  "   Porygon says: gao~",
];

const DOOM_FRAMES = [
`
  ·▄▄▄▄  ▄▄▌         ▄▄▌   ▄▄▄▄· ▪  ▄▄▄  ▄▄▄ .
  ██▪ ██ ██•  ▪     ██•  ▐█ ▀█▪██ ▀▄ █·▀▄.▀·
  ▐█· ▐█▌██▪   ▄█▀▄ ██▪  ▐█▀▀█▄▐█·▐▀▀▄ ▐▀▀▪▄
  ██. ██ ▐█▌▐▌▐█▌.▐▌▐█▌▐▌██▄▪▐█▐█▌▐█•█▌▐█▄▄▌
  ▀▀▀▀▀• .▀▀▀  ▀█▄▀▪.▀▀▀ ·▀▀▀▀ ▀▀▀.▀  ▀ ▀▀▀ 

  [■■■■■■■■■■■■■■■■□□□□] 70% loaded
  UAC FACILITY — PHOBOS ANOMALY
  Demons: 72  Ammo: 50  Health: 95%
  > E1M1: Hangar
  > press any key to... just kidding.
  > this is a portfolio, not a game engine.
  > (but imagine if it was)
`,
];

const MATRIX_CHARS = "日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｪｩｨ01";

// ── Commands registry ──────────────────────────────────────────────────────
const PROJECTS = [
  { id: "jointpinn", name: "JointPINN",  desc: "PM2.5 Source Identification via PINNs" },
  { id: "avara",     name: "AVARA",      desc: "Agent Runtime Security Authority" },
  { id: "kphd",      name: "K-PHD",      desc: "Kernel Predictive Hang Detector" },
  { id: "floework",  name: "Floework",   desc: "Human-Aware SaaS Productivity" },
];

const SECTIONS = ["about", "blog", "projects", "garden", "contact"];

// ── Help output ────────────────────────────────────────────────────────────
const HELP_TEXT = [
  "┌─────────────────────────────────────────────────────────────┐",
  "│                    AVAILABLE COMMANDS                       │",
  "├──────────────────┬──────────────────────────────────────────┤",
  "│ NAVIGATION       │                                          │",
  "│  goto <section>  │ about, blog, projects, garden, contact   │",
  "│  open <project>  │ jointpinn, avara, kphd, floework         │",
  "│  garden [file]   │ open knowledge garden, optionally a file │",
  "│  ls              │ list all sections and projects           │",
  "├──────────────────┼──────────────────────────────────────────┤",
  "│ INFO             │                                          │",
  "│  whoami          │ about the author                         │",
  "│  stack           │ tech stack used on this site             │",
  "│  research        │ list research notes                      │",
  "│  links           │ external links                           │",
  "│  cv / resume     │ open resume                              │",
  "├──────────────────┼──────────────────────────────────────────┤",
  "│ FUN              │                                          │",
  "│  porygon         │ meet the mascot                          │",
  "│  doom            │ boot DOOM                                │",
  "│  matrix          │ follow the white rabbit                  │",
  "│  hack            │ look busy                                │",
  "│  cowsay <text>   │ a wise cow speaks                        │",
  "│  history         │ command history                          │",
  "│  neofetch        │ system info                              │",
  "├──────────────────┼──────────────────────────────────────────┤",
  "│ SYSTEM           │                                          │",
  "│  clear           │ clear terminal                           │",
  "│  exit / q        │ close terminal                           │",
  "└──────────────────┴──────────────────────────────────────────┘",
  "",
  "  Tip: Use ↑↓ for history, Tab for autocomplete, ctrl+` or ` to toggle",
];

// ── Component ──────────────────────────────────────────────────────────────
export default function Terminal({ onNavigate, onOpenProject, onOpenGarden }: TerminalProps) {
  const [isOpen, setIsOpen]         = useState(false);
  const [isBooting, setIsBooting]   = useState(false);
  const [lines, setLines]           = useState<TerminalLine[]>([]);
  const [input, setInput]           = useState("");
  const [history, setHistory]       = useState<string[]>([]);
  const [histIdx, setHistIdx]       = useState(-1);
  const [suggestion, setSuggestion] = useState("");
  const [isMatrix, setIsMatrix]     = useState(false);
  const [isHacking, setIsHacking]   = useState(false);

  const inputRef    = useRef<HTMLInputElement>(null);
  const scrollRef   = useRef<HTMLDivElement>(null);
  const matrixRef   = useRef<HTMLCanvasElement>(null);
  const hackRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const matrixRaf   = useRef<number | null>(null);
  const lineIdRef   = useRef(0);

  const nextId = () => ++lineIdRef.current;

  // ── Scroll to bottom ───────────────────────────────────────────────────
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  // ── Focus input ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && !isBooting) setTimeout(() => inputRef.current?.focus(), 80);
  }, [isOpen, isBooting]);

  // ── Keyboard shortcut: backtick or ctrl+` ──────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isBacktick = e.key === "`";
      const isCtrlBacktick = e.key === "`" && e.ctrlKey;
      const isNormalBacktick = e.key === "`" && !e.metaKey && !e.ctrlKey;
      
      if (isNormalBacktick || isCtrlBacktick) {
        e.preventDefault();
        toggleTerminal();
      }
      if (e.key === "Escape" && isOpen) closeTerminal();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  // ── Event listener: toggle-terminal ─────────────────────────────────────
  useEffect(() => {
    const handleToggle = () => toggleTerminal();
    window.addEventListener('toggle-terminal', handleToggle);
    return () => window.removeEventListener('toggle-terminal', handleToggle);
  }, [isOpen, lines]);

  // ── Boot sequence ──────────────────────────────────────────────────────
  const bootUp = useCallback(() => {
    setIsBooting(true);
    setLines([]);

    const bootLines = [
      { type: "system" as const, content: "Initializing mendhu.tech OS..." },
      { type: "system" as const, content: "Loading kernel modules... [OK]" },
      { type: "system" as const, content: "Mounting research vault... [OK]" },
      { type: "ascii"  as const, content: BOOT_ASCII },
      { type: "system" as const, content: `Session started: ${new Date().toLocaleString()}` },
      { type: "system" as const, content: 'Type "help" for available commands.' },
    ];

    let delay = 0;
    bootLines.forEach((l, i) => {
      setTimeout(() => {
        setLines(prev => [...prev, { id: nextId(), ...l }]);
        if (i === bootLines.length - 1) setIsBooting(false);
      }, delay);
      delay += l.type === "ascii" ? 120 : 60 + i * 20;
    });
  }, []);

  const toggleTerminal = () => {
    if (isOpen) { closeTerminal(); return; }
    setIsOpen(true);
    setIsMatrix(false);
    if (isHacking) stopHack();
    if (lines.length === 0) bootUp();
  };

  const closeTerminal = () => {
    setIsOpen(false);
    setIsMatrix(false);
    if (hackRef.current) stopHack();
    if (matrixRaf.current) { cancelAnimationFrame(matrixRaf.current); matrixRaf.current = null; }
  };

  // ── Print helpers ──────────────────────────────────────────────────────
  const print = (content: string | string[], type: TerminalLine["type"] = "output") =>
    setLines(prev => [...prev, { id: nextId(), type, content }]);

  const printLines = (arr: string[], type: TerminalLine["type"] = "output") =>
    setLines(prev => [...prev, { id: nextId(), type, content: arr }]);

  const printError = (msg: string) => print(`bash: ${msg}: command not found`, "error");

  // ── Tab autocomplete ───────────────────────────────────────────────────
  const ALL_COMMANDS = [
    "help","clear","exit","goto","open","garden","ls","whoami","stack",
    "research","links","cv","resume","porygon","doom","matrix","hack",
    "cowsay","history","neofetch",
    ...SECTIONS.map(s => `goto ${s}`),
    ...PROJECTS.map(p => `open ${p.id}`),
  ];

  const updateSuggestion = (val: string) => {
    if (!val) { setSuggestion(""); return; }
    const match = ALL_COMMANDS.find(c => c.startsWith(val) && c !== val);
    setSuggestion(match ? match.slice(val.length) : "");
  };

  // ── Matrix effect ──────────────────────────────────────────────────────
  const startMatrix = () => {
    setIsMatrix(true);
    setTimeout(() => {
      const canvas = matrixRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      canvas.width  = canvas.parentElement!.clientWidth;
      canvas.height = canvas.parentElement!.clientHeight;
      const cols = Math.floor(canvas.width / 14);
      const drops = Array(cols).fill(1);

      const tick = () => {
        ctx.fillStyle = "rgba(0,0,0,0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#00FF88";
        ctx.font = "13px JetBrains Mono, monospace";
        drops.forEach((y, i) => {
          const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
          ctx.fillText(char, i * 14, y * 14);
          if (y * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        });
        matrixRaf.current = requestAnimationFrame(tick);
      };
      tick();
    }, 50);

    setTimeout(() => {
      if (matrixRaf.current) cancelAnimationFrame(matrixRaf.current);
      setIsMatrix(false);
      print("// You have been unplugged.", "success");
    }, 8000);
  };

  // ── Hack effect ────────────────────────────────────────────────────────
  const HACK_CHARS = "0123456789ABCDEF!@#$%^&*<>?/|\\{}[]";
  const hackLine = () =>
    Array.from({ length: 60 }, () => HACK_CHARS[Math.floor(Math.random() * HACK_CHARS.length)]).join(" ");

  const startHack = () => {
    setIsHacking(true);
    let count = 0;
    hackRef.current = setInterval(() => {
      setLines(prev => {
        const last = prev[prev.length - 1];
        if (last?.type === "matrix") {
          return [...prev.slice(0, -1), { ...last, content: hackLine() }];
        }
        return [...prev, { id: nextId(), type: "matrix", content: hackLine() }];
      });
      count++;
      if (count > 40) stopHack();
    }, 80);
  };

  const stopHack = () => {
    if (hackRef.current) { clearInterval(hackRef.current); hackRef.current = null; }
    setIsHacking(false);
    print("ACCESS GRANTED. Welcome, operative.", "success");
  };

  // ── Cowsay ────────────────────────────────────────────────────────────
  const cowsay = (text: string) => {
    const len = Math.max(text.length, 10);
    const top = " " + "_".repeat(len + 2);
    const mid = `< ${text.padEnd(len)} >`;
    const bot = " " + "-".repeat(len + 2);
    return [
      top, mid, bot,
      "        \\   ^__^",
      "         \\  (oo)\\_______",
      "            (__)\\       )\\/\\",
      "                ||----w |",
      "                ||     ||",
    ];
  };

  // ── Neofetch ──────────────────────────────────────────────────────────
  const NEOFETCH = [
    "  ┌──────────────────────────────────────────────┐",
    "  │                 mendhu@tech                  │",
    "  ├──────────────────────────────────────────────┤",
    `  │  OS       mendhu.tech OS v2.0.4-stable        │`,
    `  │  Host     Vercel Edge Network                 │`,
    `  │  Kernel   Next.js 15 (App Router)             │`,
    `  │  Shell    JetBrains Mono Terminal             │`,
    `  │  DE       Wireframe / Paper aesthetic         │`,
    `  │  WM       React + Framer Motion               │`,
    `  │  Theme    Warm Paper (#FDFDFB)                │`,
    `  │  Icons    Lucide React                        │`,
    `  │  CPU      PyTorch 2.5 + ERA5 tensors          │`,
    `  │  GPU      K-Net diffusivity field             │`,
    `  │  Memory   165,000+ training samples           │`,
    `  │  Uptime   ${new Date().getFullYear() - 2002} yrs (born 2002)              │`,
    "  ├──────────────────────────────────────────────┤",
    "  │  ██ ██ ██ ██ ██ ██ ██ ██   colour palette    │",
    "  └──────────────────────────────────────────────┘",
  ];

  // ── Command processor ──────────────────────────────────────────────────
  const processCommand = useCallback((raw: string) => {
    const cmd   = raw.trim();
    const parts = cmd.split(" ");
    const base  = parts[0].toLowerCase();
    const arg   = parts.slice(1).join(" ");

    // Echo input
    setLines(prev => [...prev, { id: nextId(), type: "input", content: cmd }]);

    // History
    setHistory(h => [cmd, ...h.filter(c => c !== cmd)].slice(0, 50));
    setHistIdx(-1);

    if (!cmd) return;

    switch (base) {
      // ── Navigation ────────────────────────────────────────────────────
      case "goto": {
        const target = arg.toLowerCase();
        if (!target) { print("Usage: goto <section> — try: about, blog, projects, garden, contact", "error"); return; }
        if (!SECTIONS.includes(target)) { print(`Section '${target}' not found. Available: ${SECTIONS.join(", ")}`, "error"); return; }
        print(`// Navigating to #${target}...`, "success");
        setTimeout(() => {
          document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
          onNavigate(target);
        }, 300);
        break;
      }

      case "open": {
        const pid = arg.toLowerCase();
        const proj = PROJECTS.find(p => p.id === pid || p.name.toLowerCase() === pid);
        if (!proj) {
          print(`Project '${arg}' not found.`, "error");
          printLines(PROJECTS.map(p => `  ${p.id.padEnd(12)} — ${p.desc}`));
          return;
        }
        print(`// Booting ${proj.name}...`, "success");
        setTimeout(() => onOpenProject(proj.id), 400);
        break;
      }

      case "garden": {
        print(`// Opening Knowledge Garden${arg ? ` → ${arg}` : ""}...`, "success");
        setTimeout(() => onOpenGarden(arg || undefined), 300);
        break;
      }

      // ── ls ────────────────────────────────────────────────────────────
      case "ls": {
        printLines([
          "drwxr-xr-x  sections/",
          ...SECTIONS.map(s => `  -rw-r--r--  ${s}`),
          "",
          "drwxr-xr-x  projects/",
          ...PROJECTS.map(p => `  -rw-r--r--  ${p.id.padEnd(14)} ${p.desc}`),
        ]);
        break;
      }

      // ── Info ──────────────────────────────────────────────────────────
      case "whoami": {
        printLines([
          "  Atharva Mendhulkar",
          "  ──────────────────────────────────────────────",
          "  Role    : Systems Engineer & AI Researcher",
          "  College : VIT Vellore (B.Tech CSE)",
          "  Research: Physics-Informed ML, Kernel Systems",
          "  Patent  : UPRS — Predictive Hang Detection (IPA 1970)",
          "  Email   : mendhu36@outlook.com",
          "  GitHub  : github.com/Atharva-Mendhulkar",
        ]);
        break;
      }

      case "stack": {
        printLines([
          "  ┌─ Frontend ───────────────────────────────────",
          "  │  Next.js 15, React, TypeScript, Tailwind CSS",
          "  │  Framer Motion, Three.js, D3 force graph",
          "  ├─ Research ───────────────────────────────────",
          "  │  PyTorch 2.5, ERA5 reanalysis, CPCB sensor data",
          "  │  Physics-Informed Neural Networks (PINN)",
          "  ├─ Systems ────────────────────────────────────",
          "  │  C, Linux Kernel (GPL v2), Netlink/GENL",
          "  │  EMA prediction, tracepoints, hash tables",
          "  ├─ SaaS ───────────────────────────────────────",
          "  │  Node.js, Socket.IO, PostgreSQL, Redis, Stripe",
          "  └─ Infra ──────────────────────────────────────",
          "     Vercel, Supabase, Hashnode, GitHub Actions",
        ]);
        break;
      }

      case "research": {
        printLines([
          "  research.json — knowledge graph nodes",
          "  ────────────────────────────────────────────",
          "  Use 'garden' to open the interactive graph.",
          "  Use 'garden <node-id>' to jump to a specific note.",
          "",
          "  Top nodes:",
          "  · pinn_abstract    — JointPINN overview",
          "  · pinn_pde         — Advection-diffusion equation",
          "  · avara_main       — Agent security architecture",
          "  · kphd             — Kernel hang detection",
          "  · temporal_stability — Cross-project concept",
        ]);
        break;
      }

      case "links": {
        printLines([
          "  External links:",
          "  · github    https://github.com/Atharva-Mendhulkar",
          "  · twitter   https://x.com/atharvanta",
          "  · blog      https://blog.mendhu.tech",
          "  · resume    https://drive.google.com/file/d/1fRhtpOOUqrIayHYB34IQtjnDG0x1sL3l",
          "  · email     mendhu36@outlook.com",
        ]);
        break;
      }

      case "cv":
      case "resume": {
        print("// Opening resume in new tab...", "success");
        setTimeout(() => window.open("https://drive.google.com/file/d/1fRhtpOOUqrIayHYB34IQtjnDG0x1sL3l/view", "_blank"), 300);
        break;
      }

      // ── Fun ───────────────────────────────────────────────────────────
      case "porygon": {
        printLines(PORYGON_ASCII, "ascii");
        print("Type 2 = Normal-type. Made of programming code. Loves portfolios.", "system");
        break;
      }

      case "doom": {
        printLines(DOOM_FRAMES[0].split("\n"), "ascii");
        break;
      }

      case "matrix": {
        print("// Initializing matrix protocol... follow the white rabbit.", "success");
        setTimeout(startMatrix, 500);
        break;
      }

      case "hack": {
        print("// Initiating access sequence...", "system");
        setTimeout(startHack, 300);
        break;
      }

      case "cowsay": {
        const text = arg || "moo";
        printLines(cowsay(text));
        break;
      }

      case "history": {
        if (history.length === 0) { print("No history yet."); return; }
        printLines(history.map((c, i) => `  ${String(i + 1).padStart(3, " ")}  ${c}`));
        break;
      }

      case "neofetch": {
        printLines(NEOFETCH, "ascii");
        break;
      }

      // ── System ────────────────────────────────────────────────────────
      case "help": {
        printLines(HELP_TEXT, "output");
        break;
      }

      case "clear": {
        setLines([]);
        return;
      }

      case "exit":
      case "q": {
        closeTerminal();
        return;
      }

      // ── Easter eggs ───────────────────────────────────────────────────
      case "sudo": {
        print("Nice try. This portfolio runs rootless containers.", "error");
        break;
      }
      case "rm": {
        if (arg.includes("-rf") || arg.includes("/")) {
          print("❌ Segmentation fault (core dumped) — just kidding. Portfolio is read-only.", "error");
        } else {
          printError(cmd);
        }
        break;
      }
      case "vim": { print("// vim opened. Good luck exiting. Try :q! — actually, just type 'exit'.", "system"); break; }
      case "git": { print("// git: 'git push origin main' — already deployed on Vercel.", "system"); break; }
      case "npm":
      case "bun":
      case "node": { print("// Runtime detected. This is a browser, not a terminal (but we try harder).", "system"); break; }
      case "ping": { print(`PING ${arg || "mendhu.tech"}: 56 bytes. Reply from Vercel Edge: time=0.8ms ttl=64`, "output"); break; }
      case "curl":
      case "wget": { print("// Network: CORS says no. Portfolio says: just read the screen.", "error"); break; }
      case "cat": {
        if (arg.includes("flag") || arg.includes("secret")) {
          print("CTF{m3ndhu_t3ch_15_n0t_4_CTF_but_g00d_tr7}", "success");
        } else {
          print(`cat: ${arg}: No such file in browser filesystem. Try 'research' or 'stack'.`, "error");
        }
        break;
      }
      case "ls -la":
      case "ls -l": {
        printLines([
          "total 48",
          "drwxr-xr-x  8 mendhu mendhu 4096 Apr 2026 .",
          "drwxr-xr-x  3 root   root   4096 Jan 2026 ..",
          "-rw-r--r--  1 mendhu mendhu  420 Apr 2026 .obsidian/",
          "-rwxr-xr-x  1 mendhu mendhu 8192 Apr 2026 research.json",
          "-rw-r--r--  1 mendhu mendhu 2048 Apr 2026 projects.ts",
          "-rwxr-xr-x  1 mendhu mendhu 4096 Apr 2026 porygon.svg",
          "-rw-r--r--  1 mendhu mendhu  999 Apr 2026 UPRS_patent.pdf",
        ]);
        break;
      }
      case "uname": {
        print("mendhu.tech OS v2.0.4-stable #1 SMP Next.js 15 x86_64 Browser", "output");
        break;
      }

      default: {
        printError(base);
        print(`Did you mean: ${ALL_COMMANDS.filter(c => c.startsWith(base[0])).slice(0,3).join(", ") || "help"}?`, "system");
      }
    }
  }, [history, onNavigate, onOpenProject, onOpenGarden]);

  // ── Input handling ─────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const cmd = input.trim();
      setInput("");
      setSuggestion("");
      if (cmd) processCommand(cmd);
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (suggestion) {
        setInput(prev => prev + suggestion);
        setSuggestion("");
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(idx);
      setInput(history[idx] ?? "");
      setSuggestion("");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? "" : history[idx] ?? "");
      setSuggestion("");
    } else if (e.key === "`") {
      e.preventDefault();
      closeTerminal();
    }
  };

  // ── Line renderer ──────────────────────────────────────────────────────
  const renderLine = (line: TerminalLine) => {
    const arr = Array.isArray(line.content) ? line.content : [line.content];
    const color = {
      input:   "text-[#00FF88]",
      output:  "text-[rgba(255,255,255,0.75)]",
      error:   "text-red-400",
      success: "text-[#00FF88]",
      system:  "text-[rgba(255,255,255,0.35)]",
      ascii:   "text-[#00FF88]",
      matrix:  "text-[#00FF88] opacity-80",
    }[line.type];

    const prefix = line.type === "input" ? "$ " : "  ";

    return (
      <div key={line.id} className="mb-0.5">
        {arr.map((l, i) => (
          <div key={i} className={`font-mono text-[12px] leading-[1.6] whitespace-pre ${color}`}>
            {i === 0 && line.type === "input" ? (
              <span><span className="text-accent font-bold">atharva@mendhu</span><span className="text-[rgba(255,255,255,0.3)]">:</span><span className="text-[#00FF88]">~</span><span className="text-[rgba(255,255,255,0.3)]">$</span> <span>{l}</span></span>
            ) : (
              <span>{l}</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* Keyboard hint — shown on page */}
      {!isOpen && (
        <button
          onClick={toggleTerminal}
          className="fixed bottom-6 left-6 z-[9000] font-mono text-[9px] text-ink-faint border border-dashed border-border-strong px-3 py-1.5 hover:text-accent hover:border-accent transition-all bg-paper/80 backdrop-blur-sm"
          title="Open terminal"
        >
          [`] terminal
        </button>
      )}

      {/* Terminal window */}
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-end justify-center pb-0 pointer-events-none">
          <div
            className="pointer-events-auto w-full max-w-[960px] mx-auto"
            style={{ height: "55vh" }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border-t border-l border-r border-dashed border-[rgba(255,255,255,0.12)]">
              <button onClick={closeTerminal} className="w-3 h-3 rounded-full bg-red-500/70 hover:bg-red-500 border border-red-600/30 flex items-center justify-center group">
                <span className="text-[6px] text-red-900 opacity-0 group-hover:opacity-100">✕</span>
              </button>
              <div className="w-3 h-3 rounded-full bg-yellow-500/70 border border-yellow-600/30" />
              <div className="w-3 h-3 rounded-full bg-green-500/70 border border-green-600/30" />
              <div className="flex-1 text-center font-mono text-[10px] text-[rgba(255,255,255,0.2)] tracking-widest">
                mendhu@terminal — bash — 960×480
              </div>
              <div className="font-mono text-[9px] text-[rgba(255,255,255,0.2)] border border-dashed border-[rgba(255,255,255,0.1)] px-2 py-0.5">
                [` ] close
              </div>
            </div>

            {/* Terminal body */}
            <div
              className="relative bg-[#0A0A0A] border-l border-r border-b border-dashed border-[rgba(255,255,255,0.1)] overflow-hidden"
              style={{ height: "calc(100% - 32px)" }}
              onClick={() => inputRef.current?.focus()}
            >
              {/* Matrix canvas */}
              {isMatrix && (
                <canvas ref={matrixRef} className="absolute inset-0 z-10 w-full h-full" />
              )}

              {/* Diagonal hatch overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: "repeating-linear-gradient(-45deg, rgba(0,255,136,1) 0, rgba(0,255,136,1) 1px, transparent 1px, transparent 8px)" }}
              />

              {/* Scroll area */}
              <div
                ref={scrollRef}
                className="h-full overflow-y-auto px-4 pt-3 pb-2"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#1a1a1a #0a0a0a" }}
              >
                {lines.map(renderLine)}

                {/* Input row */}
                {!isBooting && !isMatrix && (
                  <div className="flex items-center gap-1 mt-1 font-mono text-[12px]">
                    <span className="text-accent font-bold">atharva@mendhu</span>
                    <span className="text-[rgba(255,255,255,0.3)]">:</span>
                    <span className="text-[#00FF88]">~</span>
                    <span className="text-[rgba(255,255,255,0.3)]">$</span>
                    <span className="relative flex-1 ml-1">
                      <input
                        ref={inputRef}
                        value={input}
                        onChange={e => { setInput(e.target.value); updateSuggestion(e.target.value); }}
                        onKeyDown={handleKeyDown}
                        className="bg-transparent outline-none text-[#00FF88] font-mono text-[12px] w-full caret-[#00FF88]"
                        spellCheck={false}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                      />
                      {/* Ghost suggestion */}
                      {suggestion && (
                        <span className="absolute left-0 top-0 font-mono text-[12px] text-[rgba(255,255,255,0.2)] pointer-events-none whitespace-pre">
                          {input}<span>{suggestion}</span>
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {isBooting && (
                  <div className="font-mono text-[12px] text-[rgba(255,255,255,0.3)] mt-1">
                    <span className="animate-pulse">Booting</span>
                    <span className="cursor-blink ml-1">▋</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
