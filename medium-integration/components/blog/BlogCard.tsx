// components/blog/BlogCard.tsx
// Matches mendhu.tech aesthetic: EB Garamond, dark research feel, JetBrains Mono accents.

import Link from "next/link";
import Image from "next/image";
import { MediumPost, getExcerpt, formatDate } from "@/lib/medium";

interface BlogCardProps {
  post: MediumPost;
  index?: number;
}

export default function BlogCard({ post, index = 0 }: BlogCardProps) {
  const excerpt = getExcerpt(post.description, 150);
  const date    = formatDate(post.pubDate);

  return (
    <Link
      href={post.link}
      target="_blank"
      rel="noopener noreferrer"
      className="blog-card group"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Thumbnail */}
      {post.thumbnail && (
        <div className="blog-card__thumb">
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            className="blog-card__img"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          <div className="blog-card__thumb-overlay" />
        </div>
      )}

      <div className="blog-card__body">
        {/* Tags */}
        {post.categories.length > 0 && (
          <div className="blog-card__tags">
            {post.categories.slice(0, 3).map((cat) => (
              <span key={cat} className="blog-card__tag">
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h2 className="blog-card__title">{post.title}</h2>

        {/* Excerpt */}
        <p className="blog-card__excerpt">{excerpt}</p>

        {/* Meta row */}
        <div className="blog-card__meta">
          <span className="blog-card__date">{date}</span>
          <span className="blog-card__dot" aria-hidden>·</span>
          <span className="blog-card__reading-time">
            {post.readingTime} min read
          </span>
          <span className="blog-card__arrow" aria-hidden>
            ↗
          </span>
        </div>
      </div>
    </Link>
  );
}
