import type { Metadata } from "next";
import GardenEntryClient from "@/components/GardenEntryClient";
import { getLatestPosts } from "@/lib/hashnode";
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
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const file = data.files[id];
  const node = data.nodes.find((n) => n.id === id);

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

  const url = `https://www.mendhu.tech/garden/${id}`;
  const tags = node?.tags?.join(", ") ?? "";

  return {
    title: `${file.title} — Knowledge Garden · Atharva Mendhulkar`,
    description,
    keywords: tags,
    authors: [{ name: "Atharva Mendhulkar", url: "https://www.mendhu.tech" }],
    openGraph: {
      title: file.title,
      description,
      url,
      type: "article",
      siteName: "mendhu.tech",
      images: [{ url: "https://www.mendhu.tech/og-garden.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: file.title,
      description,
      images: ["https://www.mendhu.tech/og-garden.png"],
    },
    alternates: { canonical: url },
  };
}


// ── Page ───────────────────────────────────────────────────────────────────
export default async function GardenFilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const file = data.files[id];
  const initialPosts = await getLatestPosts();

  const jsonLd = file
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: file.title,
        author: {
          "@type": "Person",
          name: "Atharva Mendhulkar",
          url: "https://www.mendhu.tech",
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://www.mendhu.tech/garden/${id}`,
        },
        publisher: {
          "@type": "Person",
          name: "Atharva Mendhulkar",
          url: "https://www.mendhu.tech",
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
      <GardenEntryClient initialFileId={id} initialPosts={initialPosts} />
    </>
  );
}
