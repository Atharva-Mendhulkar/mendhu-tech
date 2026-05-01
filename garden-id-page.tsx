// app/garden/[id]/page.tsx
//
// Each vault .md file gets a canonical shareable URL:
//   mendhu.tech/garden/pinn_abstract
//   mendhu.tech/garden/kphd
//   mendhu.tech/garden/avara_main
//
// On load: opens the GardenModal with that file pre-selected.
// generateStaticParams: reads research.json at build time → zero runtime cost.
// generateMetadata: per-file OG title + description for proper link previews.

import type { Metadata } from "next";
import GardenEntryClient from "@/components/GardenEntryClient";
import researchData from "@/data/research.json";

// ── Types ──────────────────────────────────────────────────────────────────
interface ResearchFile {
  title: string;
  header: string;
  html?: string;
  markdown?: string;
}
interface ResearchData {
  nodes: { id: string; name?: string; label?: string; description?: string; tags?: string[] }[];
  files: Record<string, ResearchFile>;
}

const data = researchData as unknown as ResearchData;

// ── Static generation — one page per vault file ────────────────────────────
export async function generateStaticParams() {
  return Object.keys(data.files).map((id) => ({ id }));
}

// ── Per-file metadata (drives OG preview cards when shared) ───────────────
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const file = data.files[params.id];
  const node = data.nodes.find((n) => n.id === params.id);

  if (!file) {
    return {
      title: "Knowledge Garden — Atharva Mendhulkar",
      description: "Research notes and interconnected knowledge graph.",
    };
  }

  // Extract a plain-text description from the markdown/html (first 160 chars)
  const rawContent = file.markdown ?? file.html ?? "";
  const plainText = rawContent
    .replace(/```[\s\S]*?```/g, "")   // strip code blocks
    .replace(/\[\[([^\]]+)\]\]/g, "$1") // unwrap wikilinks
    .replace(/<[^>]+>/g, "")           // strip HTML
    .replace(/#{1,6}\s/g, "")          // strip headings
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .trim()
    .slice(0, 160);

  const description =
    node?.description ??
    plainText ??
    "Research note from Atharva Mendhulkar's knowledge garden.";

  const url = `https://mendhu.tech/garden/${params.id}`;
  const tags = node?.tags?.join(", ") ?? "";

  return {
    title: `${file.title} — Knowledge Garden · Atharva Mendhulkar`,
    description,
    keywords: tags,
    authors: [{ name: "Atharva Mendhulkar", url: "https://mendhu.tech" }],
    openGraph: {
      title: file.title,
      description,
      url,
      type: "article",
      siteName: "mendhu.tech",
      // OG image will be the default portfolio OG until you add per-note covers
      images: [{ url: "https://mendhu.tech/og-garden.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: file.title,
      description,
      images: ["https://mendhu.tech/og-garden.png"],
    },
    alternates: { canonical: url },
  };
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function GardenFilePage({ params }: { params: { id: string } }) {
  const file = data.files[params.id];

  // JSON-LD for each knowledge note
  const jsonLd = file
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: file.title,
        author: {
          "@type": "Person",
          name: "Atharva Mendhulkar",
          url: "https://mendhu.tech",
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://mendhu.tech/garden/${params.id}`,
        },
        publisher: {
          "@type": "Person",
          name: "Atharva Mendhulkar",
          url: "https://mendhu.tech",
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {/*
        GardenEntryClient renders the full home page
        and auto-opens the GardenModal to the correct file.
        This is a client component so it can use useEffect + state.
      */}
      <GardenEntryClient initialFileId={params.id} />
    </>
  );
}
