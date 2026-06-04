
# CPDesk — Competitive Programming Operating System

## Master Architecture & Design Document

### Version 1.0 — Principal Architect Edition

---

> **Design Mandate**: CPDesk is a local-first, keyboard-driven competitive programming operating environment.  
> It is NOT a platform. It is NOT a web app with a desktop wrapper. It is a **professional tool** built to  
> the same standard as VS Code, Obsidian, and Warp. Every architectural decision flows from this.

## Product Definition

CPDesk (Competitive Programming Operating System) is a local-first desktop application that combines:

- Competitive programming workspace
- Code editor
- Local judge
- Contest environment
- Practice tracker
- Knowledge base
- Analytics system

into a single integrated application.

Conceptually, CPDesk is to competitive programming what VS Code is to software development: a unified workspace rather than a single-purpose tool.

---

# TABLE OF CONTENTS

1. [Executive Summary](https://claude.ai/chat/815aea94-bb61-4f38-b8c7-1a71f12e19ca#1-executive-summary)
2. [Product Requirements Document](https://claude.ai/chat/815aea94-bb61-4f38-b8c7-1a71f12e19ca#2-product-requirements-document)
3. [User Stories](https://claude.ai/chat/815aea94-bb61-4f38-b8c7-1a71f12e19ca#3-user-stories)
4. [Functional Requirements](https://claude.ai/chat/815aea94-bb61-4f38-b8c7-1a71f12e19ca#4-functional-requirements)
5. [Non-Functional Requirements](https://claude.ai/chat/815aea94-bb61-4f38-b8c7-1a71f12e19ca#5-non-functional-requirements)
6. [System Architecture](https://claude.ai/chat/815aea94-bb61-4f38-b8c7-1a71f12e19ca#6-system-architecture)
7. [Database Design](https://claude.ai/chat/815aea94-bb61-4f38-b8c7-1a71f12e19ca#7-database-design)
8. [Filesystem Design](https://claude.ai/chat/815aea94-bb61-4f38-b8c7-1a71f12e19ca#8-filesystem-design)
9. [API Design — Tauri IPC Layer](https://claude.ai/chat/815aea94-bb61-4f38-b8c7-1a71f12e19ca#9-api-design--tauri-ipc-layer)
10. [Source Abstraction Layer](https://claude.ai/chat/815aea94-bb61-4f38-b8c7-1a71f12e19ca#10-source-abstraction-layer)
11. [Frontend Architecture](https://claude.ai/chat/815aea94-bb61-4f38-b8c7-1a71f12e19ca#11-frontend-architecture)
12. [Backend Architecture (Rust)](https://claude.ai/chat/815aea94-bb61-4f38-b8c7-1a71f12e19ca#12-backend-architecture-rust)
13. [UI/UX Design Specification](https://claude.ai/chat/815aea94-bb61-4f38-b8c7-1a71f12e19ca#13-uiux-design-specification)
14. [Analytics Architecture](https://claude.ai/chat/815aea94-bb61-4f38-b8c7-1a71f12e19ca#14-analytics-architecture)
15. [Development Roadmap](https://claude.ai/chat/815aea94-bb61-4f38-b8c7-1a71f12e19ca#15-development-roadmap)
16. [Engineering Considerations](https://claude.ai/chat/815aea94-bb61-4f38-b8c7-1a71f12e19ca#16-engineering-considerations)
17. [Risks & Mitigations](https://claude.ai/chat/815aea94-bb61-4f38-b8c7-1a71f12e19ca#17-risks--mitigations)
18. [Future Vision](https://claude.ai/chat/815aea94-bb61-4f38-b8c7-1a71f12e19ca#18-future-vision)

---

# 1. EXECUTIVE SUMMARY

## 1.1 The Problem

A competitive programmer today switches between: a browser tab with the problem statement, a local editor or terminal, a CF/AtCoder profile page, a notes app, and an analytics spreadsheet — during a single practice session. This context-switching is not just friction; it degrades focus, breaks flow state, and makes meaningful self-analysis nearly impossible.

Existing tools like competitive-companion, cf-tool, and online-judge-tools each solve one slice of this problem. CPDesk eliminates the entire problem space.

## 1.2 The Product

CPDesk is a **local-first desktop application** that serves as the complete operating environment for a competitive programmer. It runs on macOS, Linux, and Windows. It stores everything locally. It works offline. It prioritizes keyboard-first operation. It is fast, dense, and professional.

CPDesk is conceptually closest to: **Neovim + Obsidian + LazyGit + a CP dashboard**, unified into a single application with a coherent UX model.

## 1.3 Core Architectural Decisions

|Concern|Decision|Rationale|
|---|---|---|
|Desktop framework|Tauri v2 (Rust + React)|Smaller bundle than Electron, native OS integration, Rust backend performance|
|Frontend state|Zustand + TanStack Query|Zustand for UI state; TanStack for async/server state from Tauri IPC|
|Database|SQLite via `sqlx` (async)|Local-first, zero-dependency, sufficient for all CP analytics at scale|
|Async runtime|Tokio|Industry standard, excellent ecosystem|
|HTTP client|`reqwest` (tokio async)|De-facto standard; async, TLS-capable|
|Chart library|Recharts + custom D3|Recharts for standard charts; D3 for the heatmap calendar only|
|Credential storage|OS keychain via `keyring` crate|Never store passwords in config or DB|
|HTML sanitization|`ammonia` crate|Prevent XSS from fetched problem HTML|
|Editor|Monaco Editor (`@monaco-editor/react`)|VSCode engine; Vim mode via `monaco-vim`; best in class|
|Config format|TOML|Human-editable, version-controllable, strongly typed|
|Plugin system|Trait objects behind `Arc<dyn Plugin>`|Designed in from Phase 1; implemented in Phase 4|

## 1.4 What CPDesk Is Not

- Not a collaborative/social platform
- Not a cloud-synced service (local-first; optional sync is a future concern)
- Not an AI tutor or solution generator
- Not a replacement for CF/AtCoder — it _uses_ them as backends

## 1.5 Product Definition

CPDesk (Competitive Programming Operating System) is a local-first desktop application that combines:

- Competitive programming workspace
- Code editor
- Local judge
- Contest environment
- Practice tracker
- Knowledge base
- Analytics system

into a single integrated application.

Conceptually, CPDesk is to competitive programming what VS Code is to software development: a unified workspace rather than a collection of disconnected tools.

CPDesk is designed as a professional desktop tool, not a website, browser extension, or cloud service.

---

# 2. PRODUCT REQUIREMENTS DOCUMENT

## 2.1 Vision & Mission

**Vision**: Every competitive programmer has a professional-grade local workspace as powerful as their IDE, as organized as their notes app, and as insightful as their own coach.

**Mission**: Build the best offline-capable, keyboard-first workspace that connects to CP platforms, provides a world-class editor and judge, and turns practice data into actionable self-improvement insights.

## 2.1.1 Design Principles

CPDesk optimizes for deliberate practice rather than problem completion.

Features that reduce independent thinking are discouraged.

Features that improve:

- Reflection
- Analysis
- Consistency
- Knowledge retention
- Long-term skill development

are prioritized.

The goal is to make the user a stronger competitive programmer, not simply help them solve more problems.

## 2.1.2 Local-First Guarantee

CPDesk remains fully usable when:

- Offline
- Competitive programming platforms are unavailable
- External APIs fail
- AI services are disabled

The local workspace is the product.

External services enhance the experience but are never required for core functionality.

Users always retain ownership of:

- Solutions
- Notes
- Editorials
- Analytics history
- Templates
- Workspace data


## 2.2 User Personas

### Persona 1: "The Grinder" — College student, pre-placement

- Solves 2-5 problems daily
- Tracks rating progression obsessively
- Needs: streaks, daily targets, analytics, fast problem-open workflow
- Pain point: context switching between browser + editor + notes

### Persona 2: "The Competitor" — Active Division 2/1 contestant

- Participates in multiple contests per week
- Needs: contest calendar, live contest mode, contest replay, submission speed
- Pain point: no post-contest analysis tool, loses track of what problems to upsolve

### Persona 3: "The Systematic Learner" — Topic-by-topic studier

- Works through CSES + CF problem sets by topic
- Needs: practice library with roadmaps, notes, personal editorials, mistake database
- Pain point: scattered notes across Notion/Obsidian/paper, no unified problem tracking

## 2.3 Target Platforms

- macOS 12+ (Apple Silicon + Intel)
- Linux (Ubuntu 22.04+, Arch, Fedora)
- Windows 10+

---

# 3. USER STORIES

### 3.1 Contest Stories

|ID|As a...|I want to...|So that...|
|---|---|---|---|
|C-01|Competitor|See all upcoming CF/AtCoder contests in one calendar view|I never miss a contest|
|C-02|Competitor|Open a contest problem directly in CPDesk without leaving the app|I stay in flow during contests|
|C-03|Competitor|See sample tests run instantly against my code|I validate quickly during time pressure|
|C-04|Competitor|Submit my solution with one keypress|I save time on submission|
|C-05|Competitor|Enter focus mode hiding all ratings/tags|I practice honest thinking during virtual contests|
|C-06|Grinder|Review my contest timeline after a contest|I understand where I lost time|
|C-07|Grinder|See which problems I could have solved but didn't|I know exactly what to upsolve|

### 3.2 Practice Stories

|ID|As a...|I want to...|So that...|
|---|---|---|---|
|P-01|Learner|Filter problems by topic, difficulty, platform, and status|I find the exact next problem to practice|
|P-02|Learner|Follow a topic roadmap (Binary Search → DP → Graphs)|I study systematically|
|P-03|Grinder|Track solved/attempted/bookmarked status per problem|I never re-open a problem I've already solved|
|P-04|Learner|Write notes per problem in Markdown|I retain what I learned|
|P-05|Learner|Write a personal editorial documenting my approach and mistakes|I build long-term understanding|
|P-06|Grinder|Tag my WA with a mistake category (overflow, off-by-one, etc.)|I detect patterns in my errors|

### 3.3 Workspace Stories

|ID|As a...|I want to...|So that...|
|---|---|---|---|
|W-01|All|Open any problem and have a workspace auto-created|I don't manage files manually|
|W-02|All|Compile and run my code against sample tests in one command|I get fast feedback without leaving the editor|
|W-03|All|Run a stress test with my solution, brute force, and generator|I find edge cases that samples don't expose|
|W-04|All|Insert a template (DSU, SegTree) into my editor|I don't re-type boilerplate|
|W-05|All|See a diff between expected and actual output|I debug faster|

### 3.4 Analytics Stories

|ID|As a...|I want to...|So that...|
|---|---|---|---|
|A-01|All|See my GitHub-style submission heatmap|I visualize consistency|
|A-02|Grinder|See my average solve time by difficulty rating|I set realistic contest goals|
|A-03|Grinder|See my Codeforces rating history plotted|I track long-term progress|
|A-04|Learner|See which topic tags I consistently fail in|I focus practice on weaknesses|
|A-05|All|Get an AI-generated analysis of my recent session performance|I get coaching-level insights without another person|
|A-06|All|Maintain a streak counter that resets if I miss a day|I stay consistent|

---

# 4. FUNCTIONAL REQUIREMENTS

## 4.1 Problem Aggregation

- FR-1.1: Fetch problem metadata (title, tags, difficulty, constraints) from Codeforces API
- FR-1.2: Fetch and cache rendered HTML problem statements
- FR-1.3: Parse and store sample test cases from problem statements
- FR-1.4: Support CSES problem list via scraping (Phase 2)
- FR-1.5: Support AtCoder problem list via scraping + unofficial API (Phase 2)
- FR-1.6: Cache all fetched data with per-item TTL
- FR-1.7: All cached data accessible offline

## 4.2 Contest System

- FR-2.1: Display paginated list of upcoming/running/past contests from all integrated platforms
- FR-2.2: Show contest timer countdown to start; elapsed timer when live
- FR-2.3: Open contest problems inside CPDesk (render cached/fetched HTML)
- FR-2.4: Enforce Focus Mode toggle (hides tags, difficulty, analytics)
- FR-2.5: Track per-problem timeline events (opened, first keystroke, first run, first AC)
- FR-2.6: Generate contest replay report after contest ends

## 4.3 Practice System

- FR-3.1: Display unified problem library across platforms with multi-dimensional filters
- FR-3.2: Persist problem status (Solved / Attempted / Unsolved / Bookmarked)
- FR-3.3: Display topic roadmaps with progression tracking
- FR-3.4: Support custom problem lists/collections created by user

## 4.4 Workspace & Editor

- FR-4.1: Auto-create structured workspace directory when problem is opened
- FR-4.2: Monaco editor with C++, Python, Java syntax highlighting
- FR-4.3: Autosave on change (debounced 500ms)
- FR-4.4: Template insertion command
- FR-4.5: Snippet insertion via command palette
- FR-4.6: Vim keybinding mode (optional, user-configurable)

## 4.5 Local Judge

- FR-5.1: Compile C++ using g++ (configurable flags), Python via python3, Java via javac
- FR-5.2: Run against all sample test cases and display pass/fail
- FR-5.3: Support custom test input in the test pane
- FR-5.4: Enforce configurable time limit (default 2000ms)
- FR-5.5: Display stdout, stderr, and exit code
- FR-5.6: Show expected vs actual diff on failure

## 4.6 Stress Tester

- FR-6.1: Support three-file stress test: solution, brute, generator
- FR-6.2: Run up to 10,000 randomized iterations
- FR-6.3: Stop and display failing test case on first mismatch
- FR-6.4: Stream progress in real time to frontend via Tauri events

## 4.7 Submission

FR-7.1: Submission Provider abstraction must support:
    - Native API submission
    - Cookie-based submission
    - Embedded WebView submission
    - Manual browser fallback

FR-7.2: Platform integrations must degrade gracefully when native submission is unavailable.

FR-7.3: Codeforces native submission is considered an optimization, not a core dependency.

FR-7.4: Users must always be able to submit through a fallback mechanism.
- FR-7.3: Display verdict (AC/WA/TLE/RE/CE) in editor panel
- FR-7.4: Store submission record in database

## 4.8 Analytics

- FR-8.1: Record analytics event for every meaningful action (see Analytics Architecture)
- FR-8.2: Compute solve timeline from events
- FR-8.3: Generate weekly/monthly reports
- FR-8.4: AI-powered session analysis: send anonymized stats (NO code, NO problem content) to Claude API on user request
- FR-8.5: Display heatmap calendar, rating graph, topic mastery chart
- FR-8.6: Track and detect recurring mistake patterns from user-tagged WA

## 4.9 Notes & Knowledge

- FR-9.1: Per-problem Markdown notes with live preview
- FR-9.2: Per-problem personal editorial with structured fields
- FR-9.3: Mistake tagging on submissions

## 4.10 Practice Timing System

FR-10.1: Every problem session records:
    - Start Time
    - First Code Time
    - First Run Time
    - First AC Time

FR-10.2: CPDesk should provide recommended solve durations based on problem difficulty.

Example:

800-1000  → 15 min
1100-1300 → 25 min
1400-1600 → 45 min
1700-1900 → 90 min

FR-10.3: Timer warnings are informational only and never reveal hints.

FR-10.4: Analytics should compare actual solve times against recommended durations.

## 4.11 Revision System

FR-11.1: Solved problems can be scheduled for revision.

FR-11.2: Default revision intervals:

7 Days
30 Days
90 Days

FR-11.3: CPDesk should maintain a revision queue.

FR-11.4: Revision analytics should track:

- Re-solve success rate
- Time to recall
- Topics frequently forgotten

FR-11.5: Revision data contributes to topic mastery calculations.

## 4.14 Search & Knowledge Discovery

FR-14.1: Users can search across:

- Problem titles
- Notes
- Editorials
- Journal entries

FR-14.2: Search must function completely offline.

FR-14.3: Search results should support filtering by:

- Platform
- Difficulty
- Tags
- Solve status

FR-14.4: Search should return results within 100ms for typical datasets.

---

# 5. NON-FUNCTIONAL REQUIREMENTS

|ID|Requirement|Target|
|---|---|---|
|NFR-01|Application cold start time|< 2 seconds on modern hardware|
|NFR-02|Problem open to editor ready|< 500ms (cached) / < 3s (network fetch)|
|NFR-03|Compile + run small program|< 800ms (C++)|
|NFR-04|Database query latency (p99)|< 50ms for any analytics query|
|NFR-05|Offline functionality|100% of core features work offline|
|NFR-06|Binary size|< 20MB (Tauri advantage vs Electron)|
|NFR-07|Memory usage at idle|< 150MB RSS|
|NFR-08|Platform credential storage|OS keychain only — never plaintext|
|NFR-09|Code execution isolation|Subprocess with timeout; no network restriction needed for local tool|
|NFR-10|Cross-platform consistency|Feature parity across macOS / Linux / Windows|
|NFR-11|Accessibility|WCAG 2.1 AA minimum for all UI elements|

## 4.12 Upsolve Queue

FR-12.1: After every contest CPDesk automatically identifies unsolved contest problems.

FR-12.2: Users can add problems to an Upsolve Queue.

FR-12.3: Queue items are prioritized by:

- Contest recency
- Difficulty
- User weakness areas
FR-12.4: Dashboard should display pending upsolve tasks.

## 4.13 Performance Journal

Every solved problem supports structured reflection fields:

- Key Observation
- Mistake Made
- Final Learning
- Would I Solve Differently?

FR-13.1: Journal entries are searchable.

FR-13.2: Journal entries contribute to topic mastery analysis.

FR-13.3: Journal entries remain fully local by default.
---

# 6. SYSTEM ARCHITECTURE

## 6.1 Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            CPDesk DESKTOP APPLICATION                       │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                         TAURI PROCESS                                │ │
│  │                                                                     │ │
│  │  ┌────────────────────────────────────────────────┐                 │ │
│  │  │               WEBVIEW (React Frontend)          │                 │ │
│  │  │                                                 │                 │ │
│  │  │  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │                 │ │
│  │  │  │  Router  │  │  Zustand │  │ TanStack    │  │                 │ │
│  │  │  │  (Views) │  │  (State) │  │ Query Cache │  │                 │ │
│  │  │  └──────────┘  └──────────┘  └─────────────┘  │                 │ │
│  │  │                                                 │                 │ │
│  │  │  ┌──────────────────────────────────────────┐  │                 │ │
│  │  │  │            Monaco Editor                  │  │                 │ │
│  │  │  └──────────────────────────────────────────┘  │                 │ │
│  │  └────────────────────────┬───────────────────────┘                 │ │
│  │                           │  Tauri IPC (invoke / listen)            │ │
│  │  ┌────────────────────────▼───────────────────────┐                 │ │
│  │  │                  RUST BACKEND                   │                 │ │
│  │  │                                                 │                 │ │
│  │  │  ┌────────────┐  ┌──────────────┐  ┌────────┐  │                 │ │
│  │  │  │  Command   │  │   Services   │  │ Event  │  │                 │ │
│  │  │  │  Handler   │  │   Layer      │  │ Emitter│  │                 │ │
│  │  │  └────────────┘  └──────┬───────┘  └────────┘  │                 │ │
│  │  │                         │                       │                 │ │
│  │  │  ┌──────────────────────▼───────────────────┐  │                 │ │
│  │  │  │              CORE MODULES                 │  │                 │ │
│  │  │  │                                           │  │                 │ │
│  │  │  │  ┌──────────┐ ┌────────┐ ┌───────────┐   │  │                 │ │
│  │  │  │  │ Source   │ │ Judge  │ │ Analytics │   │  │                 │ │
│  │  │  │  │ Registry │ │ Engine │ │ Engine    │   │  │                 │ │
│  │  │  │  └──────────┘ └────────┘ └───────────┘   │  │                 │ │
│  │  │  │                                           │  │                 │ │
│  │  │  │  ┌──────────┐ ┌────────┐ ┌───────────┐   │  │                 │ │
│  │  │  │  │Workspace │ │Submiss-│ │ Template  │   │  │                 │ │
│  │  │  │  │ Manager  │ │  ion   │ │ Manager   │   │  │                 │ │
│  │  │  │  └──────────┘ └────────┘ └───────────┘   │  │                 │ │
│  │  │  └───────────────────┬───────────────────────┘  │                 │ │
│  │  │                      │                           │                 │ │
│  │  │  ┌───────────────────▼───────────────────────┐  │                 │ │
│  │  │  │              DATA LAYER                   │  │                 │ │
│  │  │  │  ┌──────────┐  ┌──────────┐  ┌────────┐  │  │                 │ │
│  │  │  │  │  SQLite  │  │  Keyring │  │  FS    │  │  │                 │ │
│  │  │  │  │  (sqlx)  │  │  (creds) │  │ (files)│  │  │                 │ │
│  │  │  │  └──────────┘  └──────────┘  └────────┘  │  │                 │ │
│  │  │  └───────────────────────────────────────────┘  │                 │ │
│  │  └─────────────────────────────────────────────────┘                 │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │                       EXTERNAL SERVICES                          │    │
│  │  Codeforces API  │  AtCoder (scrape)  │  CSES (scrape)  │  Claude│    │
│  └──────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────┘
```

## 6.2 Component Boundaries

### Strict Rules

1. **Frontend never touches the filesystem directly** — all FS operations go through Tauri commands
2. **Frontend never stores secrets** — credentials are Rust-side only
3. **Frontend never makes HTTP calls to CP platforms** — all network through Rust
4. **Analytics events are append-only** — never update, only insert
5. **Problem HTML is sanitized in Rust** before reaching the WebView

## 6.3 Data Flow — Problem Open

```
User presses ⌘O / types problem ID
       │
       ▼
Frontend: invoke("open_problem", { platform: "cf", id: "2100A" })
       │
       ▼
Rust CommandHandler: open_problem()
       │
       ├─▶ WorkspaceManager::ensure_workspace("cf/2100A")
       │        │
       │        └─▶ Creates ~/CPDesk/workspace/codeforces/2100A/ if not exists
       │
       ├─▶ DB: SELECT * FROM problems WHERE platform='cf' AND problem_id='2100A'
       │        │
       │        ├─▶ [HIT] Return cached problem data
       │        │
       │        └─▶ [MISS] SourceRegistry::fetch_problem("cf", "2100A")
       │                       │
       │                       └─▶ CodeforcesSource::fetch_problem()
       │                               ├─▶ HTTP GET codeforces.com/api/problemset.problems
       │                               ├─▶ HTTP GET problem statement HTML
       │                               ├─▶ ammonia::clean(html) -- sanitize
       │                               ├─▶ Write statement.html to workspace
       │                               └─▶ INSERT INTO problems, test_cases, problem_tags
       │
       ├─▶ AnalyticsEngine::record_event(ProblemOpened { problem_id, timestamp })
       │
       └─▶ Return ProblemData { workspace_path, statement_html, test_cases, ... }

Frontend: Render problem view + load Monaco editor with workspace file
```

## 6.4 Data Flow — Compile & Run

```
User presses ⌘R
       │
       ▼
Frontend: invoke("run_solution", { workspace_path, language: "cpp", test_case_id })
       │
       ▼
JudgeEngine::run()
       │
       ├─▶ Read solution.cpp from workspace_path
       ├─▶ CompilerService::compile("g++ -std=c++17 -O2 -o .CPDesk_bin solution.cpp")
       │        │
       │        ├─▶ [OK] Compilation succeeded
       │        └─▶ [ERR] Return CompilationError { stderr, line, col }
       │
       ├─▶ ExecutionService::run("./.CPDesk_bin", input, timeout=2000ms)
       │        ├─▶ Spawn subprocess
       │        ├─▶ Write input to stdin
       │        ├─▶ tokio::time::timeout(Duration::from_millis(timeout))
       │        ├─▶ Capture stdout, stderr
       │        └─▶ Kill on timeout → TLE
       │
       ├─▶ Diff::compare(expected, actual) → DiffResult
       │
       ├─▶ AnalyticsEngine::record_event(CodeRan { timestamp, passed })
       │
       └─▶ Return RunResult { status, stdout, stderr, duration_ms, diff }
```

## 6.5 Event Flow — Contest Live Mode

```
[TAURI BACKGROUND TASK] ContestMonitor
       │
       ├─▶ Polls CF API every 60s for contest status changes
       │
       ├─▶ Contest starts → emit("contest_started", { contest_id })
       │        │
       │        └─▶ Frontend: Shows contest notification, starts timer
       │
       ├─▶ User opens problem → AnalyticsEngine::record(ProblemOpened { in_contest: true })
       │
       ├─▶ Every keystroke → debounced event → record(FirstCodeTyped)
       │
       └─▶ Submission AC → record(ProblemSolved { attempt_number, duration })
```


## 6.6 Internal Event Bus

CPDesk follows an event-driven architecture internally.

Core system events include:

- SessionStarted
- SessionEnded
- ProblemOpened
- ProblemSolved
- SubmissionReceived
- RevisionScheduled
- RevisionCompleted
- ContestStarted
- ContestEnded

Modules should communicate through events wherever practical rather than direct coupling.

Benefits:

- Easier analytics generation
- Cleaner plugin integration
- Better extensibility
- Future synchronization support
- Reduced module dependencies

---

# 7. DATABASE DESIGN

## 7.1 Schema

```sql
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA synchronous = NORMAL;

-- ─────────────────────────────────────────────
-- PROBLEM DOMAIN
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS platforms (
    id          TEXT PRIMARY KEY,   -- 'cf', 'atcoder', 'cses'
    name        TEXT NOT NULL,
    base_url    TEXT NOT NULL,
    enabled     INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS problems (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    platform_id     TEXT NOT NULL REFERENCES platforms(id),
    problem_id      TEXT NOT NULL,   -- e.g., '2100A', 'abc300_a'
    contest_id      TEXT,
    title           TEXT NOT NULL,
    difficulty      INTEGER,         -- CF rating or platform-specific int
    time_limit_ms   INTEGER,
    memory_limit_kb INTEGER,
    statement_html  TEXT,            -- sanitized, cached
    statement_md    TEXT,            -- markdown-converted (for offline text search)
    url             TEXT NOT NULL,
    fetched_at      INTEGER,         -- Unix timestamp
    cache_valid_until INTEGER,
    UNIQUE(platform_id, problem_id)
);

CREATE TABLE IF NOT EXISTS tags (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT NOT NULL UNIQUE,    -- e.g., 'binary search', 'dp', 'graphs'
    slug    TEXT NOT NULL UNIQUE     -- e.g., 'binary-search', 'dp'
);

CREATE TABLE IF NOT EXISTS problem_tags (
    problem_id  INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    tag_id      INTEGER NOT NULL REFERENCES tags(id),
    source      TEXT NOT NULL DEFAULT 'platform',  -- 'platform' | 'user'
    PRIMARY KEY (problem_id, tag_id)
);

CREATE TABLE IF NOT EXISTS test_cases (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_id  INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    is_sample   INTEGER NOT NULL DEFAULT 1,  -- 1 = sample, 0 = custom
    label       TEXT,             -- 'Sample 1', 'Custom 1', etc.
    input       TEXT NOT NULL,
    output      TEXT NOT NULL,
    created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ─────────────────────────────────────────────
-- CONTEST DOMAIN
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contests (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    platform_id     TEXT NOT NULL REFERENCES platforms(id),
    contest_id      TEXT NOT NULL,
    name            TEXT NOT NULL,
    phase           TEXT NOT NULL,   -- 'BEFORE' | 'CODING' | 'FINISHED'
    start_time_unix INTEGER NOT NULL,
    duration_secs   INTEGER NOT NULL,
    url             TEXT NOT NULL,
    fetched_at      INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(platform_id, contest_id)
);

CREATE TABLE IF NOT EXISTS contest_problems (
    contest_id  INTEGER NOT NULL REFERENCES contests(id),
    problem_id  INTEGER NOT NULL REFERENCES problems(id),
    index_label TEXT,            -- 'A', 'B', 'C1', etc.
    PRIMARY KEY (contest_id, problem_id)
);

-- ─────────────────────────────────────────────
-- WORKSPACE DOMAIN
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS workspace_items (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_id      INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE UNIQUE,
    workspace_path  TEXT NOT NULL,    -- absolute path to ~/CPDesk/workspace/cf/2100A/
    status          TEXT NOT NULL DEFAULT 'unsolved',
    -- 'unsolved' | 'attempted' | 'solved' | 'bookmarked'
    language        TEXT,             -- last used language
    bookmarked_at   INTEGER,
    first_opened_at INTEGER NOT NULL DEFAULT (unixepoch()),
    last_opened_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS solutions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    workspace_id    INTEGER NOT NULL REFERENCES workspace_items(id) ON DELETE CASCADE,
    version         INTEGER NOT NULL DEFAULT 1,
    language        TEXT NOT NULL,    -- 'cpp17', 'python3', 'java17'
    file_path       TEXT NOT NULL,    -- path to solution file
    snapshot        TEXT,             -- code snapshot at submission time
    is_accepted     INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(workspace_id, version)
);

-- ─────────────────────────────────────────────
-- SUBMISSION DOMAIN
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS submissions (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    workspace_id        INTEGER NOT NULL REFERENCES workspace_items(id),
    platform_sub_id     TEXT,             -- submission ID on the platform
    language            TEXT NOT NULL,
    code_snapshot       TEXT NOT NULL,    -- code at time of submission
    verdict             TEXT,             -- 'AC' | 'WA' | 'TLE' | 'RE' | 'CE' | 'MLE' | 'PENDING'
    time_ms             INTEGER,
    memory_kb           INTEGER,
    mistake_category    TEXT,             -- populated by user after WA
    -- 'overflow' | 'off_by_one' | 'wrong_greedy' | 'complexity_error'
    -- 'index_error' | 'edge_case' | 'modular_arithmetic' | 'wrong_approach' | 'other'
    mistake_note        TEXT,             -- user's own note on the mistake
    submitted_at        INTEGER NOT NULL DEFAULT (unixepoch()),
    verdict_received_at INTEGER
);

-- ─────────────────────────────────────────────
-- NOTES & KNOWLEDGE DOMAIN
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS problem_notes (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    workspace_id    INTEGER NOT NULL REFERENCES workspace_items(id) ON DELETE CASCADE UNIQUE,
    content_md      TEXT NOT NULL DEFAULT '',
    updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS personal_editorials (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    workspace_id    INTEGER NOT NULL REFERENCES workspace_items(id) ON DELETE CASCADE UNIQUE,
    approach        TEXT,     -- main idea / algorithm chosen
    mistake_made    TEXT,     -- what went wrong before AC
    learning        TEXT,     -- key takeaway
    time_complexity TEXT,
    space_complexity TEXT,
    written_at      INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ─────────────────────────────────────────────
-- ANALYTICS DOMAIN (append-only event log)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS analytics_events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type  TEXT NOT NULL,
    -- 'problem_opened' | 'first_code_typed' | 'first_run' | 'sample_passed'
    -- 'sample_failed' | 'submitted' | 'verdict_received' | 'session_started'
    -- 'session_ended' | 'note_written' | 'editorial_written'
    problem_id  INTEGER REFERENCES problems(id),
    contest_id  INTEGER REFERENCES contests(id),
    session_id  INTEGER REFERENCES sessions(id),
    payload     TEXT,             -- JSON blob for event-specific data
    timestamp   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS sessions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    session_type    TEXT NOT NULL DEFAULT 'practice',  -- 'practice' | 'contest'
    contest_id      INTEGER REFERENCES contests(id),
    started_at      INTEGER NOT NULL,
    ended_at        INTEGER,
    problems_solved INTEGER NOT NULL DEFAULT 0,
    ai_report       TEXT              -- Claude-generated session report (optional)
);

-- ─────────────────────────────────────────────
-- TEMPLATES & SNIPPETS
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS templates (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,        -- 'DSU', 'Segment Tree', 'Default C++'
    language    TEXT NOT NULL,        -- 'cpp', 'python', 'java'
    content     TEXT NOT NULL,
    is_default  INTEGER NOT NULL DEFAULT 0,
    created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(name, language)
);

CREATE TABLE IF NOT EXISTS snippets (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    trigger     TEXT NOT NULL,        -- e.g., 'dsu', 'fenwick', 'memoize'
    label       TEXT NOT NULL,        -- displayed in command palette
    language    TEXT NOT NULL,
    content     TEXT NOT NULL,        -- code with ${1:variable} placeholders
    UNIQUE(trigger, language)
);

-- ─────────────────────────────────────────────
-- STREAKS & GAMIFICATION
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS daily_activity (
    date            TEXT PRIMARY KEY,   -- 'YYYY-MM-DD'
    problems_solved INTEGER NOT NULL DEFAULT 0,
    problems_attempted INTEGER NOT NULL DEFAULT 0,
    minutes_active  INTEGER NOT NULL DEFAULT 0,
    editorials_written INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS streak_state (
    id                  INTEGER PRIMARY KEY CHECK (id = 1),  -- singleton
    current_streak      INTEGER NOT NULL DEFAULT 0,
    longest_streak      INTEGER NOT NULL DEFAULT 0,
    last_active_date    TEXT,   -- 'YYYY-MM-DD'
    total_days_active   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS daily_targets (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    target_type     TEXT NOT NULL,    -- 'problems_solved' | 'upsolve' | 'editorial'
    target_value    INTEGER NOT NULL,
    active          INTEGER NOT NULL DEFAULT 1
);

-- ─────────────────────────────────────────────
-- USER ACCOUNTS & SETTINGS
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS platform_accounts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    platform_id     TEXT NOT NULL REFERENCES platforms(id),
    handle          TEXT NOT NULL,
    -- NOTE: password/token stored in OS keychain; not here
    keychain_service TEXT NOT NULL,  -- keychain service identifier
    is_active       INTEGER NOT NULL DEFAULT 1,
    added_at        INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(platform_id, handle)
);

CREATE TABLE IF NOT EXISTS rating_history (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    platform_id     TEXT NOT NULL REFERENCES platforms(id),
    handle          TEXT NOT NULL,
    contest_id      TEXT NOT NULL,
    contest_name    TEXT NOT NULL,
    rank            INTEGER,
    rating_before   INTEGER NOT NULL,
    rating_after    INTEGER NOT NULL,
    delta           INTEGER NOT NULL,
    contest_time    INTEGER NOT NULL
);

-- Singleton row for all app settings; use JSON for extensibility
CREATE TABLE IF NOT EXISTS app_settings (
    id      INTEGER PRIMARY KEY CHECK (id = 1),
    data    TEXT NOT NULL DEFAULT '{}'   -- JSON blob
);

INSERT OR IGNORE INTO app_settings (id, data) VALUES (1, '{}');
INSERT OR IGNORE INTO streak_state (id) VALUES (1);

-- ─────────────────────────────────────────────
-- REVISION SYSTEM
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS problem_revisions (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    workspace_id        INTEGER NOT NULL REFERENCES workspace_items(id) ON DELETE CASCADE,

    revision_number     INTEGER NOT NULL,
    scheduled_at        INTEGER NOT NULL,
    completed_at        INTEGER,

    success             INTEGER NOT NULL DEFAULT 0,
    duration_sec        INTEGER
);

-- ─────────────────────────────────────────────
-- UPSOLVE QUEUE
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS upsolve_queue (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    workspace_id    INTEGER NOT NULL REFERENCES workspace_items(id) ON DELETE CASCADE,

    priority        INTEGER NOT NULL DEFAULT 0,

    added_at        INTEGER NOT NULL,
    completed_at    INTEGER
);

-- ─────────────────────────────────────────────
-- PERFORMANCE JOURNAL
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS performance_journal (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    workspace_id        INTEGER NOT NULL REFERENCES workspace_items(id) ON DELETE CASCADE,

    key_observation     TEXT,
    mistake_made        TEXT,
    final_learning      TEXT,
    solve_differently   TEXT,

    created_at          INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at          INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ─────────────────────────────────────────────
-- FULL TEXT SEARCH
-- ─────────────────────────────────────────────

CREATE VIRTUAL TABLE IF NOT EXISTS problem_search
USING fts5(
    title,
    statement_md,
    notes,
    editorial
);
```

## 7.2 Indexes

```sql
-- Hot query paths need indexes
CREATE INDEX idx_problems_platform ON problems(platform_id);
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_problem_tags_problem ON problem_tags(problem_id);
CREATE INDEX idx_problem_tags_tag ON problem_tags(tag_id);
CREATE INDEX idx_test_cases_problem ON test_cases(problem_id);
CREATE INDEX idx_submissions_workspace ON submissions(workspace_id);
CREATE INDEX idx_submissions_verdict ON submissions(verdict);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_problem ON analytics_events(problem_id);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX idx_workspace_status ON workspace_items(status);
CREATE INDEX idx_rating_history_platform_handle ON rating_history(platform_id, handle);
CREATE INDEX idx_contest_problems_contest ON contest_problems(contest_id);
CREATE INDEX idx_daily_activity_date ON daily_activity(date);
CREATE INDEX idx_problem_revisions_workspace ON problem_revisions(workspace_id);
CREATE INDEX idx_upsolve_queue_workspace ON upsolve_queue(workspace_id);
CREATE INDEX idx_performance_journal_workspace ON performance_journal(workspace_id);
```

## 7.3 Key Query Patterns

```sql
-- Q1: Problems filtered by tag + difficulty range + status (practice library)
SELECT p.problem_id, p.title, p.difficulty, p.platform_id,
       w.status, w.last_opened_at
FROM problems p
LEFT JOIN workspace_items w ON w.problem_id = p.id
WHERE p.platform_id IN ('cf', 'cses')
  AND p.difficulty BETWEEN 1200 AND 1600
  AND EXISTS (
    SELECT 1 FROM problem_tags pt
    JOIN tags t ON pt.tag_id = t.id
    WHERE pt.problem_id = p.id AND t.slug = 'binary-search'
  )
ORDER BY p.difficulty ASC
LIMIT 50 OFFSET 0;

-- Q2: Solve time analysis by difficulty bucket
SELECT
    (p.difficulty / 100) * 100 AS difficulty_bucket,
    COUNT(*) AS total_solved,
    AVG(solve_duration_sec) AS avg_solve_sec,
    MIN(solve_duration_sec) AS fastest_sec
FROM (
    SELECT p.id, p.difficulty,
           (open_ev.timestamp) AS open_time,
           (ac_ev.timestamp) AS ac_time,
           (ac_ev.timestamp - open_ev.timestamp) AS solve_duration_sec
    FROM problems p
    JOIN workspace_items w ON w.problem_id = p.id
    JOIN analytics_events open_ev ON open_ev.problem_id = p.id
                                 AND open_ev.event_type = 'problem_opened'
    JOIN analytics_events ac_ev ON ac_ev.problem_id = p.id
                                AND ac_ev.event_type = 'verdict_received'
                                AND json_extract(ac_ev.payload, '$.verdict') = 'AC'
    WHERE solve_duration_sec > 0
) sub
JOIN problems p ON p.id = sub.id
GROUP BY difficulty_bucket
ORDER BY difficulty_bucket;

-- Q3: Topic weakness detection (high WA rate per tag)
SELECT t.name, t.slug,
       COUNT(CASE WHEN s.verdict = 'WA' THEN 1 END) AS wa_count,
       COUNT(CASE WHEN s.verdict = 'AC' THEN 1 END) AS ac_count,
       ROUND(
           COUNT(CASE WHEN s.verdict = 'WA' THEN 1 END) * 100.0 /
           NULLIF(COUNT(*), 0), 1
       ) AS wa_rate_pct
FROM submissions s
JOIN workspace_items w ON w.id = s.workspace_id
JOIN problem_tags pt ON pt.problem_id = w.problem_id
JOIN tags t ON pt.tag_id = t.id
WHERE s.submitted_at > unixepoch('now', '-90 days')
GROUP BY t.id
HAVING COUNT(*) >= 5
ORDER BY wa_rate_pct DESC
LIMIT 10;

-- Q4: Heatmap data (submissions per day, last 365 days)
SELECT date(datetime(timestamp, 'unixepoch')) AS day,
       COUNT(*) AS activity_count
FROM analytics_events
WHERE event_type = 'verdict_received'
  AND timestamp > unixepoch('now', '-365 days')
GROUP BY day;

-- Q5: Mistake category breakdown
SELECT mistake_category, COUNT(*) AS count
FROM submissions
WHERE verdict = 'WA' AND mistake_category IS NOT NULL
GROUP BY mistake_category
ORDER BY count DESC;

-- Q6: Contest replay timeline
SELECT ae.event_type, ae.timestamp,
       p.problem_id, p.title,
       ae.payload
FROM analytics_events ae
JOIN problems p ON ae.problem_id = p.id
WHERE ae.contest_id = ?
ORDER BY ae.timestamp ASC;
```

---

# 8. FILESYSTEM DESIGN

```
~/.CPDesk/                                   ← CPDesk root (XDG_DATA_HOME on Linux)
│
├── config.toml                            ← Application configuration
│
├── db/
│   └── CPDesk.db                           ← SQLite database
│
├── workspace/                            ← All problem workspaces
│   ├── codeforces/
│   │   ├── 2100A/                        ← problem workspace
│   │   │   ├── .meta.json               ← workspace metadata (problem_id, platform, etc.)
│   │   │   ├── statement.html           ← sanitized HTML (rendered in app)
│   │   │   ├── statement.md             ← markdown version (for search/offline)
│   │   │   ├── solution.cpp             ← primary solution (opened in editor)
│   │   │   ├── solution.py              ← if user switches language
│   │   │   ├── brute.cpp                ← stress test: brute force (optional)
│   │   │   ├── gen.cpp                  ← stress test: input generator (optional)
│   │   │   ├── notes.md                 ← problem notes (Markdown)
│   │   │   ├── editorial.md             ← personal editorial
│   │   │   └── runs/
│   │   │       ├── .CPDesk_bin            ← compiled binary (gitignore)
│   │   │       └── custom_input.txt     ← last custom input
│   │   └── 2100B/
│   │       └── ...
│   ├── atcoder/
│   │   └── abc300_a/
│   │       └── ...
│   └── cses/
│       └── 1068/                        ← CSES problem ID
│           └── ...
│
├── templates/                           ← Code templates
│   ├── cpp/
│   │   ├── default.cpp                 ← loaded when new problem opened in C++
│   │   ├── dp.cpp
│   │   ├── graphs.cpp
│   │   ├── dsu.cpp
│   │   └── segtree.cpp
│   ├── python/
│   │   └── default.py
│   └── java/
│       └── default.java
│
├── snippets/
│   ├── cpp.json                         ← Monaco snippet format
│   ├── python.json
│   └── java.json
│
├── cache/
│   ├── contests/
│   │   ├── cf_contests.json            ← cached contest list (TTL: 15 min)
│   │   └── atcoder_contests.json
│   └── user/
│       ├── cf_{handle}_profile.json    ← cached user profile
│       └── cf_{handle}_ratings.json   ← cached rating history
│
└── logs/
    ├── CPDesk_2024-01-15.log
    └── ...                              ← Rotated daily, 7-day retention
```

**`.meta.json` schema per workspace:**

```json
{
  "platform": "codeforces",
  "problem_id": "2100A",
  "contest_id": "2100",
  "title": "Balanced Brackets",
  "url": "https://codeforces.com/problemset/problem/2100/A",
  "difficulty": 1600,
  "opened_at": "2024-01-15T09:30:00Z",
  "last_modified": "2024-01-15T11:45:00Z",
  "workspace_version": "1"
}
```

**`config.toml` structure:**

```toml
[general]
theme = "dark"
vim_mode = false
autosave_interval_ms = 500
default_language = "cpp17"

[workspace]
root = "~/.CPDesk/workspace"  # configurable
auto_create = true

[judge]
cpp_compiler = "g++"
cpp_flags = "-std=c++17 -O2 -Wall"
python_binary = "python3"
java_binary = "java"
default_time_limit_ms = 2000
default_memory_limit_mb = 256

[editor]
font_size = 14
font_family = "JetBrains Mono"
tab_size = 4
line_numbers = true

[analytics]
ai_analysis_enabled = false  # off by default; user opts in
claude_api_key_set = false   # flag only; actual key in keychain

[accounts]
# platform credentials stored in OS keychain
# only handles stored here for display
[accounts.codeforces]
handle = "tourist"
[accounts.atcoder]
handle = "tourist_at"

[keybindings]
# override defaults
open_problem = "ctrl+o"
run = "ctrl+r"
submit = "ctrl+shift+s"
command_palette = "ctrl+p"
focus_mode = "ctrl+shift+f"
```

---

# 9. API DESIGN — TAURI IPC LAYER

All communication between React frontend and Rust backend happens via Tauri's `invoke()` / `listen()` system. Every command is typed end-to-end with `serde` on Rust and TypeScript interfaces on frontend.

## 9.1 Command Definitions

```rust
// ── PROBLEMS ──────────────────────────────────────────────────────────────

#[tauri::command]
async fn search_problems(
    filter: ProblemFilter,
    page: u32,
    per_page: u32,
    state: State<'_, AppState>,
) -> Result<PaginatedProblems, CommandError>

#[tauri::command]
async fn open_problem(
    platform: String,
    problem_id: String,
    state: State<'_, AppState>,
) -> Result<OpenedProblem, CommandError>

#[tauri::command]
async fn get_problem(
    platform: String,
    problem_id: String,
    state: State<'_, AppState>,
) -> Result<ProblemDetail, CommandError>

// ── WORKSPACE ─────────────────────────────────────────────────────────────

#[tauri::command]
async fn read_workspace_file(
    workspace_path: String,
    filename: String,
) -> Result<String, CommandError>

#[tauri::command]
async fn write_workspace_file(
    workspace_path: String,
    filename: String,
    content: String,
) -> Result<(), CommandError>

#[tauri::command]
async fn get_workspace_meta(
    workspace_path: String,
) -> Result<WorkspaceMeta, CommandError>

// ── JUDGE ──────────────────────────────────────────────────────────────────

#[tauri::command]
async fn compile_solution(
    workspace_path: String,
    language: String,
    app_handle: AppHandle,
) -> Result<CompilationResult, CommandError>

#[tauri::command]
async fn run_test_case(
    workspace_path: String,
    language: String,
    test_case_id: i64,
    app_handle: AppHandle,
) -> Result<RunResult, CommandError>

#[tauri::command]
async fn run_custom_input(
    workspace_path: String,
    language: String,
    input: String,
    app_handle: AppHandle,
) -> Result<RunResult, CommandError>

#[tauri::command]
async fn run_all_samples(
    workspace_path: String,
    language: String,
    app_handle: AppHandle,
) -> Result<Vec<RunResult>, CommandError>

// ── STRESS TESTER ──────────────────────────────────────────────────────────

#[tauri::command]
async fn start_stress_test(
    workspace_path: String,
    config: StressTestConfig,
    app_handle: AppHandle,
) -> Result<(), CommandError>
// Streams events via app_handle.emit("stress_progress", event)

#[tauri::command]
async fn stop_stress_test(
    state: State<'_, AppState>,
) -> Result<(), CommandError>

// ── CONTESTS ───────────────────────────────────────────────────────────────

#[tauri::command]
async fn list_contests(
    platforms: Vec<String>,
    phase_filter: Option<String>,
    state: State<'_, AppState>,
) -> Result<Vec<ContestSummary>, CommandError>

#[tauri::command]
async fn get_contest_problems(
    platform: String,
    contest_id: String,
    state: State<'_, AppState>,
) -> Result<Vec<ProblemSummary>, CommandError>

// ── SUBMISSION ─────────────────────────────────────────────────────────────

#[tauri::command]
async fn submit_solution(
    platform: String,
    problem_id: String,
    language: String,
    code: String,
    app_handle: AppHandle,
    state: State<'_, AppState>,
) -> Result<SubmissionId, CommandError>
// Polls verdict and emits "submission_update" events

// ── ANALYTICS ──────────────────────────────────────────────────────────────

#[tauri::command]
async fn get_heatmap(
    days: u32,
    state: State<'_, AppState>,
) -> Result<Vec<HeatmapDay>, CommandError>

#[tauri::command]
async fn get_rating_history(
    platform: String,
    state: State<'_, AppState>,
) -> Result<Vec<RatingPoint>, CommandError>

#[tauri::command]
async fn get_topic_stats(
    state: State<'_, AppState>,
) -> Result<Vec<TopicStat>, CommandError>

#[tauri::command]
async fn get_weakness_report(
    state: State<'_, AppState>,
) -> Result<WeaknessReport, CommandError>

#[tauri::command]
async fn get_session_stats(
    session_id: i64,
    state: State<'_, AppState>,
) -> Result<SessionStats, CommandError>

#[tauri::command]
async fn request_ai_analysis(
    session_id: Option<i64>,  // None = analyze all recent sessions
    state: State<'_, AppState>,
) -> Result<String, CommandError>
// Calls Claude API with anonymized performance data only

// ── SETTINGS ───────────────────────────────────────────────────────────────

#[tauri::command]
async fn get_settings(state: State<'_, AppState>) -> Result<AppSettings, CommandError>

#[tauri::command]
async fn update_settings(
    patch: SettingsPatch,
    state: State<'_, AppState>,
) -> Result<(), CommandError>

#[tauri::command]
async fn save_platform_credentials(
    platform: String,
    handle: String,
    password: String,
) -> Result<(), CommandError>
// Stores to OS keychain via keyring crate; never touches DB or FS

// ── TEMPLATES ──────────────────────────────────────────────────────────────

#[tauri::command]
async fn list_templates(
    language: Option<String>,
    state: State<'_, AppState>,
) -> Result<Vec<TemplateSummary>, CommandError>

#[tauri::command]
async fn get_template_content(
    id: i64,
    state: State<'_, AppState>,
) -> Result<String, CommandError>
```

## 9.2 Tauri Event Bus (Backend → Frontend)

```
"stress_progress"        { n: u32, status: "pass" | "fail", input?, expected?, actual? }
"submission_update"      { submission_id: str, verdict: str, time_ms?: u32, memory_kb?: u32 }
"judge_stderr"           { content: str }   -- streaming compiler output
"contest_alert"          { contest_id: str, name: str, starts_in_secs: u32 }
"workspace_file_changed" { path: str }      -- FS watcher notification
"sync_progress"          { step: str, done: bool }
```

---

# 10. SOURCE ABSTRACTION LAYER

## 10.1 Core Trait

```rust
// crates/CPDesk-core/src/sources/mod.rs

use async_trait::async_trait;

#[async_trait]
pub trait ProblemSource: Send + Sync + 'static {
    fn platform_id(&self) -> &'static str;
    fn display_name(&self) -> &'static str;
    fn supports_submission(&self) -> bool;
    fn supports_contest_listing(&self) -> bool;

    // Problem fetching
    async fn fetch_problem_meta(&self, problem_id: &str) -> Result<Problem>;
    async fn fetch_problem_html(&self, problem_id: &str) -> Result<String>;
    async fn fetch_sample_tests(&self, problem_id: &str) -> Result<Vec<TestCase>>;
    async fn list_problems(&self, filter: &ProblemFilter) -> Result<Vec<ProblemSummary>>;

    // Contest operations
    async fn list_contests(&self, filter: &ContestFilter) -> Result<Vec<ContestSummary>>;
    async fn fetch_contest(&self, contest_id: &str) -> Result<Contest>;

    // Submission (optional)
    async fn submit(&self, sub: SubmissionRequest) -> Result<SubmissionId> {
        Err(SourceError::NotSupported("submission not implemented for this source"))
    }
    async fn poll_verdict(&self, sub_id: &str) -> Result<Verdict> {
        Err(SourceError::NotSupported)
    }

    // Auth (optional)
    async fn authenticate(&self, creds: &Credentials) -> Result<()> {
        Err(SourceError::NotSupported("auth not required"))
    }
    async fn fetch_user_profile(&self, handle: &str) -> Result<UserProfile>;
    async fn fetch_rating_history(&self, handle: &str) -> Result<Vec<RatingChange>>;
}

// Registry — holds all registered sources
pub struct SourceRegistry {
    sources: HashMap<String, Arc<dyn ProblemSource>>,
}

impl SourceRegistry {
    pub fn register(&mut self, source: impl ProblemSource + 'static) { ... }
    pub fn get(&self, platform_id: &str) -> Option<&Arc<dyn ProblemSource>> { ... }
    pub fn all(&self) -> Vec<&Arc<dyn ProblemSource>> { ... }
}
```

## 10.2 Codeforces Implementation

- Fetch problem list: `GET /api/problemset.problems`
- Fetch problem statement: `GET /problemset/problem/{contest}/{index}` (scrape HTML)
- Fetch contests: `GET /api/contest.list`
- Submit: `POST /contest/{id}/submit` with session cookies + CSRF
- Rate limiting: 1 req/500ms per CF API guidelines

## 10.3 CSES Implementation (Phase 2)

- Problem list: scraped from `cses.fi/problemset/` (stable HTML structure)
- Problem statements: scraped per-problem (LaTeX rendered to HTML by CSES)
- No submission API — route submissions via browser automation (Tauri webview in-app)
- Auth: cookie-based session stored in keychain

## 10.4 AtCoder Implementation (Phase 2)

- Use AtCoder Problems API (`kenkoooo.com/atcoder/resources/`) for problem metadata and tags
- Problem statements: fetched directly from AtCoder HTML
- Submit: `POST /contests/{id}/submit` with CSRF + session cookies
- Auth: cookie-based session

---

# 11. FRONTEND ARCHITECTURE

## 11.1 Technology Decisions

|Concern|Choice|Reason|
|---|---|---|
|UI Framework|React 18 + TypeScript|Tauri native; ecosystem|
|State: UI/Global|Zustand|Minimal boilerplate, TypeScript native, no provider hell|
|State: Async/Server|TanStack Query v5|Caching, background refetch, suspense support|
|Routing|TanStack Router|Type-safe routes, excellent TypeScript DX|
|Styling|Tailwind CSS v4 + CSS variables|Utility-first, custom dark theme via CSS vars|
|Animation|Framer Motion|Smooth panel transitions without performance regression|
|Charts|Recharts + D3 (heatmap only)|Recharts for standard; D3 only for custom heatmap|
|Editor|`@monaco-editor/react`|VSCode engine; Vim mode via `monaco-vim`|
|Icons|Lucide React|Consistent, lightweight|
|Tables|TanStack Table|Virtualized, filterable, sortable problem lists|

## 11.2 Zustand Store Design

```typescript
// store/ui.store.ts — layout and UI state
interface UIState {
  activeView: 'dashboard' | 'contests' | 'practice' | 'workspace' | 'analytics' | 'settings'
  activeProblem: { platform: string; problemId: string } | null
  panelLayout: 'editor-only' | 'split-vertical' | 'split-horizontal'
  focusMode: boolean           // hides tags/ratings/analytics
  commandPaletteOpen: boolean
  sidebarCollapsed: boolean
  activeEditorTab: 'editor' | 'notes' | 'editorial'
  setActiveView: (view: UIState['activeView']) => void
  openProblem: (platform: string, problemId: string) => void
  toggleFocusMode: () => void
  toggleCommandPalette: () => void
}

// store/session.store.ts — active session state
interface SessionState {
  currentSession: { id: number; type: 'practice' | 'contest'; startedAt: Date } | null
  currentContest: { id: number; contestId: string; endsAt: Date } | null
  elapsedSeconds: number       // updated by a timer interval
  startSession: (type: SessionState['currentSession']['type']) => void
  endSession: () => void
}

// store/editor.store.ts — per-problem editor state
interface EditorState {
  workspacePath: string | null
  currentLanguage: string
  isSaving: boolean
  isDirty: boolean
  lastSaved: Date | null
  setLanguage: (lang: string) => void
  markDirty: () => void
  markSaved: () => void
}

// store/judge.store.ts — judge/run state
interface JudgeState {
  isCompiling: boolean
  isRunning: boolean
  compilationResult: CompilationResult | null
  runResults: Map<number, RunResult>   // test_case_id → result
  customInputResult: RunResult | null
  stressTestRunning: boolean
  stressTestProgress: { n: number; passed: number; failed: boolean; failingCase?: FailingCase }
}
```

## 11.3 TanStack Query Hooks

```typescript
// hooks/useProblems.ts
export const useProblems = (filter: ProblemFilter) =>
  useQuery({
    queryKey: ['problems', filter],
    queryFn: () => invoke<PaginatedProblems>('search_problems', { filter, page: 0, perPage: 50 }),
    staleTime: 5 * 60 * 1000,  // 5 min
  })

// hooks/useProblem.ts
export const useProblem = (platform: string, problemId: string) =>
  useQuery({
    queryKey: ['problem', platform, problemId],
    queryFn: () => invoke<ProblemDetail>('get_problem', { platform, problemId }),
    staleTime: 60 * 60 * 1000,  // 1 hour — problems don't change often
  })

// hooks/useContests.ts
export const useContests = (platforms: string[]) =>
  useQuery({
    queryKey: ['contests', platforms],
    queryFn: () => invoke<ContestSummary[]>('list_contests', { platforms }),
    staleTime: 15 * 60 * 1000,  // 15 min
    refetchInterval: 60 * 1000,  // background refresh every minute
  })

// hooks/useHeatmap.ts
export const useHeatmap = (days: number) =>
  useQuery({
    queryKey: ['heatmap', days],
    queryFn: () => invoke<HeatmapDay[]>('get_heatmap', { days }),
    staleTime: 5 * 60 * 1000,
  })
```

## 11.4 Component Hierarchy

```
App
├── CommandPalette                    ← global, always mounted, hidden until ⌘P
├── StatusBar                         ← bottom strip: language, platform, streak, timer
├── TitleBar                          ← custom (Tauri decorations disabled)
│   ├── NavTabs                       ← Dashboard | Contests | Practice | Analytics | Settings
│   └── SearchBar                     ← quick problem search
│
├── Router
│   ├── /dashboard
│   │   └── DashboardView
│   │       ├── TodayPanel            ← streak, daily target, quick stats
│   │       ├── RecentProblems        ← last 5 opened workspaces
│   │       ├── ContestCountdown      ← next upcoming contest
│   │       └── QuickStats            ← problems this week, WA rate
│   │
│   ├── /contests
│   │   └── ContestView
│   │       ├── ContestCalendar       ← calendar + list
│   │       ├── ContestCard           ← per contest card
│   │       └── LiveContestBanner     ← if contest is live
│   │
│   ├── /practice
│   │   └── PracticeView
│   │       ├── ProblemFilterBar      ← difficulty, tags, platform, status
│   │       ├── ProblemTable          ← virtualized, TanStack Table
│   │       │   └── ProblemRow
│   │       └── TopicRoadmap          ← tree of topics with progress
│   │
│   ├── /workspace/:platform/:problemId
│   │   └── WorkspaceView             ← 3-pane layout
│   │       ├── ProblemPanel          ← left: rendered problem HTML
│   │       │   └── ProblemRenderer   ← sandboxed iframe for problem HTML
│   │       ├── EditorPanel           ← center: Monaco + tab bar
│   │       │   ├── EditorTabBar      ← Solution | Notes | Editorial
│   │       │   ├── MonacoEditor      ← @monaco-editor/react
│   │       │   └── ToolbarRow        ← Run | Submit | Language | Template
│   │       └── JudgePanel            ← right: test cases + output
│   │           ├── TestCaseList
│   │           ├── CustomInput
│   │           ├── DiffView
│   │           └── StressTester
│   │
│   ├── /analytics
│   │   └── AnalyticsView
│   │       ├── HeatmapSection        ← GitHub-style calendar (D3)
│   │       ├── RatingGraphSection    ← Recharts LineChart
│   │       ├── TopicRadarSection     ← Recharts RadarChart
│   │       ├── DifficultyEfficiency  ← Recharts BarChart (avg time per rating bucket)
│   │       ├── WeaknessPanel         ← WA patterns
│   │       ├── MistakeBreakdown      ← pie chart of mistake categories
│   │       └── AIAnalysisPanel       ← generates Claude session report
│   │
│   └── /settings
│       └── SettingsView
│           ├── AccountsSection
│           ├── EditorSection
│           ├── JudgeSection
│           ├── KeybindingsSection
│           └── AnalyticsSection
```

---

# 12. BACKEND ARCHITECTURE (RUST)

## 12.1 Crate Structure

```
CPDesk/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs                    ← Tauri builder, plugin registration
│   │   ├── commands/                  ← All #[tauri::command] handlers
│   │   │   ├── mod.rs
│   │   │   ├── problems.rs
│   │   │   ├── workspace.rs
│   │   │   ├── judge.rs
│   │   │   ├── contests.rs
│   │   │   ├── submission.rs
│   │   │   ├── analytics.rs
│   │   │   ├── templates.rs
│   │   │   └── settings.rs
│   │   ├── services/                  ← Business logic
│   │   │   ├── mod.rs
│   │   │   ├── judge_service.rs       ← compile, run, diff
│   │   │   ├── stress_service.rs      ← stress test orchestrator
│   │   │   ├── workspace_service.rs   ← FS operations
│   │   │   ├── submission_service.rs  ← submit + poll verdict
│   │   │   ├── analytics_service.rs   ← event recording + query
│   │   │   ├── cache_service.rs       ← TTL cache manager
│   │   │   └── ai_service.rs          ← Claude API (analysis only)
│   │   ├── sources/                   ← Platform integrations
│   │   │   ├── mod.rs                 ← trait + registry
│   │   │   ├── codeforces.rs
│   │   │   ├── cses.rs
│   │   │   └── atcoder.rs
│   │   ├── db/                        ← Database layer
│   │   │   ├── mod.rs
│   │   │   ├── migrations/            ← sqlx migration files
│   │   │   ├── problem_repo.rs
│   │   │   ├── submission_repo.rs
│   │   │   ├── analytics_repo.rs
│   │   │   └── settings_repo.rs
│   │   ├── models/                    ← Domain types
│   │   │   ├── problem.rs
│   │   │   ├── contest.rs
│   │   │   ├── submission.rs
│   │   │   ├── analytics.rs
│   │   │   └── errors.rs
│   │   └── state.rs                   ← AppState struct
```

## 12.2 AppState Design

```rust
pub struct AppState {
    pub db: Arc<sqlx::SqlitePool>,
    pub source_registry: Arc<SourceRegistry>,
    pub workspace_root: PathBuf,
    pub config: Arc<RwLock<AppConfig>>,
    pub cache: Arc<CacheService>,
    pub stress_handle: Arc<Mutex<Option<tokio::task::AbortHandle>>>,
    pub http_client: Arc<reqwest::Client>,  // shared; handles connection pooling
}
```

## 12.3 Judge Service Architecture

```rust
pub struct JudgeService;

impl JudgeService {
    pub async fn compile(
        &self,
        workspace: &Path,
        language: &Language,
        app_handle: &AppHandle,
    ) -> Result<CompilationResult, JudgeError> {
        let compiler_cmd = language.compiler_command(workspace);
        let output = tokio::process::Command::new(compiler_cmd.program)
            .args(&compiler_cmd.args)
            .current_dir(workspace)
            .output()
            .await?;

        // Stream stderr to frontend during compilation
        app_handle.emit("judge_stderr", String::from_utf8_lossy(&output.stderr))?;

        if output.status.success() {
            Ok(CompilationResult::Success)
        } else {
            Ok(CompilationResult::Error {
                stderr: String::from_utf8_lossy(&output.stderr).to_string(),
            })
        }
    }

    pub async fn run(
        &self,
        workspace: &Path,
        language: &Language,
        input: &str,
        time_limit_ms: u64,
    ) -> Result<RunResult, JudgeError> {
        let binary = workspace.join(".CPDesk_bin");
        let start = std::time::Instant::now();

        let mut child = tokio::process::Command::new(&binary)
            .current_dir(workspace)
            .stdin(std::process::Stdio::piped())
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .spawn()?;

        // Write input to stdin
        let mut stdin = child.stdin.take().unwrap();
        tokio::io::AsyncWriteExt::write_all(&mut stdin, input.as_bytes()).await?;
        drop(stdin);

        // Enforce time limit
        let result = tokio::time::timeout(
            Duration::from_millis(time_limit_ms),
            child.wait_with_output(),
        )
        .await;

        match result {
            Ok(Ok(output)) => Ok(RunResult::Success {
                stdout: String::from_utf8_lossy(&output.stdout).to_string(),
                stderr: String::from_utf8_lossy(&output.stderr).to_string(),
                duration_ms: start.elapsed().as_millis() as u64,
            }),
            Err(_timeout) => Ok(RunResult::TimeLimitExceeded {
                duration_ms: time_limit_ms,
            }),
            Ok(Err(e)) => Err(JudgeError::ExecutionFailed(e.to_string())),
        }
    }
}
```

## 12.4 Stress Tester Architecture

```rust
pub struct StressService;

impl StressService {
    pub async fn run(
        &self,
        workspace: &Path,
        config: StressConfig,
        app_handle: AppHandle,
        abort_handle: Arc<Mutex<Option<AbortHandle>>>,
    ) {
        let handle = tokio::spawn(async move {
            // Compile all three binaries
            judge.compile(workspace, &config.language, &app_handle).await?;
            judge.compile_named(workspace, "brute", &app_handle).await?;
            judge.compile_named(workspace, "gen", &app_handle).await?;

            for n in 1..=config.iterations {
                // 1. Generate random input
                let input = judge.run_binary(workspace, "gen", "", 5000).await?;

                // 2. Run brute force
                let expected = judge.run_binary(workspace, "brute_bin", &input.stdout, config.time_limit_ms).await?;

                // 3. Run solution
                let actual = judge.run_binary(workspace, ".CPDesk_bin", &input.stdout, config.time_limit_ms).await?;

                // 4. Compare
                if normalize_output(&expected.stdout) != normalize_output(&actual.stdout) {
                    app_handle.emit("stress_progress", StressEvent::Failure {
                        n,
                        input: input.stdout.clone(),
                        expected: expected.stdout.clone(),
                        actual: actual.stdout.clone(),
                    }).ok();
                    return;
                }

                // 5. Progress update every 10 iterations
                if n % 10 == 0 {
                    app_handle.emit("stress_progress", StressEvent::Progress { n, passed: n }).ok();
                }
            }

            app_handle.emit("stress_progress", StressEvent::Complete { passed: config.iterations }).ok();
        });

        *abort_handle.lock().await = Some(handle.abort_handle());
    }
}
```

## 12.5 Analytics Event Recorder

```rust
// All events are recorded here — no business logic skips this
pub struct AnalyticsService {
    db: Arc<SqlitePool>,
}

impl AnalyticsService {
    pub async fn record(&self, event: AnalyticsEvent) -> Result<()> {
        sqlx::query!(
            "INSERT INTO analytics_events (event_type, problem_id, contest_id, session_id, payload, timestamp)
             VALUES (?, ?, ?, ?, ?, unixepoch())",
            event.event_type(),
            event.problem_id(),
            event.contest_id(),
            event.session_id(),
            serde_json::to_string(&event.payload())?,
        )
        .execute(&*self.db)
        .await?;
        Ok(())
    }
}

// Every action in every service calls analytics.record(...)
// This ensures complete data without coupling services to each other
```

## 12.6 AI Analysis Service (Ethical Constraints)

```rust
// STRICT CONSTRAINT: This service NEVER receives:
// - Problem statements
// - User code or solutions
// - Problem titles (only problem IDs for internal reference)
// It ONLY receives anonymized performance statistics.

pub struct AiService {
    http_client: Arc<reqwest::Client>,
}

impl AiService {
    pub async fn generate_session_analysis(
        &self,
        api_key: &str,
        stats: &AnonymizedSessionStats,
    ) -> Result<String, AiError> {
        // AnonymizedSessionStats contains ONLY:
        // - difficulty buckets and solve counts
        // - tag names and WA/AC rates (not problem IDs)
        // - time distributions
        // - mistake categories
        // NO code, NO problem statements, NO problem IDs

        let prompt = format!(
            "You are a competitive programming coach. Analyze this student's recent performance data \
             and provide 3-5 specific, actionable insights. Do NOT suggest solutions to any problem.\n\n\
             Performance Data:\n{}\n\n\
             Focus on: time management patterns, topic-specific weaknesses, and practice recommendations.",
            serde_json::to_string_pretty(stats)?
        );

        let response = self.http_client
            .post("https://api.anthropic.com/v1/messages")
            .bearer_auth(api_key)
            .json(&ClaudeRequest {
                model: "claude-sonnet-4-20250514",
                max_tokens: 1000,
                messages: vec![Message { role: "user", content: prompt }],
            })
            .send()
            .await?;

        // Parse and return the text
        Ok(response.json::<ClaudeResponse>().await?.content[0].text.clone())
    }
}
```

---

# 13. UI/UX DESIGN SPECIFICATION

## 13.1 Design System

```css
/* Design tokens — CSS variables */
:root {
  /* Background layers */
  --bg-base:     #0d0f10;   /* main window background */
  --bg-surface:  #151719;   /* panels, cards */
  --bg-elevated: #1c1e21;   /* modals, dropdowns */
  --bg-hover:    #242628;   /* hover state */
  --bg-active:   #2a2d30;   /* active/selected state */

  /* Text hierarchy */
  --text-primary:   #e8eaed;   /* main content */
  --text-secondary: #9aa0a6;   /* labels, metadata */
  --text-tertiary:  #5f6368;   /* hints, placeholders */
  --text-disabled:  #3c4043;

  /* Accent system — inspired by TUI terminals */
  --accent-blue:    #4fc3f7;   /* primary action, links */
  --accent-green:   #66bb6a;   /* AC verdict, success, streak */
  --accent-red:     #ef5350;   /* WA verdict, errors */
  --accent-yellow:  #ffd54f;   /* TLE verdict, warnings */
  --accent-purple:  #ba68c8;   /* notes, editorial */
  --accent-cyan:    #26c6da;   /* contest, active session */
  --accent-orange:  #ff7043;   /* RE verdict */

  /* Border */
  --border-subtle:  #2c2f31;   /* panel borders */
  --border-strong:  #3c4043;   /* focused element borders */

  /* Monospace font — critical for CP tool */
  --font-code: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  --font-ui: 'Inter Variable', system-ui, sans-serif;

  /* Spacing scale */
  --sp-1: 4px;  --sp-2: 8px;  --sp-3: 12px;
  --sp-4: 16px; --sp-6: 24px; --sp-8: 32px;

  /* Border radius */
  --radius-sm: 3px;  /* inline tags */
  --radius-md: 6px;  /* panels */
  --radius-lg: 8px;  /* cards */
}
```

## 13.2 Workspace View (Primary Screen)

```
┌─ CPDesk ──────────────────────────────────────────────────────────────────────┐
│  Dashboard  Contests  Practice  Analytics  Settings     [⌘P] [streak: 14🔥] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌──── PROBLEM ──────────────────┐ ┌─── EDITOR ──────────────┐ ┌── JUDGE ─┐ │
│ │ 2100A. Balanced Brackets      │ │ solution  notes  edit.  │ │ Samples  │ │
│ │ [CF] [Div.2C] [1600] [tags ▼] │ │─────────────────────────│ │──────────│ │
│ │───────────────────────────────│ │ 1 │ #include <bits/...  │ │ ✓ 1  2s  │ │
│ │ Given a string of brackets…  │ │ 2 │ using namespace std;│ │ ✓ 2  2s  │ │
│ │ Constraints:                  │ │ 3 │                     │ │ ✗ 3  WA  │ │
│ │ • 1 ≤ n ≤ 10⁶               │ │ 4 │ int main() {        │ │──────────│ │
│ │                               │ │ 5 │   int n;            │ │ Custom   │ │
│ │ Input Format:                 │ │ 6 │   cin >> n;         │ │──────────│ │
│ │ First line: n                 │ │ …                       │ │ [Input ▼]│ │
│ │ Second line: string           │ │                         │ │          │ │
│ │                               │ │                         │ │ Expected:│ │
│ │ Sample 1:                     │ │                         │ │ Yes      │ │
│ │ Input:  3                     │ │                         │ │          │ │
│ │         (()                   │ │                         │ │ Got:     │ │
│ │ Output: No                    │ │                         │ │ No  ✗    │ │
│ │                               │ │                         │ │          │ │
│ │                               │ │                         │ │ [+] Add  │ │
│ │                               │ │                         │ │ Stress ▸ │ │
│ └───────────────────────────────┘ └─────────────────────────┘ └──────────┘ │
│                                                                             │
├─ [Unsolved] [C++17] [g++] [2000ms] [⌘R Run] [⌘⏎ Submit] [⌘⇧F Focus Mode] ─┤
│  Solution:    Not submitted     Streak: 14  |  Session: 01:23:45 (practice) │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 13.3 Contest View

```
┌─ CPDesk ── CONTESTS ─────────────────────────────────────────────────────────┐
│  [▸ LIVE] Codeforces Round 915 Div.1+2          01:23:45 remaining          │
│  ┌─ A ─────────┐ ┌─ B ─────────┐ ┌─ C ─────────┐ ┌─ D ─────────┐         │
│  │ Simple Seq. │ │ Max Prefix  │ │ Grid Walk   │ │ [Locked]    │         │
│  │ ✓ Solved    │ │ ✓ Solved    │ │ Attempting  │ │             │         │
│  │ 00:07:32    │ │ 00:23:11    │ │ [Open ▸]    │ │             │         │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘         │
│──────────────────────────────────────────────────────────────────────────  │
│  UPCOMING CONTESTS                                                          │
│  ┌──────────────────────────────────────────────────────────┐              │
│  │ ● Codeforces Round 916 (Div.2)  Jan 20 17:35 UTC  2h    │ [Register]  │
│  │ ● AtCoder Regular Contest 168   Jan 21 12:00 UTC  2h    │ [Register]  │
│  │ ○ Codeforces Round 917 (Div.1)  Jan 22 17:35 UTC  2.5h  │ [Register]  │
│  └──────────────────────────────────────────────────────────┘              │
└────────────────────────────────────────────────────────────────────────────┘
```

## 13.4 Analytics View

```
┌─ CPDesk ── ANALYTICS ────────────────────────────────────────────────────────┐
│                                                                             │
│  SUBMISSION ACTIVITY                                     Jan 2024           │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ [GitHub-style heatmap, 52 columns × 7 rows, color: --accent-green]│    │
│  └────────────────────────────────────────────────────────────────────┘    │
│  Total: 287 submissions  |  Days active: 43/90  |  Current streak: 14🔥    │
│                                                                             │
│  CODEFORCES RATING                          TOPIC MASTERY                   │
│  ┌────────────────────────────────┐         ┌─────────────────────────┐    │
│  │         /\    /\              │         │   DP ██████████  82%    │    │
│  │    /\  /  \  /  \            │         │   BinSearch ████  65%   │    │
│  │   /  \/    \/    \  1823      │         │   Graphs ██████   71%   │    │
│  │  /               \           │         │   Trees █████     58%   │    │
│  │ ──────────────────────        │         │   Greedy ████████  79%  │    │
│  │ Sep    Oct    Nov    Jan       │         │   Math ██████████  87%  │    │
│  └────────────────────────────────┘         └─────────────────────────┘    │
│                                                                             │
│  DIFFICULTY EFFICIENCY                      WEAKNESS DETECTION              │
│  ┌────────────────────────────────┐         ┌─────────────────────────┐    │
│  │ 1200  ████████  12 min avg     │         │ ⚠ Trees: 43% WA rate   │    │
│  │ 1300  ████████████  28 min     │         │ ⚠ DP transition: slow  │    │
│  │ 1400  ████████████████  51 min │         │ ✓ Math: strong (87%)   │    │
│  │ 1600  ████████████████████     │         │ Mistakes: off-by-1 (8x)│    │
│  │       > 1h 20 min avg          │         └─────────────────────────┘    │
│  └────────────────────────────────┘                                         │
│                                                                             │
│  [Generate AI Session Analysis]  ← sends anonymized stats to Claude        │
└────────────────────────────────────────────────────────────────────────────┘
```

## 13.5 Command Palette Design

Activated by `Ctrl+P` / `⌘P`. Full-screen dimmed overlay, single input, fuzzy-matched results.

```
┌─────────────────────────────────────────────────────┐
│ > 2100                                               │
│──────────────────────────────────────────────────── │
│ ↳ Open Problem: 2100A  [CF] Balanced Brackets [1600]│
│ ↳ Open Problem: 2100B  [CF] XOR Sequences   [1800] │
│ ↳ Open Problem: 2100C  [CF] LCM Operations  [2100] │
│──────────────────────────────────────────────────── │
│ Commands                                             │
│ ↳ Run Solution          ⌘R                          │
│ ↳ Submit Solution       ⌘⏎                          │
│ ↳ Toggle Focus Mode     ⌘⇧F                         │
│ ↳ Start Stress Test     ⌘⇧T                         │
│ ↳ Insert Template...    ⌘⇧I                         │
└─────────────────────────────────────────────────────┘
```

## 13.6 Keyboard Navigation Map

|Action|Binding|
|---|---|
|Command Palette|`Ctrl+P` / `⌘P`|
|Run solution|`Ctrl+R` / `⌘R`|
|Submit|`Ctrl+Enter` / `⌘Enter`|
|Focus Mode toggle|`Ctrl+Shift+F`|
|Switch to Editor|`Ctrl+1`|
|Switch to Notes|`Ctrl+2`|
|Switch to Editorial|`Ctrl+3`|
|Toggle Sidebar|`Ctrl+B`|
|Start Stress Test|`Ctrl+Shift+T`|
|Insert Template|`Ctrl+Shift+I`|
|Next test case|`Tab` (in judge panel)|
|Navigate panels|`Ctrl+Shift+[←→]`|
|Open problem by ID|`Ctrl+O` then type ID|
|Goto Contests|`Ctrl+Shift+C`|
|Goto Practice|`Ctrl+Shift+P`|
|Goto Analytics|`Ctrl+Shift+A`|

---

# 14. ANALYTICS ARCHITECTURE

## 14.1 Event Taxonomy

Every user action in CPDesk emits an event to `analytics_events`. The event system is **append-only** and drives all derived analytics.

```
Event Taxonomy:

SESSION_STARTED     { session_type: 'practice' | 'contest' }
SESSION_ENDED       { session_id, duration_sec, problems_solved }

PROBLEM_OPENED      { problem_id, in_contest, source: 'calendar'|'search'|'roadmap' }
FIRST_CODE_TYPED    { problem_id, seconds_since_open }    ← debounced 30s threshold
FIRST_COMPILE       { problem_id, seconds_since_open }
FIRST_RUN           { problem_id, result: 'pass'|'fail' }
SAMPLE_PASSED       { problem_id, sample_n }
SAMPLE_FAILED       { problem_id, sample_n }
CUSTOM_RUN          { problem_id }
SUBMITTED           { problem_id, language }
VERDICT_RECEIVED    { problem_id, verdict, time_ms, memory_kb, attempt_number }
MISTAKE_TAGGED      { submission_id, category }
NOTE_SAVED          { problem_id }
EDITORIAL_WRITTEN   { problem_id }
TEMPLATE_INSERTED   { template_name }
STRESS_STARTED      { problem_id }
STRESS_FAILURE_FOUND { problem_id, iteration }
STRESS_COMPLETED    { problem_id, iterations_passed }
```

## 14.2 Derived Metrics

All metrics are computed from the event log at query time (not precomputed), with a 5-minute client-side TTL.

```
Thinking Time ≈ FIRST_CODE_TYPED.timestamp - PROBLEM_OPENED.timestamp
Coding Time   ≈ FIRST_COMPILE.timestamp   - FIRST_CODE_TYPED.timestamp  
Debugging Time≈ VERDICT_RECEIVED(AC).timestamp - FIRST_RUN.timestamp
Total Time    ≈ VERDICT_RECEIVED(AC).timestamp - PROBLEM_OPENED.timestamp

Attempts      = COUNT(SUBMITTED where problem_id = X)
WA Rate       = WA count / total submissions per tag
```

## 14.3 Contest Replay Report Structure

```
Contest Replay: Codeforces Round 915
────────────────────────────────────────
Timeline:
  00:00  Contest started
  00:02  Opened Problem A
  00:04  First code typed (A)  ← 2 min thinking
  00:07  Submitted A → AC      ← 3 min coding
  00:08  Opened Problem B
  00:14  First run (B) — WA
  00:19  Submitted B → WA      ← [mistake: off_by_one]
  00:23  Submitted B → AC
  00:24  Opened Problem C
  00:44  Submitted C → TLE
  00:51  Submitted C → TLE
  01:23  Contest ended (C unsolved)

Summary:
  Solved: 2/5  |  A: 7m  B: 15m  C: DNF
  Thinking time: A=2m, B=6m, C=20m
  WA on B was off-by-one (see mistake log)
  Time lost to C TLE: ~39 minutes
  Upsolve recommendation: C, D
```

## 14.4 Weakness Detection Algorithm

```rust
fn detect_weaknesses(events: &[AnalyticsEvent], submissions: &[Submission]) -> Vec<Weakness> {
    let mut tag_stats: HashMap<String, TagStat> = HashMap::new();

    for sub in submissions {
        for tag in &sub.problem_tags {
            let stat = tag_stats.entry(tag.clone()).or_default();
            match sub.verdict.as_str() {
                "WA" => stat.wa_count += 1,
                "AC" => stat.ac_count += 1,
                "TLE" => stat.tle_count += 1,
                _ => {}
            }
        }
    }

    tag_stats.into_iter()
        .filter(|(_, s)| s.total() >= 5)  // min sample size
        .filter(|(_, s)| s.wa_rate() > 0.35 || s.tle_rate() > 0.25)
        .map(|(tag, stat)| Weakness { tag, stat })
        .collect()
}
```

---

# 15. DEVELOPMENT ROADMAP

## Phase 1 — Minimal Viable Product (10 weeks)

**Goal**: A CP programmer can replace their browser + local editor workflow with CPDesk.

**Features**:

- Tauri application skeleton with dark theme, custom titlebar, layout system
- SQLite database with full schema + migrations
- Codeforces API integration (problems, contests, sample tests)
- Problem cache + offline access for cached problems
- Monaco editor (C++17 only) with autosave
- Local judge: compile + run + sample test execution + diff view
- Workspace auto-creation and file structure
- Basic problem status tracking (solved/attempted/unsolved)
- Codeforces submission (one-click)
- Basic contest list and problem opening
- Settings (compiler path, keybindings, theme)
- Command palette (basic — open problem, run, submit)

**Milestones**:

- M1.1 (Week 2): Tauri skeleton + DB + config system working
- M1.2 (Week 4): CF API integration + problem fetch + workspace creation
- M1.3 (Week 7): Monaco editor + local judge + sample tests
- M1.4 (Week 9): CF submission + status tracking
- M1.5 (Week 10): Polish, keyboard nav, statusbar, command palette

**Risks**:

- CF submission auth is brittle (CSRF, cookies) — build a robust session manager early
- Monaco in Tauri WebView has performance implications — test on lower-end hardware in week 1

---

## Phase 2 — Practice Environment (8 weeks)

**Goal**: A complete practice workflow rivaling a dedicated practice tracker.

**Features**:

- Practice section with full filter UI (difficulty, tags, platform, status)
- Topic roadmaps (CSES section map, CF tag-based)
- Problem notes (Markdown editor + preview)
- Personal editorial system
- Mistake tagging on WA submissions
- Streak tracking + daily activity
- Daily targets system
- Basic analytics: heatmap, streak stats
- CSES problem integration (scraper)
- Template manager (CRUD + insertion)
- Snippet library

**Milestones**:

- M2.1 (Week 2): Practice filter UI + problem table (virtualized)
- M2.2 (Week 4): Notes + editorial system + mistake tagging
- M2.3 (Week 6): Streaks + targets + heatmap
- M2.4 (Week 7): CSES scraper + template manager
- M2.5 (Week 8): Polish + stress tester

---

## Phase 3 — Analytics & Intelligence (8 weeks)

**Goal**: CPDesk generates coaching-level insights from practice data.

**Features**:

- Full analytics dashboard (rating graph, difficulty efficiency, topic radar)
- Weakness detection algorithm
- Mistake pattern database with visualizations
- Session review reports
- AI-powered session analysis via Claude API (opt-in, anonymized data only)
- Contest replay timeline
- AtCoder integration (Phase 3 source)
- Python and Java editor support
- Vim mode in Monaco
- GitHub sync (export solutions to a repo)

**Milestones**:

- M3.1 (Week 2): Analytics engine queries + rating graph + topic radar
- M3.2 (Week 4): Weakness detection + mistake visualization
- M3.3 (Week 5): AI analysis integration (strict anonymization enforced)
- M3.4 (Week 6): Contest replay feature
- M3.5 (Week 8): AtCoder + Python/Java + GitHub sync

---

## Phase 4 — Power User Features (8 weeks)

**Goal**: Features that make professional CP practitioners choose CPDesk exclusively.

**Features**:

- Virtual contest mode (simulate past contests with scoreboard unlock after)
- Rival tracking (monitor handle standings across platforms)
- Smart problem recommendations based on weak tags + difficulty progression
- Advanced stress tester (parallel runs, custom comparator)
- Offline problem sync (pre-fetch N problems per topic to local cache)
- Plugin architecture foundation (extension points exposed)
- Performance profiler view (time vs memory scatter per problem)
- Contest focus mode (complete lockdown of hints)

---

## Phase 5 — Ecosystem & Extension (Future)

**Goal**: CPDesk becomes a platform for the CP community.

**Features**:

- Plugin marketplace (community-built sources, templates, analysis modules)
- Optional cloud sync (CPDesk Account — not required)
- CodeChef, SPOJ integration
- Mobile companion app (iOS/Android — read-only: view stats, problems)
- Team mode (shared workspaces for CP teams)

---

# 16. ENGINEERING CONSIDERATIONS

## 16.1 Performance

- **Virtual scrolling** on all problem lists (TanStack Virtual) — problem lists can have 10,000+ items
- **Debounced autosave** (500ms) — never block the editor thread
- **Background data sync** — contest refreshes, rating fetches in tokio background tasks
- **Lazy analytics computation** — compute heavy queries only when analytics tab is opened
- **Monaco lazy loading** — split-bundle; Monaco is ~5MB; load async on first editor open
- **SQLite WAL mode** — concurrent read/write without blocking
- **HTTP connection pooling** — single shared `reqwest::Client` for all platform requests

## 16.2 Security

- **OS keychain only** for platform credentials — `keyring` crate; never touch config.toml
- **HTML sanitization** — all fetched problem HTML passed through `ammonia` before reaching WebView
- **Content Security Policy** on WebView — block all external resource loads in problem renderer
- **No telemetry** — zero data leaves the machine except explicit user-initiated API calls
- **Code execution** — user's own code, subprocess, no sandbox required for a local dev tool; time + memory limits via OS primitives
- **CSRF tokens** — managed per-session in Rust, never exposed to frontend

## 16.3 Plugin System (Designed in Phase 1, Implemented in Phase 4)

Design extension points from the beginning — don't retrofit:

```rust
// Three stable extension points:
pub trait ProblemSource { ... }          // new CP platforms
pub trait AnalyticsPlugin { ... }        // custom analytics modules
pub trait TemplateProvider { ... }       // custom template libraries

// Plugin manifest (TOML)
// ~/.CPDesk/plugins/my-source/plugin.toml
```

Plugins are Rust dylibs loaded at startup. This is safer than V8/Deno for a performance-sensitive app.

## 16.4 Testing Strategy

- **Unit tests**: Parser modules (CF HTML → structured data), diff algorithm, analytics queries
- **Integration tests**: DB migrations (sqlx test harness), source adapters with mock HTTP server (`wiremock`)
- **End-to-end tests**: Playwright + Tauri WebDriver for critical flows (open problem, run, submit)
- **Property-based tests**: Stress test comparator logic (`proptest` crate)
- **Contract tests**: CF API response deserialization (snapshot tests via `insta`)

**Test command**: `cargo test --workspace` (all Rust); `npm test` (React components via Vitest)

## 16.5 Observability

- **Structured logging**: `tracing` crate in Rust with JSON output in production
- **Log levels**: ERROR for unrecoverable, WARN for unexpected states, INFO for lifecycle events, DEBUG for development
- **Log rotation**: Daily, 7-day retention in `~/.CPDesk/logs/`
- **Performance spans**: `tracing::instrument` on all IPC command handlers — surfaces slow operations
- **Frontend errors**: caught by React error boundaries; sent to Rust logger via `invoke("log_error", ...)`

## 16.6 Cross-Platform Notes

| Concern          | macOS                   | Linux                  | Windows                    |
| ---------------- | ----------------------- | ---------------------- | -------------------------- |
| Keychain         | Security framework      | libsecret / kwallet    | Windows Credential Manager |
| File paths       | `~/CPDesk` = `$HOME/CPDesk` | `$XDG_DATA_HOME/CPDesk`  | `%APPDATA%\CPDesk`           |
| Subprocess shell | `/bin/bash`             | `/bin/bash`            | `cmd.exe`                  |
| Memory limit     | `setrlimit(RLIMIT_AS)`  | `setrlimit(RLIMIT_AS)` | Job Objects API            |
| Code signing     | Notarization required   | AppImage / .deb        | Code signing recommended   |
| Compiler path    | homebrew g++            | system g++             | MSYS2 g++ or WSL           |

## 16.7 Dependency Management

Core Rust dependencies:

```toml
[dependencies]
tauri          = { version = "2", features = ["protocol-asset"] }
tokio          = { version = "1", features = ["full"] }
sqlx           = { version = "0.7", features = ["sqlite", "runtime-tokio-native-tls", "chrono"] }
reqwest        = { version = "0.11", features = ["json", "cookies"] }
serde          = { version = "1", features = ["derive"] }
serde_json     = "1"
scraper        = "0.17"          # HTML parsing for scraping
ammonia        = "3"             # HTML sanitization
keyring        = "2"             # OS keychain
tracing        = "0.1"
tracing-subscriber = { version = "0.3", features = ["json"] }
anyhow         = "1"             # error handling
thiserror      = "1"             # error types
chrono         = { version = "0.4", features = ["serde"] }
uuid           = { version = "1", features = ["v4"] }
async-trait    = "0.1"
tokio-util     = "0.7"
```

---

# 17. RISKS & MITIGATIONS

|Risk|Probability|Impact|Mitigation|
|---|---|---|---|
|CF changes HTML structure → scraping breaks|High (yearly)|Medium|Scraping only for problem statement HTML; metadata via official API. Add integration tests that alert on parse failures.|
|Submission auth breaks (CSRF changes)|Medium|High|Abstract submission behind `SubmissionService`; build a fallback that opens the platform in-app WebView for manual submit|
|Monaco bundle size causes slow startup|Medium|Medium|Lazy-load Monaco on first workspace open; cache after first load|
|SQLite WAL corruption on force-quit|Low|High|WAL mode + periodic `PRAGMA wal_checkpoint`; auto-repair on startup|
|User's C++ produces fork bombs / infinite loops|Low|Medium|`SIGKILL` after time limit + process group kill to catch children|
|Claude API key leaked in logs|Low|High|Regex scrub API keys from all log output; never log Claude request bodies|
|AtCoder ToS violation from scraping|Medium|High|Respect `robots.txt`; add 1s delay between requests; provide user toggle to disable scraping|
|Plugin dylib crashes the main process|Medium|High|Load plugins in isolated tokio tasks with panic catching; plugin crashes don't kill CPDesk|

---

# 18. FUTURE VISION

## 18.1 The 3-Year Product Trajectory

CPDesk in Year 1 is a professional workspace. CPDesk in Year 3 is the operating system for competitive programming — the tool that the top 1% of CP programmers use, and that beginners aspire to graduate into.

**Year 1**: Own the workflow. Every serious CP practitioner who discovers CPDesk stays because leaving means losing their analytics history, their notes, their templates. The data gravity keeps them.

**Year 2**: Own the insight. CPDesk becomes the most accurate mirror of a programmer's strengths and weaknesses. The session analysis, mistake database, and progression curves are accurate enough to replace a human coach for self-directed learners.

**Year 3**: Own the community layer. Optional, opt-in: share templates, share custom roadmaps, see anonymized percentile rankings. The local-first core never changes — cloud is always additive, never required.

## 18.2 Architectural Bets Worth Making Now

1. **Event sourcing the analytics table** — append-only event log means any future analytics feature can be built retroactively. Never throw away a past event.
    
2. **Source abstraction on Day 1** — every platform behind `ProblemSource`. Adding CodeChef in Phase 3 is a one-file addition, not a refactor.
    
3. **Workspace as first-class filesystem citizen** — treating `~/CPDesk/workspace/` as a git repository is a natural extension. Users can already back it up. Commit hooks could auto-push on AC.
    
4. **Plugin architecture before it's needed** — defining extension points now costs 2 days; retrofitting costs 3 weeks.
    

## 18.3 Features Deliberately Left Out

These are explicitly NOT in scope, and that restraint is correct:

- **Cloud sync in Phase 1-3**: Complicates everything, required for nothing. Local-first IS the value.
- **AI code hints or AI solutions**: Fundamentally at odds with the purpose. CPDesk makes you better by making you practice. An AI that solves problems for you is the anti-product.
- **Social/community features before Phase 5**: Don't build a social network. Build a tool first.
- **Browser extension integration**: competitive-companion already does this. CPDesk should have its own problem ingestion; don't depend on extensions.

## 18.4 Long-Term Product Philosophy

CPDesk is built around a simple belief:

The most valuable asset a competitive programmer owns is not their rating.

It is their accumulated knowledge, mistakes, notes, editorials, solve history, and learning patterns.

CPDesk exists to preserve, organize, and analyze that knowledge over years of practice.

Every feature should strengthen that mission.

---

_Document Version: 1.0_  
_Classification: Internal Architecture_  
_Status: Implementation-Ready_

---

> "The best tools disappear. The programmer stops thinking about the tool and starts thinking about the problem."

