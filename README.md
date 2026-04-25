# Atharva Mendhulkar — Portfolio & Knowledge Garden

Systems Engineer & AI Researcher. Exploring the intersection of physics-informed machine learning and kernel-level infrastructure.

[mendhu.tech](https://mendhu.tech)

---

## 🏛️ Project Architecture

This repository contains my personal portfolio and a specialized **Knowledge Garden** interface. The architecture is designed for high-fidelity technical storytelling.

### 🌿 Knowledge Garden
A deterministic, interactive knowledge graph built from raw research notes.
- **Sync Engine**: A custom Node.js script (`scripts/parse-vault.mjs`) that transforms an Obsidian vault into a high-performance JSON graph.
- **Rendering**: Real-time rendering of Mermaid diagrams, GFM markdown, and wikilink navigation.
- **Physics**: Force-directed layout using custom canvas simulation for high-density node interactions.

### 🧪 Systems Lab
A curated index of research and engineering projects.
- **Data-Driven**: Projects are defined in `src/data/projects.ts` with real-time performance metrics.
- **Responsive**: Fully optimized for mobile and desktop exploration.

## 🛠️ Technical Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Vanilla CSS + Tailwind CSS (Wireframe aesthetic)
- **Visuals**: Lucide Icons, Mermaid.js
- **Typography**: EB Garamond (Serif), JetBrains Mono (Monospace)
- **Deployment**: Vercel

## ⚙️ Development

### Installation
```bash
npm install
```

### Knowledge Garden Sync
To update the Knowledge Garden with new research notes from the `/vault` directory:
```bash
node scripts/parse-vault.mjs
```

### Run Locally
```bash
npm run dev
```

## 📜 License
MIT © [Atharva Mendhulkar](https://github.com/Atharva-Mendhulkar)
