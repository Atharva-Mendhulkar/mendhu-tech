# mendhu.tech

A high-fidelity portfolio and knowledge archive built with Next.js, prioritizing architectural clarity and technical depth.

## Core Features & Implementation

### 1. The Knowledge Garden
A graph-based research archive that visualizes the interconnected nature of my knowledge and research.
- **Physics-Based Graph**: Implemented using a custom D3-force simulation on a 2D Canvas for high-performance rendering of complex node relationships.
- **Dynamic Categorization**: Multi-tag classification engine that automatically indexes research notes into relevant disciplines (Systems, AI, Security, etc.) during build-time.
- **Wikilink Resolution**: Custom markdown parser that supports Obsidian-style `[[wikilinks]]` for seamless inter-document navigation.
- **Mermaid Integration**: Real-time rendering of technical sequence diagrams and flowcharts within research notes.

### 2. High-Fidelity Blog Integration (not live yet)
A metadata-driven technical blog designed for deep-dives into kernel-level monitoring and ML research.
- **Headless Content Pipeline**: Uses `gray-matter` to parse markdown frontmatter, allowing for a pure Git-based CMS workflow.
- **Tailored Typography**: Leverages EB Garamond for a classic research feel, contrasted with JetBrains Mono for technical snippets.
- **Animated Transition System**: Implements specialized CSS keyframes and React-controlled state transitions for a fluid "blueprint" reveal effect.

### 3. Systems-First Design Language
- **Architectural Aesthetic**: Modeled after drafting paper and blueprints, utilizing radial-gradient grids and hatching patterns.
- **Interactive Telemetry**: Includes specialized UI components like the `LogBar` marquee and a custom pointer-captured draggable brand icon with magnetic snapping.

## Technical Architecture

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS (v4 compatible) + Vanilla CSS
- **Data Persistence**: JSON-based flat-file database generated from local Markdown vaults.
- **CI/CD**: GitHub Actions pipeline for automated vault synchronization and research data generation.

