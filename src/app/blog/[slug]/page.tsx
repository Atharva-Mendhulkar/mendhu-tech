// app/blog/[slug]/page.tsx
import { getPost, getAllSlugs, getRelatedPosts, formatDate, TAG_COLORS, defaultTagColor } from "@/lib/hashnode";
import { notFound }      from "next/navigation";
import type { Metadata } from "next";
import Link              from "next/link";
import PostBody          from "@/components/blog/PostBody";
import TableOfContents   from "@/components/blog/TableOfContents";
import SeriesNav         from "@/components/blog/SeriesNav";
import CustomCursor     from "@/components/CustomCursor";

// ── SSG ────────────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  try {
    const slugs = await getAllSlugs();
    return slugs.map(slug => ({ slug }));
  } catch (err) {
    console.error("generateStaticParams failed:", err);
    return [];
  }
}

// Rebuild stale posts hourly (ISR)
export const revalidate = 3600;

// ── Metadata ────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Post not found" };

  const seoTitle = post.seo?.title ?? `${post.title} — Atharva Mendhulkar`;
  const seoDesc  = post.seo?.description ?? post.brief;
  const url      = `https://mendhu.tech/blog/${post.slug}`;

  return {
    title:       seoTitle,
    description: seoDesc,
    keywords:    post.tags.map(t => t.name),
    authors:     [{ name: "Atharva Mendhulkar", url: "https://mendhu.tech" }],
    openGraph: {
      title:         post.title,
      description:   seoDesc,
      url,
      type:          "article",
      publishedTime: post.publishedAt,
      modifiedTime:  post.updatedAt,
      authors:       ["Atharva Mendhulkar"],
      tags:          post.tags.map(t => t.name),
      images:        post.coverImage ? [{ url: post.coverImage.url }] : [{ url: "/og-default.png" }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       post.title,
      description: seoDesc,
      images:      post.coverImage ? [post.coverImage.url] : ["/og-default.png"],
    },
    alternates: { canonical: url },
  };
}

