# mendhu.tech

A high-fidelity research portfolio and knowledge archive built with Next.js, prioritizing architectural clarity and technical depth.

## Core Features & Implementation

### 1. The Knowledge Garden
A graph-based research archive that visualizes the interconnected nature of systems engineering and AI research.
- **Physics-Based Graph**: Implemented using a custom D3-force simulation on a 2D Canvas for high-performance rendering of complex node relationships.
- **Dynamic Categorization**: Multi-tag classification engine that automatically indexes research notes into relevant disciplines (Systems, AI, Security, etc.) during build-time.
- **Wikilink Resolution**: Custom markdown parser that supports Obsidian-style `[[wikilinks]]` for seamless inter-document navigation.
- **Mermaid Integration**: Real-time rendering of technical sequence diagrams and flowcharts within research notes.

### 2. High-Fidelity Blog Integration (not live yet)
A metadata-driven technical blog designed for deep-dives into kernel-level monitoring and ML research.
- **Headless Content Pipeline**: Uses `gray-matter` to parse markdown frontmatter, allowing for a pure Git-based CMS workflow.
- **Tailored Typography**: Leverages EB Garamond for a classic research feel, contrasted with JetBrains Mono for technical snippets.

### 3. Systems-First Design Language
- **Architectural Aesthetic**: Modeled after drafting paper and blueprints, utilizing radial-gradient grids and hatching patterns.
- **High-Fidelity Animations**: Features a macOS-inspired **Genie effect** for modal transitions and an ultra-fast staggered reveal system.
- **Persistent Interaction**: Includes a 'Banyan' minimization dock and a custom pointer-captured draggable brand icon with magnetic snapping and stable global movement tracking.

### 4. Interactive Dialogue System
The portfolio features a state-driven interaction engine via the Porygon mascot.
- **Anchored Dragging**: Pixel-accurate dragging using click-offset math to ensure the cursor stays attached to the grab point.
- **Contextual Dialogue**: A priority-based messaging system that reacts to user interactions (drag starts, snaps, recalls) and site zones.
- **Zone Awareness**: Robust spatial detection using bounding-box intersection thresholds (100ms dwell time) and entry locks (500ms) to prevent flickering and noise.
- **Evolving State**: Interaction memory that progresses the mascot's persona from neutral to curious based on engagement levels.

## Technical Architecture

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS (v4 compatible) + Vanilla CSS
- **Data Persistence**: JSON-based flat-file database generated from local Markdown vaults.

## Deployment & Setup

This portfolio is designed for automated deployment and easy replication.

### 1. Quick Start
```bash
git clone https://github.com/Atharva-Mendhulkar/mendhu-tech.git
cd mendhu-tech
npm install
npm run dev
```

### 2. Knowledge Garden Sync
The research archive is powered by a local Markdown vault located in `/vault`.
- **Sync Workflow**: A GitHub Action (`.github/workflows/sync-vault.yml`) automatically runs `scripts/parse-vault.mjs` on every push to the vault.
- **Parser**: The script converts Markdown files and frontmatter into a structured `research.json` used by the Knowledge Garden.

### 3. Vercel Deployment
The project is optimized for **Vercel**. 
1. Connect your GitHub repository to Vercel.
2. Ensure the build command is `npm run build`.
3. Set up the following environment variables if you use Hashnode integration:
   - `HASHNODE_PUBLICATION_ID` (Optional)

---
Built by Atharva Mendhulkar
