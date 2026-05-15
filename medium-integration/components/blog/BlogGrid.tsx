// components/blog/BlogGrid.tsx
// Renders the full grid of Medium posts. Works as a pure client component
// so it can handle filtering by category without a round-trip.

"use client";

import { useState, useMemo } from "react";
import { MediumPost } from "@/lib/medium";
import BlogCard from "./BlogCard";

interface BlogGridProps {
  posts: MediumPost[];
}

export default function BlogGrid({ posts }: BlogGridProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Collect unique tags across all posts
  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.categories.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [posts]);

  const filtered = activeTag
    ? posts.filter((p) => p.categories.includes(activeTag))
    : posts;

  return (
    <div className="blog-grid-wrapper">
      {/* Tag filter bar */}
      {allTags.length > 0 && (
        <div className="blog-tags-bar" role="list" aria-label="Filter by topic">
          <button
            role="listitem"
            className={`blog-tag-pill ${activeTag === null ? "blog-tag-pill--active" : ""}`}
            onClick={() => setActiveTag(null)}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              role="listitem"
              className={`blog-tag-pill ${activeTag === tag ? "blog-tag-pill--active" : ""}`}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="blog-empty">No posts found for &ldquo;{activeTag}&rdquo;.</p>
      ) : (
        <div className="blog-grid">
          {filtered.map((post, i) => (
            <BlogCard key={post.guid} post={post} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
