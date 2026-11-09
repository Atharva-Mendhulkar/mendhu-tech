export interface Feature {
  id: string;
  heading: string;
  body: string;
  media: { type: string; label: string };
  mermaid?: string;
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
  // 1st: floework
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
        media: { type: "diagram", label: "OCC Conflict Reconciliation" },
        mermaid: `flowchart LR
    Client["Client Write (v=1)"] --> Gate{"OCC Version Gate\\nv == v_db ?"}
    Gate -->|Match| Commit["Commit v=2\\n200 OK Broadcast"]
    Gate -->|Mismatch| Conflict["HTTP 409 Conflict\\nSTALE_UPDATE"]
    Conflict --> Jitter["Reconciliation Loop\\nJitter 50-200ms"]
    Jitter --> Client`
      },
      {
        id: "cloud-architecture",
        heading: "Decoupled Multi-AZ Cloud Infrastructure",
        body: "Engineered according to the AWS Well-Architected Framework: Fastify modular monolith on ECS Fargate across private subnets, Amazon RDS PostgreSQL 16 Multi-AZ standby, DynamoDB-backed API Gateway WebSockets, and CloudFront CDN with Origin Access Control (OAC).",
        media: { type: "diagram", label: "Target Cloud Architecture" },
        mermaid: `flowchart TD
    subgraph Edge ["AWS Edge Perimeter"]
        CF["CloudFront CDN + OAC"]
        ALB["Application Load Balancer (ALB)"]
        APIGW["API Gateway WebSockets"]
    end
    subgraph VPC ["Amazon VPC (Multi-AZ 10.0.0.0/16)"]
        subgraph AppSubnets ["Private App Subnets"]
            ECS["ECS Fargate Tasks (Port 3000)\\nFastify Modular Monolith"]
            Workers["SQS Background Worker Pool"]
        end
        subgraph DataSubnets ["Isolated Data Subnets"]
            RDS[("RDS PostgreSQL 16\\nMulti-AZ Standby gp3")]
            DDB[("DynamoDB WS Registry")]
        end
    end
    subgraph Managed ["Managed Cloud Services"]
        SQS["SQS FIFO Queues"]
        DLQ["Dead-Letter Queues (DLQs)"]
        Bedrock["Amazon Bedrock (Claude 3.5)"]
    end

    CF --> ALB
    ALB --> ECS
    APIGW --> DDB
    ECS --> RDS
    ECS --> SQS
    SQS --> Workers
    Workers --> RDS
    Workers -. Failure > 3 .-> DLQ
    ECS --> Bedrock`
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

  // 2nd: AVARA
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
        media: { type: "diagram", label: "AVARA System Architecture" },
        mermaid: `flowchart TD
    Agent["Autonomous Agent\\n(LangGraph / CrewAI)"] --> Gateway["AVARA Control Gateway\\n(<5ms Execution Guard)"]
    subgraph Guards ["8-Layer Security Perimeter"]
        IV["Intent Validator\\nSemantic Drift"]
        RF["RAG Provenance Firewall\\nACL & Prompt Injection"]
        TG["Tool & MCP Guard\\nSchema Validation"]
        CB["Circuit Breaker\\nHuman-in-the-Loop"]
    end
    Gateway --> Guards
    Guards --> Audit[("Tamper-Evident\\nAudit Ledger")]
    Guards --> External["Target Environment\\n(APIs / Tools / DBs)"]`
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

  // 3rd: UPRS
  {
    id: "uprs",
    slug: "uprs",
    title: "UPRS",
    subtitle: "Universal Process Responsiveness System",
    category: "Systems",
    status: "patent-pending",
    statusLabel: "Patent Published · Indian Patent Act 1970",
    oneLiner: "Proactive OS-level daemon operating in the 0.5–5.0s pre-hang window, using 46-dimensional cross-signal kernel telemetry and XGBoost to apply reversible scheduling mitigations before user-visible freeze.",
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
        heading: "14-Metric Kernel Abstraction & Cross-Signals",
        body: "Queries kernel APIs (Mach task_info on macOS, /proc on Linux) at 100Hz for 14 raw metrics into an O(1) circular RingBuffer (20 samples, 2.0s window). Synthesizes novel cross-signal indicators that isolate pathological contention from heavy legitimate compute: Contention Index = (lock_wait > 5ms) × (run_queue_delay > 50ms), Livelock Detector = (ipc_latency > 100µs) × (cpu_usage > 90%), and I/O Thrashing Index = (page_faults > 50/s) × (memory_pressure > 70%).",
        media: { type: "diagram", label: "Cross-Signal Telemetry Matrix" }
      },
      {
        id: "xgboost-inference",
        heading: "Calibrated Softmax XGBoost Inference",
        body: "Derives statistical moments (mean, std dev, min, max, linear trend slope) and cross-signal interactions into a 46-dimensional vector evaluated by an optimized CoreML XGBoost ensemble (100 estimators, max depth 6, SMOTE balanced). Applies Softmax probability normalization: P(class_i) = exp(z_i) / Σ exp(z_j) in <5ms, achieving 92.5% precision (PRE_HANG) with <1% false positive rate.",
        media: { type: "chart", label: "Inference & Hysteresis Pipeline" }
      },
      {
        id: "policy-safety-gate",
        heading: "Hysteresis State Machine & SafetyGate",
        body: "Filters transient noise using a 3-state machine (NORMAL, PRE_HANG, HANG_IMMINENT) with asymmetric hysteresis thresholds: escalation at P > 0.8, de-escalation at P < 0.3. Prior to executing mitigation, SafetyGate applies deterministic validation: aborts if target thread is the UI Main Thread (TID 0), if the thread holds kernel mutexes (preventing system-wide lock cascades), or if the process is a root daemon (PID < 100).",
        media: { type: "diagram", label: "SafetyGate Decision Engine" }
      },
      {
        id: "reversible-mitigation",
        heading: "Plan-Apply-Commit Reversible Mitigation",
        body: "Executes non-destructive OS scheduling interventions via setpriority() nice value shifts (+10) outside state locks to eliminate priority inversion. Anchors identity to a (PID, StartTime) tuple to neutralize TOCTOU PID-reuse attacks. Caches pre-mitigation state and automatically rolls back to original priority upon transition back to NORMAL, achieving an 82% reduction in user-visible freezes with zero application restarts or data loss.",
        media: { type: "diagram", label: "Plan-Apply-Commit Protocol" }
      },
      {
        id: "uprs-architecture",
        heading: "End-to-End Daemon System Architecture",
        body: "Operates as a 4-tier closed-loop daemon: 1. Data Acquisition Layer (queries Mach task_info and /proc at 100Hz into an O(1) 20-slot RingBuffer with zero allocation on the measurement path) → 2. Intelligence Layer (extracts 46-dimensional statistical moments and cross-signal interaction terms, evaluated by CoreML XGBoost to output calibrated Softmax probabilities P(Hang) in <5ms) → 3. Decision Layer (evaluates state transitions across NORMAL, PRE_HANG, and HANG_IMMINENT via 0.8/0.3 hysteresis thresholds and SafetyGate deterministic checks) → 4. Action & Mitigation Layer (executes TOCTOU-safe Plan-Apply-Commit priority adjustments with transaction logging and automatic rollback upon state normalization).",
        media: { type: "diagram", label: "End-to-End System Architecture" },
        mermaid: `flowchart TD
    subgraph L1 ["1. Data Acquisition Layer"]
        Mach["Mach task_info & /proc\\n100Hz Non-Blocking Polling"] --> Ring["O(1) 20-Slot RingBuffer\\nZero-Alloc Sliding Window"]
    end
    subgraph L2 ["2. Intelligence Layer"]
        Ring --> Feat["46-Dim Features\\nMoments & Cross-Signals"]
        Feat --> XGB["XGBoost CoreML Engine\\nSoftmax P(Hang) < 5ms"]
    end
    subgraph L3 ["3. Decision Layer"]
        XGB --> Hyst["Hysteresis State Machine\\n(0.8 Imminent / 0.3 Normal)"]
        Hyst --> Safety["SafetyGate Deterministic Filter\\nMain Thread TID 0 & Kernel Lock Guard"]
    end
    subgraph L4 ["4. Action & Mitigation Layer"]
        Safety --> PAC["Plan-Apply-Commit Protocol\\n(PID, StartTime) Anti-TOCTOU"]
        PAC --> Nice["setpriority(nice + 10)\\nNon-Destructive Priority Shift"]
        Nice -. State Normalized .-> Rollback["Auto-Rollback\\nZero Data Loss"]
    end`
      },
      {
        id: "uprs-novelty-points",
        heading: "Core Patent Novelties & Technical Claims",
        body: "Key patent claims under Indian Patent Act 1970: [1] Predictive Lead-Time Window — operates proactively in the 0.5s–5.0s pre-hang window before the OS WindowServer manifests unresponsiveness. [2] Cross-Signal Contention Analysis — novel multi-variate metrics (Contention Index, Livelock Detector, I/O Thrashing) isolate lock contention from legitimate heavy compute. [3] Non-Destructive Reversible Interventions — modifies thread scheduling priority (+10 nice) with automatic zero-data-loss rollback upon state recovery. [4] TOCTOU Neutralization — binds target identity to a (PID, StartTime) cryptographic tuple, preventing PID recycling race conditions. [5] Deterministic Safety Gate — zero-risk exclusion blocking interventions on UI Main Threads (TID 0), kernel lock holders, and system daemons. [6] Intervention-Aware Drift Guard — downweights mitigation feedback (0.7x factor) to prevent recursive model bias.",
        media: { type: "diagram", label: "Patent Novelty & Breakthrough Matrix" },
        mermaid: `flowchart LR
    subgraph Reactive ["Prior Art: Reactive OS Watchdogs"]
        P1["4s-5s Delay\\nWindowServer Beachball"]
        P2["Destructive Force-Quit\\nUnsaved Data Loss"]
        P3["Coarse Global Metrics\\nNo Contention Isolation"]
    end
    subgraph Predictive ["UPRS Patent Novelties (Section 3(k))"]
        N1["0.5s-5.0s Predictive Lead Window\\nProactive Intervention"]
        N2["Cross-Signal Contention Engine\\nContention = Lock × Queue"]
        N3["Reversible +10 Nice Priority Shift\\nZero Data Loss Rollback"]
        N4["TOCTOU-Safe Identity Binding\\nCryptographic (PID, StartTime)"]
    end
    Reactive -. Replaced By .-> Predictive`
      }
    ],
    links: { github: null, paper: null, demo: null }
  },

  // 4th: StrataRL
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
        media: { type: "diagram", label: "SAN Normalization Flow" },
        mermaid: `flowchart TD
    subgraph Rollout ["Rollout Generation (vLLM)"]
        Batch["Mixed-Domain Batch (G=8)\\n(GSM8K Math + StrategyQA Reasoning)"]
    end
    subgraph Stratification ["Stratum Partitioning & SAN"]
        S1["Stratum 1 (GSM8K)"]
        S2["Stratum 2 (StrategyQA)"]
        Z1["Per-Stratum Z-Score (μ_1, σ_1)\\nZero-Variance Centering"]
        Z2["Per-Stratum Z-Score (μ_2, σ_2)\\nZero-Variance Centering"]
    end
    subgraph PolicyUpdate ["GRPO Gradient Optimization"]
        Verify["Deterministic SymPy & Regex Verifiers"]
        Loss["Policy Gradient Step\\nπ_ref = π_old (-1.8GB VRAM)"]
    end

    Batch --> S1 & S2
    S1 --> Z1
    S2 --> Z2
    Z1 & Z2 --> Loss
    Verify --> Loss`
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

  // 5th: JointPINN
  {
    id: "jointpinn",
    slug: "jointpinn",
    title: "JointPINN",
    subtitle: "Physics-Informed Neural Networks for Atmospheric Transport & Source Inversion",
    category: "ML / AI Research",
    status: "complete",
    statusLabel: "Research · PyTorch 2.5",
    oneLiner: "Physics-Informed Neural Network with dynamic turbulent diffusivity (K-Net) embedding advection-diffusion-reaction PDEs and Bayesian null-space analysis to model urban PM2.5 transport and inverse source attribution.",
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
        heading: "Governing Transport PDE & Physics Loss",
        body: "Embeds the continuous atmospheric advection-diffusion-reaction Partial Differential Equation directly into the PyTorch autograd loss graph: ∂C/∂t + u·∇C = ∇·(K∇C) + S, where u=(u,v) represents ERA5 horizontal wind vectors, K is turbulent diffusivity, and S represents emission sources/sinks. Reaches a 100.0% PDE physical compliance pass rate, strictly conserving mass during shallow nocturnal winter inversions (Boundary Layer Height < 150m) where pure ML models extrapolate catastrophically.",
        media: { type: "diagram", label: "Transport PDE Loss Graph" }
      },
      {
        id: "k-net-diffusivity",
        heading: "Learned Dynamic Diffusivity Field (K-Net)",
        body: "Transcends static empirical dispersion coefficients through a dual-network JointPINN architecture. Parameterizes the turbulent diffusivity field K via DiffusivityNet (K-Net), a secondary neural network coupled to the PDE computational graph that dynamically learns continuous spatio-temporal diffusivity tensors K(x, y, t) directly from raw ERA5 meteorology (u10, v10, 2m temperature, and boundary layer height blh), discovering unmetered urban emissions inventory-free.",
        media: { type: "chart", label: "Dynamic Diffusivity Field" }
      },
      {
        id: "deep-tanh-architecture",
        heading: "Smooth Higher-Order Gradient Architecture",
        body: "AirQualityNet is engineered as a deep, narrow 9-layer × 128-neuron MLP with Xavier Uniform initialization. The architecture mathematically mandates Tanh activation functions: standard activations like ReLU have zero second derivatives (f''(x)=0), which destroys the spatial Laplacian diffusion operator ∇²C. Tanh provides continuous, non-zero higher-order spatial derivatives, achieving test R² of 0.926 and RMSE of 21.05 µg/m³ across 223,493 hourly samples from 2019–2025.",
        media: { type: "diagram", label: "Higher-Order Autograd MLP" }
      },
      {
        id: "ra-bpinn-nullspace",
        heading: "Recoverability-Aware Bayesian PINN (RA-BPINN)",
        body: "Addresses the fundamental observability limits in inverse source attribution (y = J_S·S + ε). Standard Bayesian PINNs suffer from spectral bias, hallucinating sources in the mathematical null-space of the observation Jacobian J_S (yielding only 52.1% credible interval coverage). RA-BPINN incorporates the Fisher Information Matrix I = J_S^T R^-1 J_S directly into the prior, quantifying Degrees of Freedom for Signal (DFS) across the Peclet (Pe) and Damköhler (Da) phase boundary to restore posterior coverage to 93.8%.",
        media: { type: "diagram", label: "Observability Null-Space Phase" }
      },
      {
        id: "jointpinn-architecture",
        heading: "End-to-End Dual-Network Computational Architecture",
        body: "Couples two concurrent neural subnets within a unified PyTorch autograd loss graph: Primary Network (AirQualityNet: 9-layer × 128-neuron deep MLP parameterized with Tanh activations, mapping 18-dim spatio-temporal coordinates, ERA5 meteorology, and autoregressive lags to scalar PM2.5 fields C(x, y, t)) coupled with an Auxiliary Diffusivity Network (DiffusivityNet / K-Net: parallel MLP learning continuous turbulent mixing tensors K(x, y, t) directly from boundary layer physics). Both networks feed forward through autograd differentiation enforcing the Advection-Diffusion-Reaction PDE: ∂C/∂t + u·∇C = ∇·(K∇C) + S, jointly minimizing L_total = L_data + λ_pde·L_pde + λ_reg·L_reg to strictly conserve pollutant mass across winter inversion layers.",
        media: { type: "diagram", label: "Dual-Network PDE Architecture" },
        mermaid: `flowchart TD
    subgraph Inputs ["Spatio-Temporal & Meteorological Inputs"]
        Coords["(x, y, t) Coordinates"]
        Met["ERA5 Weather (u10, v10, t2m, blh)"]
        AR["Autoregressive Lags (1h, 6h, 24h)"]
    end
    subgraph DualNets ["Coupled Neural Networks"]
        AQNet["AirQualityNet (9x128 Tanh)\\nSmooth Laplacians ∇²C"]
        KNet["DiffusivityNet (K-Net)\\nDynamic Mixing Tensor K(x,y,t)"]
    end
    subgraph AutogradPDE ["PyTorch Autograd PDE Engine"]
        PDE["Transport PDE: ∂C/∂t + u·∇C = ∇·(K∇C) + S"]
        Loss["L_total = L_data + λ_pde·L_pde\\n100.0% Mass Conserved"]
    end
    subgraph UQ ["Bayesian Source Inversion"]
        RA["RA-BPINN Null-Space Guard\\nFisher Information Prior (93.8% Coverage)"]
    end

    Inputs --> DualNets
    DualNets --> AutogradPDE
    AutogradPDE --> UQ`
      },
      {
        id: "jointpinn-novelty-points",
        heading: "Core Research Novelties & Breakthrough Points",
        body: "Fundamental research innovations in physics-informed atmospheric modeling: [1] Dynamic Diffusivity Field (K-Net) — replaces empirical static dispersion constants with a secondary neural subnet learning continuous turbulent diffusivity tensors directly from boundary layer meteorology. [2] Observability Null-Space Isolation (RA-BPINN) — injects the Fisher Information Matrix (I = J_S^T R^-1 J_S) into the prior, eliminating standard B-PINN spectral bias and boosting credible interval coverage from 52.1% to 93.8%. [3] Degrees of Freedom for Signal (DFS) Metric — information-theoretic diagnostic rigorously demarcating where inverse source attribution is mathematically well-posed across Peclet and Damköhler regimes. [4] Higher-Order Autograd Compatibility — mathematically eliminates Laplacian second-derivative vanishing (f''(x)=0 in ReLU) through deep Tanh activation surfaces. [5] Inventory-Free Emission Inversion — discovers unmetered industrial emission rates without reliance on static municipal inventories. [6] 7-Year Empirical Benchmark — validated across 223k samples, achieving test R² = 0.926 and RMSE = 21.05 µg/m³, outperforming 19 classical ML baselines (p < 1e-10).",
        media: { type: "diagram", label: "Research Novelty & Innovation Matrix" },
        mermaid: `flowchart LR
    subgraph Classical ["Classical Baselines & Standard PINNs"]
        C1["Static Dispersion Coefficients"]
        C2["Spectral Bias & Null-Space Hallucination"]
        C3["ReLU Vanishing 2nd Derivatives (f''=0)"]
    end
    subgraph Innovations ["JointPINN Breakthrough Novelties"]
        I1["Dynamic K-Net Diffusivity Tensor"]
        I2["RA-BPINN Fisher Prior (93.8% Coverage)"]
        I3["Deep Tanh Continuous Spatial ∇²"]
        I4["Inventory-Free Emission Discovery"]
    end
    Classical -. Transcended By .-> Innovations`
      }
    ],
    links: { github: null, paper: null, demo: null }
  },

  // 6th: K-PHD
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
        media: { type: "diagram", label: "K-PHD Architecture" },
        mermaid: `flowchart TD
    subgraph KernelSpace ["Layer 1: Linux Kernel Module (Ring 0)"]
        Trace["sched_wakeup & sched_switch Tracepoints"] --> Hash["1,024-Bucket Per-PID Hash Table"]
        Hash --> Spin["spin_lock_irqsave() SMP Concurrency"]
    end
    subgraph IPCBridge ["Layer 2: IPC Bridge"]
        Netlink["GENL Netlink Socket (Latency > 1ms)"]
        Proc["/proc/kphd_stats Fast Snapshot Ring"]
    end
    subgraph UserSpace ["Layer 3: Userspace EMA Daemon"]
        EMA["EMA Engine (α=0.3)\\nEarly Starvation Detection"]
        Alert["Kernel Pre-Hang Alarm (1.5s - 2.8s Lead Time)"]
    end

    KernelSpace --> IPCBridge
    IPCBridge --> UserSpace`
      },
      {
        id: "prediction",
        heading: "EMA Predictive Model",
        body: "EMA_t = α·L_t + (1−α)·EMA_{t−1} with α=0.3. Warning at EMA > 2ms. Danger at EMA > 5ms. 3+ consecutive danger alerts = CPU starvation imminent. EMA computed in userspace daemon to keep floating-point math out of the kernel hot-path — kernel only does integer timestamp subtraction.",
        media: { type: "chart", label: "EMA Latency Model" }
      }
    ],
    links: { github: "https://github.com/Atharva-Mendhulkar/K-PHD", paper: null, demo: null }
  }
];

export const standardProjects: Project[] = [];

export const categories = ["all", "ML / AI Research", "AI Systems", "Systems", "SaaS"];
