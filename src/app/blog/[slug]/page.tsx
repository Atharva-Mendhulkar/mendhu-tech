// app/blog/[slug]/page.tsx
import { getPost, getAllSlugs, formatDate, TAG_COLORS, defaultTagColor } from "@/lib/hashnode";
import PostBody from "@/components/blog/PostBody";
import TableOfContents from "@/components/blog/TableOfContents";
import SeriesNav from "@/components/blog/SeriesNav";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllSlugs();
    return slugs.map(slug => ({ slug }));
  } catch (err) {
    console.error("generateStaticParams failed:", err);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} — Atharva Mendhulkar`,
    description: post.seo?.description || post.brief,
    openGraph: {
      title: post.title,
      description: post.seo?.description || post.brief,
      url: `https://mendhu.tech/blog/${params.slug}`,
      images: post.coverImage ? [{ url: post.coverImage.url }] : [],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return (
    <main>
      <div className="max-w-[960px] mx-auto border-x border-dashed border-border-strong min-h-screen relative">
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
            backgroundColor: "var(--paper)",
            backgroundImage: `repeating-linear-gradient(-45deg,rgba(0,0,0,0.055) 0px,rgba(0,0,0,0.055) 1px,transparent 1px,transparent 9px)`,
          }}
        />

        {[{t:2,l:4},{t:2,r:4},{b:2,l:4},{b:2,r:4}].map((pos,i) => (
          <span key={i} aria-hidden style={{ position:"absolute", ...pos as any, zIndex:2, fontFamily:"var(--font-mono)", fontSize:9, color:"var(--ink-faint)", userSelect:"none" }}>+</span>
        ))}

        <div className="relative px-8 lg:px-12 py-16" style={{ zIndex: 1 }}>
          <Link href="/blog" className="font-mono text-[10px] text-ink-faint hover:text-accent transition-colors mb-12 block w-fit">
            ← all logs
          </Link>

          <article>
            <header className="mb-12 border-b border-dashed border-border-strong pb-8">
              <div className="flex items-center gap-3 mb-4 font-mono text-[10px] text-ink-faint">
                <span>{formatDate(post.publishedAt)}</span>
                <span>·</span>
                <span>{post.readTimeInMinutes} min read</span>
              </div>

              <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-normal tracking-[-0.02em] leading-[1.15] text-ink mb-6">
                {post.title}
              </h1>

              <div className="flex gap-2 flex-wrap">
                {post.tags.map(tag => {
                  const c = TAG_COLORS[tag.slug] ?? defaultTagColor;
                  return (
                    <span key={tag.slug} className="font-mono text-[9px] px-2.5 py-1"
                      style={{ background: c.bg, border: `1px dashed ${c.border}`, color: c.text, borderRadius: 2 }}>
                      {tag.name}
                    </span>
                  );
                })}
              </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-12">
              <div className="flex-1 min-w-0">
                <PostBody html={post.content?.html || ""} />
              </div>

              <aside className="w-full lg:w-[240px] shrink-0 space-y-8">
                <div className="sticky top-8 space-y-8">
                  <TableOfContents html={post.content?.html || ""} />
                  {post.series && (
                    <SeriesNav series={post.series} currentSlug={post.slug} />
                  )}
                </div>
              </aside>
            </div>
          </article>

          <footer className="pt-16 pb-8 border-t border-dashed border-border-strong mt-16">
            <div className="font-mono text-[10px] text-ink-faint flex items-center gap-3">
              <Link href="/blog" className="hover:text-accent transition-colors">← all posts</Link>
              <span>|</span>
              <span>mendhu.tech/blog</span>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
