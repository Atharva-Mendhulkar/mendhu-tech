export interface LocalPost {
  title: string;
  slug: string;
  brief: string;
  content: {
    html: string;
    markdown: string;
  };
  publishedAt: string;
  updatedAt: string;
  readTimeInMinutes: number;
  tags: { name: string; slug: string }[];
  coverImage: { url: string } | null;
  series: any;
  seo: {
    title: string;
    description: string;
  };
}

export const localBlogs: LocalPost[] = [
  {
    title: "AI Agent Security Threats: The Complete Landscape, Real Risks, and Why Most Defenses Fail",
    slug: "ai-agent-security-threats",
    brief: "Autonomous AI agents are no longer experimental. They are deployed across production systems with access to APIs, databases, internal tools, and critical infrastructure. Security, however, has not kept pace.",
    content: {
      html: `
Introduction

Autonomous AI agents are no longer experimental. They are deployed across production systems with access to APIs, databases, internal tools, and critical infrastructure. What changed between 2024 and 2026 is not capability alone, but agency.

Agents now:
* take actions without human approval
* chain tools across systems
* operate continuously at machine speed

Security, however, has not kept pace.

Most current defenses do not apply. And most threats are still unsolved.

### The Core Problem: Security Assumptions Are Broken

Traditional systems assume:
* humans make decisions
* APIs are deterministic
* permissions are enforced statically

AI agents violate all three. They:
* interpret natural language from untrusted sources
* execute multi-step actions across systems
* escalate privileges through reasoning, not policy

### Why Existing Security Controls Fail

Frameworks like firewalls, RBAC, and IAM were designed for static systems with explicit actions. AI agents instead operate through implicit intent, probabilistic reasoning, and dynamic tool orchestration. Attacks target reasoning pathways.

### Indirect Prompt Injection: The Invisible Layer

The real threat now is indirect prompt injection, where malicious instructions are hidden inside documents, emails, APIs, or tool metadata.

#### Embedding-Level Poisoning (RAG Systems)
In Retrieval-Augmented Generation systems, data is converted into embeddings and retrieved based on similarity. Attackers exploit this by embedding instructions inside the vector space itself.
      `,
      markdown: "..."
    },
    publishedAt: "2026-04-29T00:00:00.000Z",
    updatedAt: "2026-04-29T00:00:00.000Z",
    readTimeInMinutes: 15,
    tags: [
      { name: "research", slug: "research" },
      { name: "AI Security", slug: "explained" }
    ],
    coverImage: null,
    series: null,
    seo: {
      title: "AI Agent Security Threats",
      description: "Comprehensive analysis of AI agent security risks"
    }
  },
  {
    title: "Building an Offline AR Heritage Guide — From Hackathon Idea to Samsung PRISM Finalist",
    slug: "building-offline-ar-heritage-guide",
    brief: "Most campus tours are forgettable. This is the story of how we built Campus AR Heritage Guide, an offline-first augmented reality system that became a finalist at the Samsung PRISM Metaverse Hackathon.",
    content: {
      html: `
Introduction

Most campus tours are forgettable. You walk past buildings, glance at plaques, and leave without understanding why anything matters.

We wanted to change that.

### The Core Idea

What if history wasn't something you read, but something you see layered onto the real world? We built a system where you walk near a monument, your phone understands where you are, and overlays its story directly in front of you. No internet required.
      `,
      markdown: "..."
    },
    publishedAt: "2026-04-28T00:00:00.000Z",
    updatedAt: "2026-04-28T00:00:00.000Z",
    readTimeInMinutes: 10,
    tags: [
      { name: "build-log", slug: "build-log" },
      { name: "Mobile AR", slug: "explained" }
    ],
    coverImage: null,
    series: null,
    seo: {
      title: "Building an Offline AR Heritage Guide",
      description: "How we built an offline AR platform for heritage sites."
    }
  }
];