// ── Page ────────────────────────────────────────────────────────────────────
export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.slug, post.tags, 2);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline:    post.title,
    description: post.brief,
    author: {
      "@type": "Person",
      name: "Atharva Mendhulkar",
      url:  "https://mendhu.tech",
      sameAs: [
        "https://github.com/Atharva-Mendhulkar",
        "https://x.com/atharvanta",
      ],
    },
    datePublished:      post.publishedAt,
    dateModified:       post.updatedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://mendhu.tech/blog/${post.slug}` },
    keywords: post.tags.map(t => t.name).join(", "),
    ...(post.coverImage && { image: post.coverImage.url }),
    publisher: {
      "@type": "Person",
      name: "Atharva Mendhulkar",
      url:  "https://mendhu.tech",
    },
  };

  return (
    <main className="relative">
      <CustomCursor />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Outer shell */}
      <div className="max-w-[960px] mx-auto border-x border-dashed border-border-strong min-h-screen relative">

        {/* Inner paper + diagonal hatch */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundColor: "var(--paper)",
          backgroundImage: `repeating-linear-gradient(-45deg,rgba(0,0,0,0.055) 0px,rgba(0,0,0,0.055) 1px,transparent 1px,transparent 9px)`,
        }} />

        {/* Corner marks */}
        {[{t:2,l:4},{t:2,r:4},{b:2,l:4},{b:2,r:4}].map((pos,i) => (
          <span key={i} aria-hidden style={{ position:"absolute",...pos as any,zIndex:2,fontFamily:"var(--font-mono)",fontSize:9,color:"var(--ink-faint)",userSelect:"none" }}>+</span>
        ))}

        <div className="relative" style={{ zIndex: 1 }}>

          {/* Two-column layout: prose + sticky ToC */}
          <div className="flex gap-0">

            {/* LEFT — article */}
            <article className="flex-1 min-w-0 px-8 lg:px-12 py-16">

              {/* Back */}
              <Link href="/blog" className="font-mono text-[10px] text-ink-faint hover:text-accent transition-colors mb-10 block w-fit"
                style={{ borderBottom: "1px dashed transparent" }}>
                ← all posts
              </Link>

              {/* Series breadcrumb */}
              {post.series && (
                <div className="font-mono text-[9.5px] text-ink-faint mb-4 flex items-center gap-2">
                  <span>Series:</span>
                  <span style={{ color: "var(--accent)", borderBottom: "1px dashed var(--accent)" }}>
                    {post.series.name}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-normal leading-[1.15] tracking-[-0.01em] text-ink mb-5">
                {post.title}
              </h1>

              {/* Meta bar */}
              <div className="flex items-center gap-3 font-mono text-[10px] text-ink-faint mb-6 flex-wrap">
                <span>{formatDate(post.publishedAt)}</span>
                <span className="text-border-strong">·</span>
                <span>{post.readTimeInMinutes} min read</span>
                <span className="text-border-strong">·</span>
                <span>Atharva Mendhulkar</span>
              </div>

              {/* Tags */}
              <div className="flex gap-2 flex-wrap mb-8">
                {post.tags.map(tag => {
                  const c = TAG_COLORS[tag.slug] ?? defaultTagColor;
                  return (
                    <Link key={tag.slug} href={`/blog?tag=${tag.slug}`}
                      className="font-mono text-[9px] px-2 py-0.5 hover:border-solid transition-all"
                      style={{ background: c.bg, border: `1px dashed ${c.border}`, color: c.text, borderRadius: 2 }}>
                      {tag.name}
                    </Link>
                  );
                })}
              </div>

              {/* Cover image */}
              {post.coverImage && (
                <div className="mb-10 border border-dashed border-border-strong overflow-hidden" style={{ borderRadius: 2 }}>
                  <img src={post.coverImage.url} alt={post.title} className="w-full object-cover" />
                </div>
              )}

              {/* Dashed rule */}
              <div style={{ borderTop: "1px dashed var(--border-strong)", marginBottom: 40 }} />

              {/* Content */}
              {post.content && <PostBody html={post.content.html} />}

              {/* Bottom rule */}
              <div style={{ borderTop: "1px dashed var(--border-strong)", marginTop: 48, marginBottom: 40 }} />

              {/* Series nav */}
              {post.series && <SeriesNav series={post.series} currentSlug={post.slug} />}

              {/* Related posts */}
              {related.length > 0 && (
                <div className="mt-12">
                  <div className="section-tag mb-6">[related_posts]</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {related.map(r => {
                      const c = r.tags[0] ? (TAG_COLORS[r.tags[0].slug] ?? defaultTagColor) : defaultTagColor;
                      return (
                        <Link key={r.slug} href={`/blog/${r.slug}`}
                          className="block p-4 border border-dashed border-border-strong hover:border-solid transition-all"
                          style={{ borderRadius: 2 }}>
                          <div className="font-mono text-[9px] text-ink-faint mb-2">{formatDate(r.publishedAt)}</div>
                          <div className="font-serif text-[16px] text-ink leading-[1.3] mb-2">{r.title}</div>
                          <span className="font-mono text-[9px] text-accent">Read →</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Footer */}
              <footer className="mt-16 pt-6 border-t border-dashed border-border-strong">
                <div className="font-mono text-[10px] text-ink-faint flex items-center gap-3 flex-wrap">
                  <Link href="/blog" className="hover:text-accent transition-colors">← blog</Link>
                  <span>|</span>
                  <Link href="/" className="hover:text-accent transition-colors">mendhu.tech</Link>
                  <span>|</span>
                  <a href={`https://x.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://mendhu.tech/blog/${post.slug}`)}`}
                    target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                    share on X ↗
                  </a>
                </div>
              </footer>
            </article>

            {/* RIGHT — sticky Table of Contents */}
            <aside className="hidden lg:block w-[220px] shrink-0 border-l border-dashed border-border-strong">
              <div className="sticky top-6 pt-16 px-5">
                <TableOfContents html={post.content?.html ?? ""} />
              </div>
            </aside>

          </div>
        </div>
      </div>
    </main>
  );
}
