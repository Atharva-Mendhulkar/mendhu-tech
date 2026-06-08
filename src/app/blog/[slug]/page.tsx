import "./article.css";
import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getMediumPostBySlug,
  getMediumPosts,
  formatDate,
  getExcerpt,
  addHeadingIds,
  TAG_COLORS,
  defaultTagColor,
} from "@/lib/medium";
import TableOfContents from "@/components/blog/TableOfContents";
import ShareButton from "./ShareButton";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const { posts } = await getMediumPosts();
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getMediumPostBySlug(slug);

  if (!post) {
    return {
      title: "Blog Post Not Found | mendhu.tech",
      description: "The requested log could not be located.",
    };
  }

  const desc = getExcerpt(post.content || post.description, 160);
  const url = `https://www.mendhu.tech/blog/${post.slug}`;

  return {
    title: `${post.title} — Technical Essays | mendhu.tech`,
    description: desc,
    authors: [{ name: post.author, url: "https://www.mendhu.tech" }],
    openGraph: {
      title: post.title,
      description: desc,
      url,
      type: "article",
      siteName: "mendhu.tech",
      publishedTime: post.pubDate,
      images: post.thumbnail ? [{ url: post.thumbnail }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: desc,
      images: post.thumbnail ? [post.thumbnail] : [],
    },
    alternates: { canonical: url },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const { posts } = await getMediumPosts();
  const post = posts.find((p) => p.slug === slug || p.link.includes(slug));
  const otherPosts = posts.filter((p) => p.slug !== slug).slice(0, 2);


  if (!post) {
    notFound();
  }

  const { htmlWithIds, headings } = addHeadingIds(post.content || post.description);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: getExcerpt(post.content || post.description, 160),
    datePublished: post.pubDate,
    dateModified: post.pubDate,
    author: {
      "@type": "Person",
      name: post.author,
      url: "https://www.mendhu.tech",
    },
    publisher: {
      "@type": "Organization",
      name: "mendhu.tech",
      url: "https://www.mendhu.tech",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.mendhu.tech/blog/${post.slug}`,
    },
    image: post.thumbnail ? [post.thumbnail] : undefined,
  };

  return (
    <main className="relative selection:bg-accent/10 selection:text-accent">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Outer shell */}
      <div className="max-w-[1200px] mx-auto border-x border-dashed border-border-strong min-h-screen relative">
        {/* Inner paper + diagonal hatch */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            backgroundColor: "var(--paper)",
            backgroundImage: `repeating-linear-gradient(-45deg, rgba(0,0,0,0.055) 0px, rgba(0,0,0,0.055) 1px, transparent 1px, transparent 9px)`,
          }}
        />

        {/* Corner marks */}
        {[
          { t: 2, l: 4 },
          { t: 2, r: 4 },
          { b: 2, l: 4 },
          { b: 2, r: 4 },
        ].map((pos, i) => (
          <span
            key={i}
            aria-hidden
            style={{
              position: "absolute",
              ...(pos as any),
              zIndex: 2,
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "var(--ink-faint)",
              userSelect: "none",
            }}
          >
            +
          </span>
        ))}
        <div className="relative flex flex-col lg:flex-row gap-0 z-20 pointer-events-auto">
          {/* Main Article Prose */}
          <div className="flex-1 min-w-0 px-8 lg:pl-16 lg:pr-16 py-16 relative">
            {/* Top navigation / Share header */}
            <ShareButton slug={post.slug} title={post.title} />

            {/* Article Header */}
            <header className="mb-16">
              <div className="section-tag mb-6">[02_INTELLECTUAL_LOG / ESSAY]</div>

              <h1 className="font-serif text-[36px] md:text-[48px] font-normal tracking-[-0.02em] leading-[1.1] mb-8 text-ink">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 py-4 border-y border-dashed border-border-strong font-mono text-[11.5px] text-ink-muted">
                <div>
                  <span className="text-ink-faint uppercase mr-1.5">Date:</span>
                  {formatDate(post.pubDate)}
                </div>
                <span className="text-border-strong">·</span>
                <div>
                  <span className="text-ink-faint uppercase mr-1.5">Reading time:</span>~
                  {post.readingTime} min
                </div>
                <span className="text-border-strong">·</span>
                <div>
                  <span className="text-ink-faint uppercase mr-1.5">Author:</span>
                  {post.author}
                </div>
              </div>

              {/* Categories / Tags */}
              {post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {post.categories.map((cat) => {
                    const c = TAG_COLORS[cat] ?? defaultTagColor;
                    return (
                      <Link
                        key={cat}
                        href={`/blog?tag=${encodeURIComponent(cat)}`}
                        className="font-mono text-[10px] px-2.5 py-1 transition-all rounded hover:border-solid"
                        style={{
                          background: c.bg,
                          border: `1px dashed ${c.border}`,
                          color: c.text,
                        }}
                      >
                        #{cat}
                      </Link>
                    );
                  })}
                </div>
              )}
            </header>

            {/* Article Thumbnail if available */}
            {post.thumbnail && (
              <div className="mb-16 rounded-xl overflow-hidden border border-dashed border-border-strong shadow-sm">
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full max-h-[500px] object-cover"
                />
              </div>
            )}

            {/* Article Content */}
            <article
              className="blog-prose post-body pb-16 border-b border-dashed border-border-strong"
              dangerouslySetInnerHTML={{ __html: htmlWithIds }}
              suppressHydrationWarning
            />

            {/* Further Reading / Related Posts */}
            {otherPosts.length > 0 && (
              <section className="mt-16 pt-12 border-t border-dashed border-border-strong">
                <div className="font-mono text-[10px] text-ink-faint tracking-widest uppercase mb-6 font-bold">
                  [FURTHER_READING]
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {otherPosts.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/blog/${p.slug}`}
                      className="p-6 border border-dashed border-border-strong hover:border-solid hover:border-accent bg-[rgba(253,253,251,0.5)] transition-all flex flex-col justify-between group rounded-xl"
                    >
                      <div>
                        <div className="font-mono text-[9px] text-ink-faint mb-2">
                          {formatDate(p.pubDate)} · ~{p.readingTime} min
                        </div>
                        <h3 className="font-serif text-[17px] text-ink group-hover:text-accent transition-colors leading-snug">
                          {p.title}
                        </h3>
                      </div>
                      <div className="font-mono text-[10px] text-accent mt-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                        Read →
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}



            {/* Article Footer */}
            <footer className="pt-12 pb-8 flex flex-col sm:flex-row items-center justify-between gap-6 font-mono text-[11px] text-ink-muted">
              <Link
                href="/blog"
                className="px-4 py-2 border border-dashed border-border-strong hover:border-solid hover:border-accent hover:text-accent rounded-lg transition-all bg-[rgba(253,253,251,0.5)] flex items-center gap-2 group"
              >
                <span>← Return to all logs</span>
              </Link>

              <div className="flex items-center gap-3">
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-dashed border-border-strong hover:border-solid hover:border-accent hover:text-accent rounded-lg transition-all bg-[rgba(253,253,251,0.5)] flex items-center gap-2 group"
                >
                  <span>View on Medium ↗</span>
                </a>
                <a
                  href={`https://x.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://www.mendhu.tech/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-dashed border-border-strong hover:border-solid hover:border-accent hover:text-accent rounded-lg transition-all bg-[rgba(253,253,251,0.5)] flex items-center gap-2 group font-mono text-[11px]"
                >
                  <span>Post on</span>
                  <svg className="w-2.5 h-2.5 fill-current group-hover:fill-accent transition-colors" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>↗</span>
                </a>
              </div>


            </footer>
          </div>

          {/* Sticky Table of Contents Sidebar (Right) */}
          <aside className="hidden lg:block w-[240px] shrink-0 border-l border-dashed border-border-strong">
            <div className="sticky top-10 pt-8 px-6 pb-8 max-h-[calc(100vh-2.5rem)] overflow-hidden">
              <TableOfContents headings={headings} />
            </div>
          </aside>



        </div>
      </div>
    </main>
  );
}
