// app/blog/[slug]/page.tsx
import { getPost, getAllSlugs, getRelatedPosts, formatDate, TAG_COLORS, defaultTagColor } from "@/lib/hashnode";
import { notFound }      from "next/navigation";
import type { Metadata } from "next";
import Link              from "next/link";
import Image             from "next/image";
import PostBody          from "@/components/blog/PostBody";
import TableOfContents   from "@/components/blog/TableOfContents";
import SeriesNav         from "@/components/blog/SeriesNav";
import CustomCursor     from "@/components/CustomCursor";
import BlogShareButton from "@/components/blog/BlogShareButton";
import ClapButton      from "@/components/blog/ClapButton";

export const dynamic = "force-static";

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
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> | { slug: string } }): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);
  if (!post) return { title: "Post not found" };

  const seoTitle = post.seo?.title ?? `${post.title} — Atharva Mendhulkar`;
  const seoDesc  = post.seo?.description ?? post.brief;
  const url      = `https://www.mendhu.tech/blog/${resolvedParams.slug}`;

  return {
    title:       `${post.title} | Atharva Mendhulkar`,
    description: seoDesc,
    keywords:    [...post.tags.map(t => t.name), "Atharva Mendhulkar", "Atharva blogs", "Atharva Mendhulkar blogs", "mendhu blogs", "engineering blog"],
    authors:     [{ name: "Atharva Mendhulkar", url: "https://www.mendhu.tech" }],
    alternates:  { canonical: url },
    robots:      { index: true, follow: true },
    openGraph: {
      title:         post.title,
      description:   seoDesc,
      url,
      type:          "article",
      publishedTime: post.publishedAt,
      modifiedTime:  post.updatedAt,
      authors:       ["Atharva Mendhulkar"],
      tags:          post.tags.map(t => t.name),
      images:        post.coverImage ? [{ url: post.coverImage.url }] : [{ url: "https://www.mendhu.tech/og-default.png" }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       post.title,
      description: seoDesc,
      images:      post.coverImage ? [post.coverImage.url] : ["https://www.mendhu.tech/og-default.png"],
    },
  };
}

// ── Page ────────────────────────────────────────────────────────────────────
export default async function PostPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);
  if (!post) notFound();

  const related = await getRelatedPosts(resolvedParams.slug, post.tags, 2);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
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
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://www.mendhu.tech/blog/${post.slug}` },
    keywords: post.tags.map(t => t.name).join(", "),
    ...(post.coverImage && { image: post.coverImage.url }),
    publisher: {
      "@type": "Person",
      name: "Atharva Mendhulkar",
      url:  "https://www.mendhu.tech",
    },
  };

  return (
    <main className="relative">
      <CustomCursor />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Outer shell */}
      <div className="w-full min-h-screen relative" style={{ backgroundColor: "var(--paper)" }}>

        {/* Corner marks */}
        {[{t:2,l:4},{t:2,r:4},{b:2,l:4},{b:2,r:4}].map((pos,i) => (
          <span key={i} aria-hidden style={{ position:"absolute",...pos as any,zIndex:2,fontFamily:"var(--font-mono)",fontSize:9,color:"var(--ink-faint)",userSelect:"none" }}>+</span>
        ))}

        <div className="relative" style={{ zIndex: 1 }}>

          {/* Two-column layout with left gutter: spacer + prose + sticky ToC */}
          <div className="flex gap-0">
            {/* Left Gutter spacer */}
            <div className="hidden md:block md:w-16 lg:w-24 border-r border-dashed border-border-strong relative" aria-hidden />

            {/* article */}
            <article className="flex-1 min-w-0 px-8 lg:pl-16 lg:pr-24 py-16 relative">
              
              {/* Top-right Actions */}
              <div className="absolute top-16 right-8 lg:right-24 z-10 flex flex-col items-end gap-6">
                <BlogShareButton title={post.title} slug={post.slug} />
              </div>

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
                <span>Written by Atharva Mendhulkar</span>
              </div>

              {/* Tags */}
              <div className="flex gap-2 flex-wrap mb-8">
                {post.tags.map(tag => {
                  const tSlug = tag.slug || tag.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                  const c = TAG_COLORS[tSlug] ?? defaultTagColor;
                  return (
                    <Link key={tSlug} href={`/blog?tag=${tSlug}`}
                      className="font-mono text-[9px] px-2 py-0.5 hover:border-solid transition-all"
                      style={{ background: c.bg, border: `1px dashed ${c.border}`, color: c.text, borderRadius: 2 }}>
                      {tag.name}
                    </Link>
                  );
                })}
              </div>

              {/* Cover image */}
              {post.coverImage && (
                <div className="mb-10 border border-dashed border-border-strong overflow-hidden relative w-full aspect-video" style={{ borderRadius: 2, backgroundColor: "rgba(0,0,0,0.02)" }}>
                  <Image 
                    src={post.coverImage.url} 
                    alt={post.title} 
                    fill 
                    className="object-contain" 
                    priority
                  />
                </div>
              )}

              {/* Dashed rule */}
              <div style={{ borderTop: "1px dashed var(--border-strong)", marginBottom: 40 }} />

              {/* Content */}
              {post.content && <PostBody html={post.content.html} />}

              {/* Claps */}
              <div className="mt-16 flex flex-col items-center">
                <ClapButton slug={post.slug} />
              </div>

              {/* Bottom rule */}
              <div style={{ borderTop: "1px dashed var(--border-strong)", marginTop: 48, marginBottom: 40 }} />

              {/* Series nav */}
              {post.series && <SeriesNav series={post.series} currentSlug={post.slug} />}

              {/* Related Posts */}
              {related.length > 0 && (
                <div className="mt-24 pt-16 border-t border-dashed border-border-strong">
                  <div className="section-tag mb-8">[03_FURTHER_READING]</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {related.map(p => (
                      <Link 
                        key={p.slug} 
                        href={`/blog/${p.slug}`}
                        className="group block p-6 border border-dashed border-border-strong hover:border-solid hover:border-accent transition-all bg-[rgba(253,253,251,0.5)]"
                        style={{ borderRadius: 2 }}
                      >
                        <div className="font-mono text-[9px] text-ink-faint mb-3 uppercase tracking-wider">
                          {formatDate(p.publishedAt)}
                        </div>
                        <h3 className="font-serif text-[18px] text-ink mb-3 group-hover:text-accent transition-colors leading-tight">
                          {p.title}
                        </h3>
                        <div className="font-mono text-[10px] text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                          Read →
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <footer className="mt-24 pt-8 border-t border-dashed border-border-strong">
                <div className="font-mono text-[10px] text-ink-faint flex items-center gap-3 flex-wrap">
                  <Link href="/blog" className="hover:text-accent transition-colors">← blog</Link>
                  <span>|</span>
                  <Link href="/" className="hover:text-accent transition-colors">www.mendhu.tech</Link>
                  <span>|</span>
                  <a href={`https://x.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://www.mendhu.tech/blog/${post.slug}`)}`}
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
