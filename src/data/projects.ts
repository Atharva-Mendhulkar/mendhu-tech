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
    id: "floework",
    slug: "floework",
    title: "floework",
    subtitle: "Enterprise-Grade, Human-Aware SaaS Execution Platform",
    category: "SaaS",
    status: "live",
    statusLabel: "Live · AWS Certified",
    oneLiner: "Enterprise-grade collaborative execution platform featuring zero-lock OCC, SQS FIFO workers, DAG dependency cycle detection, and decoupled Multi-AZ AWS infrastructure.",
    terminalBoot: [
      "$ boot --target FLOEWORK",
      "Initializing Decoupled Multi-AZ AWS VPC...",
      "Mounting Fastify Modular Monolith on ECS Fargate...",
      "Binding RDS PostgreSQL 16 & SQS FIFO queues...",
      "Verifying Zero-Lock OCC & DAG cycle detector...",
      "$ cat ./README.md"
    ],
    techStack: ["Fastify", "PostgreSQL 16", "AWS ECS", "Terraform", "SQS FIFO", "Docker", "React 18", "Bedrock"],
    tags: ["SaaS", "AWS Multi-AZ", "Distributed Systems", "Cloud Architecture", "Real-Time"],
    metrics: [
      { label: "Cloud Infra", value: "Multi-AZ AWS" },
      { label: "Automated Tests", value: "240 (100%)" },
      { label: "Concurrency", value: "Zero-Lock OCC" },
      { label: "Worker Latency", value: "< 15ms" }
    ],
    features: [
      {
        id: "occ",
        heading: "Zero-Lock Optimistic Concurrency Control",
        body: "Eliminates destructive database row locks during high-frequency collaborative sprint planning. Every task mutation enforces version sequencing, returning HTTP 409 Conflict (STALE_UPDATE) on race conditions with randomized jitter reconciliation (50–200ms) and structured audit logging.",
        media: { type: "diagram", label: "OCC Conflict Reconciliation" }
      },
      {
        id: "cloud-architecture",
        heading: "Decoupled Multi-AZ Cloud Infrastructure",
        body: "Engineered according to the AWS Well-Architected Framework: Fastify modular monolith on ECS Fargate across private subnets, Amazon RDS PostgreSQL 16 Multi-AZ standby, DynamoDB-backed API Gateway WebSockets, and CloudFront CDN with Origin Access Control (OAC).",
        media: { type: "diagram", label: "Target Cloud Architecture" }
      },
      {
        id: "fifo-workers",
        heading: "Asynchronous SQS FIFO & Worker Pools",
        body: "Heavy operations (stability scoring, audit events, notifications) offload to Amazon SQS FIFO queues (focus-completion, audit-logs, notifications). Handlers respond immediately with HTTP 202 Accepted (< 15ms latency) while resilient workers leverage 20s long polling and automated DLQ routing after 3 retries.",
        media: { type: "diagram", label: "SQS FIFO & DLQ Pipeline" }
      },
      {
        id: "dag-intelligence",
        heading: "DAG Cycle Detection & Execution Graph",
        body: "Server-side 3-color topological DFS (UNVISITED, VISITING, VISITED) rejects self-loops and circular dependencies (A → B → C → A) with HTTP 400. Calculates real-time downstream blocker cascades, critical path analysis, and Amazon Bedrock (Claude 3.5 Sonnet) executive sprint synthesis.",
        media: { type: "dashboard", label: "Execution Intelligence Graph" }
      }
    ],
    links: { github: "https://github.com/Atharva-Mendhulkar/floework", paper: null, demo: "https://floework.vercel.app" }
  },
  {
    id: "avara",
    slug: "avara",
    title: "AVARA",
    subtitle: "Autonomous Validation & Agent Risk Authority",
    category: "AI Systems",
    status: "complete",
    statusLabel: "Open Source · Production-Ready",
    oneLiner: "Always-on runtime control plane for autonomous AI agents — enforcing intent alignment, ephemeral IAM, provenance, and human-in-the-loop safety at execution time.",
    terminalBoot: [
      "$ boot --target AVARA",
      "Loading AVARA Runtime Authority...",
      "Mounting agent IAM service...",
      "Initializing intent validator...",
      "Wiring circuit breaker + audit ledger...",
      "$ cat ./AVARA.md"
    ],
    techStack: ["Python", "FastAPI", "Docker", "SQLite", "LangGraph", "LangChain"],
    tags: ["AI Security", "Agent Governance", "Runtime Safety", "LLM"],
    metrics: [
      { label: "Security layers", value: "8 guards" },
      { label: "Runtime overhead", value: "< 5ms" },
      { label: "Audit replayable", value: "100%" },
      { label: "Integration", value: "3 lines" }
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
    links: { github: "https://github.com/Atharva-Mendhulkar/AVARA", paper: null, demo: null }
  },
  {
    id: "kphd",
    slug: "kphd",
    title: "K-PHD",
    subtitle: "Kernel-level Predictive Hang Detector",
    category: "Systems",
    status: "complete",
    statusLabel: "Linux Kernel · GPL v2",
    oneLiner: "Embeds into Linux scheduler hot-paths to measure nanosecond-level process wait times and predict CPU starvation before applications hang.",
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
      { label: "Precision", value: "94%" },
      { label: "Lead time", value: "1.5s - 2.8s" },
      { label: "Overhead", value: "< 0.5%" },
      { label: "Ring-0 Memory", value: "< 2MB" }
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
    id: "uprs",
    slug: "uprs",
    title: "UPRS",
    subtitle: "Universal Process Responsiveness System",
    category: "Systems",
    status: "patent-pending",
    statusLabel: "Patent Published · Indian Patent Act 1970",
    oneLiner: "Proactive OS daemon operating in the 0.5–5.0s pre-hang window, using 46-dim cross-signal kernel telemetry and XGBoost to apply reversible scheduling mitigations before UI freeze.",
    terminalBoot: [
      "$ boot --target UPRS",
      "Interfacing XNU/Linux Kernel Telemetry (14 raw metrics @ 100Hz)...",
      "Mounting Sliding-Window RingBuffer (O(1) allocation)...",
      "Extracting 46-dim Cross-Signal Vectors (Contention / Livelock)...",
      "Loading XGBoost Softmax Inference Engine (P-Hang calibrated)...",
      "Arming SafetyGate & Reversible MitigationExecutor (Plan-Apply-Commit)...",
      "$ cat ./PATENT_SPEC_FORM_2.md"
    ],
    techStack: ["Swift", "C Bridge", "XNU / Mach Kernel", "Linux /proc", "CoreML", "XGBoost", "POSIX"],
    tags: ["Operating Systems", "Kernel Telemetry", "Patent", "Machine Learning", "Reliability"],
    metrics: [
      { label: "Predictive Lead", value: "0.5s – 5.0s" },
      { label: "Hang Precision", value: "92.5%" },
      { label: "Freeze Reduction", value: "82% fewer hangs" },
      { label: "Daemon Overhead", value: "< 0.5% CPU" }
    ],
    features: [
      {
        id: "telemetry-cross-signal",
        heading: "46-Dim Cross-Signal Telemetry",
        body: "Queries kernel APIs at 100Hz for 14 metrics into an O(1) circular RingBuffer. Synthesizes novel cross-signal indicators (Contention Index, Livelock Detector = IPC Latency × CPU, I/O Thrashing Index) to differentiate legitimate high compute from pathological lock contention.",
        media: { type: "diagram", label: "Cross-Signal Telemetry Matrix" }
      },
      {
        id: "xgboost-inference",
        heading: "Calibrated XGBoost Softmax Inference",
        body: "Extracts statistical aggregates and cross-signals across a 2.0s sliding window into a 46-dimensional vector. Evaluated by a CoreML-wrapped XGBoost model (100 estimators, max depth 6) with Softmax probability normalization P(Hang) in under 5ms.",
        media: { type: "chart", label: "Inference & Hysteresis Pipeline" }
      },
      {
        id: "policy-safety-gate",
        heading: "Hysteresis State Machine & SafetyGate",
        body: "A 3-state machine (NORMAL, PRE_HANG, HANG_IMMINENT) with asymmetric thresholds (0.8 trigger, 0.3 recovery) filters noise. SafetyGate performs strict deterministic checks: rejects interventions on UI Main Thread (TID 0), kernel mutex holders, and system daemons (PID < 100).",
        media: { type: "diagram", label: "SafetyGate Decision Engine" }
      },
      {
        id: "reversible-mitigation",
        heading: "Plan-Apply-Commit Reversible Mitigation",
        body: "Applies non-destructive scheduling interventions via setpriority() nice value shifts outside state locks, paired with PID+StartTime TOCTOU identity validation. Automatically reverts to original priority once normal state is re-established, preserving user data.",
        media: { type: "diagram", label: "Plan-Apply-Commit Protocol" }
      }
    ],
    links: { github: null, paper: null, demo: null }
  },
  {
    id: "stratarl",
    slug: "stratarl",
    title: "StrataRL",
    subtitle: "Forensic-Grade GRPO for Multi-Domain Reasoning in SLMs",
    category: "ML / AI Research",
    status: "complete",
    statusLabel: "Open Source · Research Framework",
    oneLiner: "Forensic-grade GRPO infrastructure for Small Language Models, preventing cross-domain catastrophic forgetting via Stratified Advantage Normalization (SAN).",
    terminalBoot: [
      "$ boot --target StrataRL",
      "Initializing UCB Curriculum Sampler...",
      "Mounting Rollout Engine (vLLM / Qwen2.5-3B)...",
      "Loading SAN Advantage Engine (Stratified Z-Norm)...",
      "Binding SymPy Numeric & Regex Verifiers...",
      "$ cat ./README.md"
    ],
    techStack: ["PyTorch", "Hugging Face", "TRL", "vLLM", "PEFT (QLoRA)", "Weights & Biases", "SymPy"],
    tags: ["Reinforcement Learning", "GRPO", "Small Language Models", "Reasoning", "PyTorch"],
    metrics: [
      { label: "Target Model", value: "Qwen2.5-3B" },
      { label: "VRAM Opt.", value: "1.8GB saved" },
      { label: "Advantage Norm", value: "Per-Stratum Z" },
      { label: "Verification", value: "Zero-PRM Regex" }
    ],
    features: [
      {
        id: "problem",
        heading: "Cross-Stratum Bias & Domain Collapse",
        body: "Standard GRPO on mixed-domain reasoning creates cross-stratum bias: global advantage normalization compares rewards from easy domains (GSM8K) against hard domains (StrategyQA), giving valid hard-domain traces negative normalized advantages and causing catastrophic forgetting.",
        media: { type: "diagram", label: "Cross-Stratum Advantage Degradation" }
      },
      {
        id: "san",
        heading: "Stratified Advantage Normalization (SAN)",
        body: "Per-stratum Z-normalization evaluates rollouts strictly against peers in the same domain. Features zero-variance centering, low-variance dampening to avoid ghost-signal amplification, and ±5.0 advantage clipping.",
        media: { type: "diagram", label: "SAN Normalization Flow" }
      },
      {
        id: "structural-rewards",
        heading: "Zero-PRM Structural Rewards (ST-GRPO)",
        body: "Encodes domain-specific reasoning tags (<decompose>, <compute>, <verify>, <recall>, <synthesize>) directly inside <think> tags. Verified via deterministic SymPy math evaluation, letter match, and regex templates without requiring expensive Process Reward Models.",
        media: { type: "code", label: "Structural Template Verifier" }
      },
      {
        id: "memory-opt",
        heading: "π_ref = π_old & Adaptive Curriculum",
        body: "Captures rollout logprobs on-the-fly to eliminate frozen reference models, saving 1.8GB VRAM to run G=8 rollouts on consumer GPUs. Pairs with an Upper Confidence Bound (UCB) curriculum sampler for dynamic domain scheduling.",
        media: { type: "chart", label: "VRAM & Training Efficiency" }
      }
    ],
    links: { github: "https://github.com/Atharva-Mendhulkar/StrataRL", paper: null, demo: null }
  },
  {
    id: "jointpinn",
    slug: "jointpinn",
    title: "JointPINN",
    subtitle: "Physics-Informed Neural Networks for Atmospheric Transport & Source Inversion",
    category: "ML / AI Research",
    status: "complete",
    statusLabel: "Research · PyTorch 2.5",
    oneLiner: "Embeds atmospheric advection-diffusion-reaction PDEs and a learned dynamic diffusivity field (K-Net) to model urban PM2.5 dispersion and inverse source attribution across 7 years of telemetry.",
    terminalBoot: [
      "$ boot --target JointPINN",
      "Loading 7-Year CAAQMS + ERA5 Reanalysis Telemetry (223k samples)...",
      "Formulating Advection-Diffusion-Reaction PDE Loss Graph...",
      "Mounting DiffusivityNet (K-Net Dynamic Turbulent Diffusivity)...",
      "Initializing 9-layer Tanh MLP (AirQualityNet) & Xavier Uniform...",
      "Executing Inverse Null-Space Recoverability-Aware Bayesian Analysis...",
      "$ cat ./README.md"
    ],
    techStack: ["PyTorch 2.5", "Physics-Informed ML", "ERA5 Meteorology", "Autograd PDEs", "Bayesian UQ", "Python 3.10+"],
    tags: ["PINN", "Atmospheric Physics", "Fluid Dynamics", "Inverse Problems", "Deep Learning"],
    metrics: [
      { label: "Test R² (2025)", value: "0.926" },
      { label: "PDE Pass Rate", value: "100.0%" },
      { label: "Test RMSE", value: "21.05 µg/m³" },
      { label: "Telemetry History", value: "7 Yrs (223k hrs)" }
    ],
    features: [
      {
        id: "pde-transport",
        heading: "Advection-Diffusion-Reaction PDE",
        body: "Bridges purely data-driven ML and atmospheric fluid dynamics by embedding the governing transport PDE: ∂C/∂t + u·∇C = ∇·(K∇C) + S directly into the PyTorch autograd loss graph. Enforces physical mass conservation during extreme winter meteorological inversions.",
        media: { type: "diagram", label: "Transport PDE Loss Graph" }
      },
      {
        id: "k-net-diffusivity",
        heading: "Learned Dynamic Diffusivity (K-Net)",
        body: "Replaces static empirical diffusivity with DiffusivityNet (K-Net), a secondary neural network tied to the autograd graph that dynamically learns the continuous spatio-temporal turbulent diffusivity field K(x, y, t) directly from ERA5 wind vectors, 2m temperature, and Planetary Boundary Layer Height (BLH).",
        media: { type: "chart", label: "Dynamic Diffusivity Field" }
      },
      {
        id: "deep-tanh-architecture",
        heading: "Smooth Higher-Order Gradient Architecture",
        body: "AirQualityNet utilizes a deep, narrow 9-layer × 128-neuron MLP with Xavier Uniform initialization and Tanh activations. Unlike ReLU which zeroes out second-order derivatives, Tanh provides smooth, non-zero spatial Laplacians (∇²C) essential for diffusion physics backpropagation.",
        media: { type: "diagram", label: "Higher-Order Autograd MLP" }
      },
      {
        id: "ra-bpinn-nullspace",
        heading: "Recoverability-Aware Bayesian PINN (RA-BPINN)",
        body: "Solves spectral bias and overconfidence in inverse source identification. Quantifies Degrees of Freedom for Signal (DFS) across the Peclet (Pe) and Damköhler (Da) phase boundary, projecting unobservable modes into null-space uncertainty and achieving 93.8% credible interval coverage.",
        media: { type: "diagram", label: "Observability Null-Space Phase" }
      }
    ],
    links: { github: null, paper: null, demo: null }
  }
];

export const standardProjects: any[] = [];

export const categories = ["all", "ML / AI Research", "AI Systems", "Systems", "SaaS"];
