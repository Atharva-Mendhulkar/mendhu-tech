import type { Metadata } from "next";
import ProjectEntryClient from "@/components/ProjectEntryClient";
import { getMediumPosts } from "@/lib/medium";
import { projects } from "@/data/projects";

// ── Static generation — one page per project ────────────────────────────────
export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

// ── Per-project metadata (rich OG preview cards when shared) ────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug || p.id === slug);

  if (!project) {
    return {
      title: "Project Not Found — Atharva Mendhulkar",
      description: "Systems Engineer & AI Researcher portfolio.",
    };
  }

  const url = `https://www.mendhu.tech/project/${project.slug}`;
  const title = `${project.title} — ${project.subtitle} · Atharva Mendhulkar`;
  const description = project.oneLiner;
  const tags = project.tags.join(", ");

  return {
    title,
    description,
    keywords: tags,
    authors: [{ name: "Atharva Mendhulkar", url: "https://www.mendhu.tech" }],
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "mendhu.tech",
      images: [
        {
          url: "https://www.mendhu.tech/og-image.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://www.mendhu.tech/og-image.png"],
    },
    alternates: { canonical: url },
  };
}

// ── Page ────────────────────────────────────────────────────────────────────
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug || p.id === slug);
  const { posts: allPosts } = await getMediumPosts().catch(() => ({ posts: [] }));
  const initialPosts = allPosts.slice(0, 2);

  const jsonLd = project
    ? {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: project.title,
        headline: project.subtitle,
        description: project.oneLiner,
        applicationCategory: project.category,
        operatingSystem: "Multi-platform",
        author: {
          "@type": "Person",
          name: "Atharva Mendhulkar",
          url: "https://www.mendhu.tech",
        },
        url: `https://www.mendhu.tech/project/${project.slug}`,
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
      <ProjectEntryClient
        initialProjectId={project?.id || slug}
        initialPosts={initialPosts}
      />
    </>
  );
}
