// lib/medium.ts
// Drop-in replacement for your Hashnode integration.
// Uses the rss2json.com free tier (10k req/day) to convert Medium RSS → JSON.
// No API keys or env vars required.

export interface MediumPost {
  guid: string;
  title: string;
  link: string;
  pubDate: string;           // ISO-ish string e.g. "2024-11-01 14:23:00"
  author: string;
  thumbnail: string | null;
  description: string;       // Truncated HTML preview (~1–2 paragraphs)
  categories: string[];
  readingTime: number;       // Estimated minutes, computed client-side
}

export interface MediumFeedMeta {
  title: string;
  description: string;
  image: string;
  link: string;
}

export interface MediumFeedResult {
  meta: MediumFeedMeta;
  posts: MediumPost[];
}

// ─── Config ────────────────────────────────────────────────────────────────

const MEDIUM_USERNAME = process.env.NEXT_PUBLIC_MEDIUM_USERNAME ?? "mendhu"; // your @handle, no @
const RSS2JSON_API    = "https://api.rss2json.com/v1/api.json";
const CACHE_REVALIDATE = 3600; // seconds — 1 hour

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Strip HTML tags and return plain text.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Extract the first <img src="..."> from an HTML string.
 */
function extractFirstImage(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"'>]+)["']/i);
  return match ? match[1] : null;
}

/**
 * Rough reading-time estimate: 200 wpm average.
 */
function estimateReadingTime(html: string): number {
  const words = stripHtml(html).split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Produce a plain-text excerpt ≤ maxLen characters.
 */
export function getExcerpt(html: string, maxLen = 160): string {
  const plain = stripHtml(html);
  if (plain.length <= maxLen) return plain;
  return plain.slice(0, maxLen).replace(/\s\S*$/, "") + "…";
}

/**
 * Format pubDate ("2024-11-01 14:23:00") into a human-readable string.
 */
export function formatDate(pubDate: string): string {
  const d = new Date(pubDate);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Main fetcher ──────────────────────────────────────────────────────────

/**
 * Fetch all posts from a Medium profile via the public RSS feed.
 * Cached by Next.js for CACHE_REVALIDATE seconds (ISR-friendly).
 */
export async function getMediumPosts(username = MEDIUM_USERNAME): Promise<MediumFeedResult> {
  const rssUrl = `https://medium.com/feed/@${username}`;
  const apiUrl = `${RSS2JSON_API}?rss_url=${encodeURIComponent(rssUrl)}&count=20`;

  const res = await fetch(apiUrl, {
    next: { revalidate: CACHE_REVALIDATE },
  });

  if (!res.ok) {
    throw new Error(`Medium RSS fetch failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (data.status !== "ok") {
    throw new Error(`rss2json error: ${data.message ?? "unknown"}`);
  }

  const posts: MediumPost[] = (data.items ?? []).map((item: any) => ({
    guid:        item.guid ?? item.link,
    title:       item.title ?? "Untitled",
    link:        item.link,
    pubDate:     item.pubDate,
    author:      item.author ?? username,
    thumbnail:   item.thumbnail || extractFirstImage(item.description ?? "") || null,
    description: item.description ?? "",
    categories:  Array.isArray(item.categories) ? item.categories : [],
    readingTime: estimateReadingTime(item.description ?? ""),
  }));

  const meta: MediumFeedMeta = {
    title:       data.feed?.title ?? `${username} on Medium`,
    description: data.feed?.description ?? "",
    image:       data.feed?.image ?? "",
    link:        data.feed?.link ?? `https://medium.com/@${username}`,
  };

  return { meta, posts };
}

/**
 * Convenience: fetch a single post by its Medium URL slug/guid.
 * Medium RSS doesn't expose full bodies, so we match on the URL.
 */
export async function getMediumPostBySlug(slug: string): Promise<MediumPost | null> {
  const { posts } = await getMediumPosts();
  return posts.find((p) => p.link.includes(slug)) ?? null;
}
