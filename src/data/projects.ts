export interface Feature {
  id: string;
  heading: string;
  body: string;
  media: { type: string; label: string };
}

export interface Metric {
  label: string;
  value: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  status: "complete" | "publication-track" | "live" | "patent-pending";
  statusLabel: string;
  oneLiner: string;
  terminalBoot: string[];
  techStack: string[];
  tags: string[];
  metrics: Metric[];
  features: Feature[];
  links: { github?: string | null; demo?: string | null; paper?: string | null };
}

export const projects: Project[] = [
  {
    id: "caps",
    slug: "caps",
    title: "CAPS",
    subtitle: "Context-Aware Agentic Payment System · Deterministic Kernel",
    category: "AI Systems",
    status: "complete",
    statusLabel: "Open Source · Research Prototype",
    oneLiner: "A deterministic payment kernel designed to create a trust boundary between AI reasoning and payment execution.",
    terminalBoot: [
      "$ boot --target CAPS",
      "Initializing Deterministic Control Plane...",
      "Loading Policy & Risk Engine (Layers 1-4)...",
      "Mounting Context Evaluator...",
      "Binding Immutable Audit Ledger...",
      "$ cat ./CAPS.md"
    ],
    techStack: ["Python 3.10+", "FastAPI", "Ollama", "Gemini", "JWT", "SQLite"],
    tags: ["Agentic Finance", "Security", "AI Governance", "Deterministic Systems"],
    metrics: [
      { label: "Security gates", value: "4 layers" },
      { label: "Latency", value: "Sub-50ms" },
      { label: "Explainability", value: "Full audit trail" },
      { label: "Decision Logic", value: "Deterministic" }
    ],
    features: [
      {
        id: "philosophy",
        heading: "Trust Gradient & Fail-Closed",
        body: "Trust decreases as data moves towards the LLM and increases as it moves towards the Ledger. The system defaults to a denial state for any ambiguity. The LLM is treated as an untrusted source, strictly decoupled from the control plane.",
        media: { type: "diagram", label: "Trust Gradient Model" }
      },
      {
        id: "architecture",
        heading: "Deterministic Control Plane",
        body: "Includes Schema Validator, Context Evaluator, Policy Engine, Consent Manager, and Decision Router. This trust boundary ensures that no money moves unless all deterministic safety gates pass.",
        media: { type: "diagram", label: "System Architecture" }
      },
      {
        id: "risk",
        heading: "Multi-Layer Defense Model",
        body: "Layer 1: Hard Invariants (Limits). Layer 2: Velocity & Temporal Logic. Layer 3: Agentic Threat Defense (Loop/Chain detection). Layer 4: Behavioral Analysis. Any violation results in an immediate DENY or ESCALATE state.",
        media: { type: "diagram", label: "Policy Layers" }
      },
      {
        id: "audit",
        heading: "Immutable Audit Ledger",
        body: "A write-only, hash-chained record of every action—approved or denied. This provides a forensic trail for post-incident analysis and ensures full accountability for autonomous agent behavior.",
        media: { type: "diagram", label: "Audit Chain" }
      }
    ],
    links: { github: "https://github.com/Atharva-Mendhulkar/CAPS", paper: null, demo: null }
  },
  {
    id: "avara",
    slug: "avara",
    title: "AVARA",
    subtitle: "Autonomous Validation & Agent Risk Authority · Runtime AI Security",
    category: "AI Systems",
    status: "complete",
    statusLabel: "Open Source · Production-Ready",
    oneLiner: "Runtime security and governance layer for autonomous AI agents — enforces intent, permissions, provenance, and safety at execution time, not training time.",
    terminalBoot: [
      "$ boot --target AVARA",
      "Loading AVARA Runtime Authority...",
      "Mounting agent IAM service...",
      "Initializing intent validator...",
      "Wiring circuit breaker + audit ledger...",
      "$ cat ./AVARA.md"
    ],
    techStack: ["FastAPI", "SQLite", "Docker", "Python", "LangChain"],
    tags: ["AI Security", "Agent Governance", "Runtime Safety", "LLM"],
    metrics: [
      { label: "Security layers", value: "8 guards" },
      { label: "Runtime overhead", value: "< 5ms" },
      { label: "Audit replayable", value: "100%" },
      { label: "LangChain Integration", value: "3 lines" }
    ],
    features: [
      {
        id: "problem",
        heading: "Security Didn't Evolve With Agents",
        body: "AI agents crossed a boundary in 2024–2026: autonomous, machine-speed, multi-agent ecosystems. Existing controls (WAF, IAM, RBAC) assume human decision points and deterministic software. Agents violate both. AVARA is an always-on runtime authority between agents and the world.",
        media: { type: "diagram", label: "Security Gap" }
      },
      {
        id: "architecture",
        heading: "8-Layer Guard Architecture",
        body: "Intent Validator (semantic drift detection) → RAG Provenance Firewall (ACL + injection scanning) → Tool & MCP Guard (explicit registration) → Circuit Breaker (human-approval webhooks) → Context Governor (token budget) → Anomaly Detector (behavioral heuristics, auto-revoke) → Agent IAM (ephemeral identity, TTL) → Audit Ledger (full replayable trace).",
        media: { type: "diagram", label: "AVARA System Architecture" }
      },
      {
        id: "circuitbreaker",
        heading: "Circuit Breaker: Human-in-the-Loop",
        body: "Destructive action → halt instantly → SQLite status=PENDING → webhook to Slack/Email → 403 PENDING_APPROVAL returned. Human approves or denies via REST. No zero-click exploits. No silent side effects. The agent waits. This is the control primitive that makes autonomous agents safe to deploy.",
        media: { type: "diagram", label: "Circuit Breaker Webhook Flow" }
      },
      {
        id: "integration",
        heading: "3-Line LangChain Integration",
        body: "AVARALangChainCallback wraps any LangChain agent via callback — no architecture changes required. Intercepts every tool call, validates through all 8 guards, permits or halts. Same pattern for CrewAI and AutoGen via the generic framework adapter. CLI supports interactive REPL and one-command agent provisioning.",
        media: { type: "code", label: "Integration Code" }
      }
    ],
    links: { github: "https://github.com/Atharva-Mendhulkar", paper: null, demo: null }
  },
  {
    id: "kphd",
    slug: "kphd",
    title: "K-PHD",
    subtitle: "Kernel-level Predictive Hang Detector · Linux",
    category: "Systems",
    status: "complete",
    statusLabel: "Linux Kernel · GPL v2",
    oneLiner: "Embeds into the Linux scheduler hot-path to measure nanosecond-level process wait times and predict CPU starvation before applications hang.",
    terminalBoot: [
      "$ boot --target K-PHD",
      "Loading kphd.ko kernel module...",
      "Registering sched_wakeup tracepoint...",
      "Registering sched_switch tracepoint...",
      "Binding Netlink socket GENL...",
      "$ sudo kphd monitor"
    ],
    techStack: ["C", "Linux Kernel", "Netlink", "EMA", "Makefile"],
    tags: ["Kernel Module", "Tracepoints", "Systems", "Predictive"],
    metrics: [
      { label: "Granularity", value: "nanosecond" },
      { label: "Hash buckets", value: "1,024 per-PID" },
      { label: "Warn/Danger", value: "2ms / 5ms" },
      { label: "License", value: "GPL v2" }
    ],
    features: [
      {
        id: "problem",
        heading: "Hangs Are Invisible Until They Happen",
        body: "Application hangs from CPU starvation are only detectable after the fact — when a user reports a frozen UI or a watchdog kills a process. K-PHD moves detection upstream: measuring scheduler wait latency at nanosecond resolution inside the kernel, predicting starvation seconds before it causes a user-visible hang.",
        media: { type: "diagram", label: "Detection Timeline" }
      },
      {
        id: "architecture",
        heading: "3-Layer Kernel Architecture",
        body: "Layer 1 (Kernel Module): sched_wakeup + sched_switch tracepoints, 1,024-bucket hash table per-PID, spin_lock_irqsave() for multi-core safety, Netlink alerts when latency > 1ms. Layer 2 (IPC Bridge): /proc/kphd_stats for snapshots + Netlink multicast for real-time. Layer 3 (EMA Daemon): α=0.3, three severity levels.",
        media: { type: "diagram", label: "K-PHD Architecture" }
      },
      {
        id: "prediction",
        heading: "EMA Predictive Model",
        body: "EMA_t = α·L_t + (1−α)·EMA_{t−1} with α=0.3. Warning at EMA > 2ms. Danger at EMA > 5ms. 3+ consecutive danger alerts = CPU starvation imminent. EMA computed in userspace daemon to keep floating-point math out of the kernel hot-path — kernel only does integer timestamp subtraction.",
        media: { type: "chart", label: "EMA Latency Model" }
      }
    ],
    links: { github: "https://github.com/Atharva-Mendhulkar/K-PHD", paper: null, demo: null }
  },
  {
    id: "floework",
    slug: "floework",
    title: "Floework",
    subtitle: "Human-Aware SaaS Productivity · Focus → Effort → Outcome Causal Chain",
    category: "SaaS",
    status: "live",
    statusLabel: "Live · floework.vercel.app",
    oneLiner: "Replaces time-tracking with behavioral signal analysis — models the causal chain Focus → Effort → Task Progress → Team Outcome.",
    terminalBoot: [
      "$ boot --target FLOEWORK",
      "Connecting to Supabase PostgreSQL...",
      "Initializing Socket.IO real-time layer...",
      "Mounting execution intelligence engine...",
      "Loading focus session state machine...",
      "$ cat ./apps/web/README.md"
    ],
    techStack: ["React", "Node.js", "PostgreSQL", "Redis", "Socket.IO", "Stripe", "Supabase"],
    tags: ["SaaS", "Productivity", "Real-Time", "Analytics"],
    metrics: [
      { label: "Execution signals", value: "7 signals" },
      { label: "Real-time", value: "WebSocket" },
      { label: "Architecture", value: "Multi-tenant" },
      { label: "Deployment", value: "Cloud-native" }
    ],
    features: [
      {
        id: "problem",
        heading: "The Structural Gap in Productivity Tools",
        body: "Every existing tool (Jira, Notion, Toggl) tracks that delays happen, not why. No platform models causality: Focus State → Effort Signals → Task Progress → Team Outcome. Floework tracks execution causality through 7 behavioral signals computed per user per sprint.",
        media: { type: "diagram", label: "Causal Model of Work" }
      },
      {
        id: "architecture",
        heading: "Full-Stack SaaS Architecture",
        body: "React + Redux + Tailwind + shadcn/ui frontend. Node.js + Express + Socket.IO + BullMQ async workers backend. Dual database: PostgreSQL (Supabase) as source of truth for tasks/sessions/billing + Redis for real-time focus session state and 15-min analytics cache. Stripe webhook billing with 3-tier plans.",
        media: { type: "diagram", label: "System Architecture" }
      },
      {
        id: "intelligence",
        heading: "7-Signal Execution Intelligence Engine",
        body: "Effort Density (focus hours / estimated hours), Resume Rate (sessions per task — context-switch proxy), Blocker Risk (high effort + stalled status composite), Focus Stability Heatmap (7×24 peak cognitive window grid), Burnout Risk Trend (4-week rolling — penalizes fragmentation + after-hours), Predictive Delivery Engine (velocity vs sprint backlog), Context-Switch Audit (PR wait-time via GitHub webhook).",
        media: { type: "dashboard", label: "Analytics Dashboard" }
      },
      {
        id: "realtime",
        heading: "Real-Time Collaboration Layer",
        body: "Socket.IO WebSocket events propagate task state changes instantly. Team presence avatars show In Focus (pulsing blue ring), Available (green), Offline (grey) from live Redis session state. Task locking prevents concurrent edits. FlowBoard Kanban syncs without page refresh. All events logged to Execution Event timeline for replay.",
        media: { type: "screen", label: "Live FlowBoard" }
      }
    ],
    links: { github: "https://github.com/Atharva-Mendhulkar/floework", paper: null, demo: null}
  }
];

export const standardProjects: any[] = [];

export const categories = ["all", "ML / AI Research", "AI Systems", "Systems", "SaaS"];
