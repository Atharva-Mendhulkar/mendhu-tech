// app/blog/page.tsx
// Server component — data fetched at request time (ISR via revalidate in lib/medium.ts).
// Renders the blog listing page for mendhu.tech.

import { Metadata } from "next";
import { getMediumPosts } from "@/lib/medium";
import BlogGrid from "@/components/blog/BlogGrid";

export const metadata: Metadata = {
  title: "Blog — mendhu.tech",
  description:
    "Deep dives into kernel-level monitoring, ML research, and systems engineering by Atharva Mendhulkar.",
  openGraph: {
    title: "Blog — mendhu.tech",
    description:
      "Deep dives into kernel-level monitoring, ML research, and systems engineering.",
    url: "https://mendhu.tech/blog",
  },
};

export default async function BlogPage() {
  let posts = [];
  let error: string | null = null;

  try {
    const { posts: fetched } = await getMediumPosts();
    posts = fetched;
  } catch (err) {
    console.error("Failed to fetch Medium posts:", err);
    error = "Could not load posts right now. Try again shortly.";
  }

  return (
    <main className="blog-page">
      {/* Page header */}
      <header className="blog-header">
        <div className="blog-header__eyebrow">
          <span className="blog-header__line" aria-hidden />
          <span className="blog-header__label">Writing</span>
        </div>
        <h1 className="blog-header__title">Field Notes</h1>
        <p className="blog-header__sub">
          Long-form research on systems, kernel internals, and machine learning.
          Published on{" "}
          <a
            href="https://medium.com/@mendhu"
            target="_blank"
            rel="noopener noreferrer"
            className="blog-header__medium-link"
          >
            Medium ↗
          </a>
        </p>
      </header>

      {/* Content */}
      {error ? (
        <div className="blog-error" role="alert">
          <span className="blog-error__icon">⚠</span>
          <p>{error}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="blog-empty-state">
          <p>No posts published yet. Check back soon.</p>
        </div>
      ) : (
        <BlogGrid posts={posts} />
      )}
    </main>
  );
}
