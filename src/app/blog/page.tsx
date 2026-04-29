// app/blog/page.tsx
import { getAllPosts, formatDate, TAG_COLORS, defaultTagColor } from "@/lib/hashnode";
import type { Metadata } from "next";
import Link from "next/link";
import CustomCursor from "@/components/CustomCursor";

export const metadata: Metadata = {
  title: "Atharva Mendhulkar Blogs | Technical Essays & ML Research",
  description: "Official blogs of Atharva Mendhulkar. Deep dives in physics-informed ML, distributed networks, AI security architectures, and autonomous agent safety.",
  keywords: ["Atharva Mendhulkar", "Atharva blogs", "Atharva Mendhulkar blogs", "mendhu blogs", "engineering", "ML Research", "AI Security"],
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: "Atharva Mendhulkar Blogs | Technical Essays & ML Research",
    description: "Official blogs of Atharva Mendhulkar. Covering AI, ML, and systems engineering.",
    url: "https://mendhu.tech/blog",
  },
};

export const revalidate = 3600;

interface PageProps {
  searchParams: Promise<{ tag?: string }> | { tag?: string };
}

export default async function BlogIndex({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const activeTag = resolvedSearchParams.tag ?? "all";
  const allPosts  = await getAllPosts();

  // Extract unique tags dynamically from live posts
  const dynamicTagsMap = new Map<string, string>();
  allPosts.forEach(post => {
    post.tags.forEach(t => {
      const tSlug = t.slug || t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      dynamicTagsMap.set(tSlug, t.name);
    });
  });

  const dynamicFilters = [
    { label: "all", slug: "all" },
    ...Array.from(dynamicTagsMap.entries()).map(([slug, name]) => ({
      label: name.toLowerCase(),
      slug: slug
    }))
  ];

  const posts     = activeTag === "all"
    ? allPosts
    : allPosts.filter(p => p.tags.some(t => {
        const tSlug = t.slug || t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        return tSlug === activeTag;
      }));

  return (
    <main className="relative">
      <CustomCursor />
      {/* Outer shell — same as portfolio, body dot grid shows on margins */}
      <div className="max-w-[960px] mx-auto border-x border-dashed border-border-strong min-h-screen relative">

        {/* Inner paper + diagonal hatch */}
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
            backgroundColor: "var(--paper)",
            backgroundImage: `repeating-linear-gradient(-45deg,rgba(0,0,0,0.055) 0px,rgba(0,0,0,0.055) 1px,transparent 1px,transparent 9px)`,
          }}
        />

        {/* Corner marks */}
        {[{t:2,l:4},{t:2,r:4},{b:2,l:4},{b:2,r:4}].map((pos,i) => (
          <span key={i} aria-hidden style={{ position:"absolute", ...pos as any, zIndex:2, fontFamily:"var(--font-mono)", fontSize:9, color:"var(--ink-faint)", userSelect:"none" }}>+</span>
        ))}

        <div className="relative px-8 lg:px-12 py-16" style={{ zIndex: 1 }}>

          {/* Back link */}
          <Link href="/" className="font-mono text-[10px] text-ink-faint hover:text-accent transition-colors mb-12 block w-fit" style={{ borderBottom: "1px dashed transparent" }}>
            ← mendhu.tech
          </Link>

          {/* Section tag */}
          <div className="section-tag mb-8">[05_INTELLECTUAL_LOG]</div>

          {/* Header */}
          <h1 className="font-serif text-[42px] font-normal tracking-[-0.02em] leading-[1.1] mb-3 text-ink">
            Blogs
          </h1>
          <p className="font-mono text-[12px] text-ink-muted mb-10 max-w-[520px]">
            Physics-informed ML · Linux kernel systems · AI agent security · SaaS engineering.
            {" "}{posts.length} {activeTag === "all" ? "total" : activeTag} posts.
          </p>

          {/* Tag filters */}
          <div className="flex gap-2 flex-wrap mb-12">
            {dynamicFilters.map((f: { label: string; slug: string }) => {
              const isActive = f.slug === activeTag;
              const col = f.slug !== "all" ? (TAG_COLORS[f.slug] ?? defaultTagColor) : null;
              return (
                <Link key={f.slug} href={f.slug === "all" ? "/blog" : `/blog?tag=${f.slug}`}
                  className="font-mono text-[10px] px-3 py-1.5 transition-all"
                  style={{
                    border: `1px ${isActive ? "solid" : "dashed"} ${isActive && col ? col.border : "var(--border-strong)"}`,
                    background: isActive && col ? col.bg : "transparent",
                    color: isActive && col ? col.text : isActive ? "var(--accent)" : "var(--ink-muted)",
                    borderRadius: 2,
                    borderColor: isActive ? (col?.border ?? "var(--accent)") : "var(--border-strong)",
                  }}>
                  {f.label}
                </Link>
              );
            })}
          </div>

          {/* Posts */}
          {posts.length === 0 ? (
            <div className="font-mono text-[11px] text-ink-faint py-16 text-center border border-dashed border-border-strong" style={{ borderRadius: 2 }}>
              No posts yet in this category. Check back soon.
            </div>
          ) : (
            <div>
              {posts.map((post) => {
                return (
                  <article key={post.slug}>
                    <Link href={`/blog/${post.slug}`} className="group block py-8 border-b border-dashed border-border-strong hover:border-solid transition-all">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1 min-w-0">
                          {/* Meta */}
                          <div className="flex items-center gap-3 mb-3 font-mono text-[9.5px] text-ink-faint">
                            <span>{formatDate(post.publishedAt)}</span>
                            <span>·</span>
                            <span>{post.readTimeInMinutes} min read</span>
                            {post.series && (
                              <>
                                <span>·</span>
                                <span style={{ color: "var(--accent)" }}>Series: {post.series.name}</span>
                              </>
                            )}
                          </div>

                          {/* Title */}
                          <h2 className="font-serif text-[22px] font-normal leading-[1.3] text-ink mb-3 group-hover:text-accent transition-all">
                            {post.title}
                          </h2>

                          {/* Brief */}
                          <p className="font-mono text-[11px] text-ink-muted leading-[1.7] mb-4 line-clamp-2">
                            {post.brief}
                          </p>

                          {/* Tags */}
                          <div className="flex gap-2 flex-wrap">
                            {post.tags.map(tag => {
                              const tSlug = tag.slug || tag.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                              const c = TAG_COLORS[tSlug] ?? defaultTagColor;
                              return (
                                <span key={tSlug} className="font-mono text-[9px] px-2 py-0.5"
                                  style={{ background: c.bg, border: `1px dashed ${c.border}`, color: c.text, borderRadius: 2 }}>
                                  {tag.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Arrow */}
                        <span className="font-mono text-[11px] text-ink-faint group-hover:text-accent transition-colors shrink-0 mt-1">
                          Read →
                        </span>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <footer className="pt-16 pb-8 border-t border-dashed border-border-strong mt-4">
            <div className="font-mono text-[10px] text-ink-faint flex items-center gap-3">
              <Link href="/" className="hover:text-accent transition-colors">← portfolio</Link>
              <span>|</span>
              <span>mendhu.tech/blog</span>
              <span>|</span>
              <a href="https://atharvarta.hashnode.dev/" className="hover:text-accent transition-colors" target="_blank" rel="noopener noreferrer">hashnode ↗</a>
            </div>
          </footer>

        </div>
      </div>
    </main>
  );
}
