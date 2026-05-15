// lib/medium.ts
// Medium RSS integration for mendhu.tech.
// Uses the rss2json.com free tier (10k req/day) to convert Medium RSS → JSON.
// No API keys or env vars required.
import { cache } from "react";

export interface MediumPost {

  guid: string;
  slug: string;
  title: string;
  link: string;
  pubDate: string;           // ISO-ish string e.g. "2024-11-01 14:23:00"
  author: string;
  thumbnail: string | null;
  description: string;       // Truncated HTML preview (~1–2 paragraphs)
  content: string;           // Full HTML content from rss2json
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

export const MEDIUM_USERNAME = process.env.NEXT_PUBLIC_MEDIUM_USERNAME ?? "atharvarta"; // your @handle, no @

const RSS2JSON_API = "https://api.rss2json.com/v1/api.json";
const CACHE_REVALIDATE = 60; // Cache feed for 60 seconds


// ─── Utilities ─────────────────────────────────────────────────────────────

/**
 * Strip HTML tags and return plain text.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Extract the first genuine <img src="..."> from an HTML string, skipping tracking pixels.
 */
function extractFirstImage(html: string): string | null {
  const matches = Array.from(html.matchAll(/<img[^>]+src=["']([^"'>]+)["']/gi));
  for (const match of matches) {
    const url = match[1];
    if (url && !url.includes("medium.com/_/stat")) {
      return url;
    }
  }
  return null;
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

/**
 * Extract clean slug from Medium URL
 */
function extractSlug(link: string): string {
  try {
    const url = new URL(link);
    const parts = url.pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1] ?? "";
    return last.split('?')[0];
  } catch {
    return "";
  }
}

// ─── Tag Config & Colors ───────────────────────────────────────────────────

export const defaultTagColor = {
  bg: "rgba(0, 0, 0, 0.02)",
  border: "rgba(0, 0, 0, 0.15)",
  text: "var(--ink-muted)",
};

export const TAG_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "build-log": {
    bg: "rgba(0, 71, 255, 0.05)",
    border: "rgba(0, 71, 255, 0.3)",
    text: "var(--accent)",
  },
  "deep-dive": {
    bg: "rgba(138, 43, 226, 0.05)",
    border: "rgba(138, 43, 226, 0.3)",
    text: "#8A2BE2",
  },
  "research": {
    bg: "rgba(220, 20, 60, 0.05)",
    border: "rgba(220, 20, 60, 0.3)",
    text: "#DC143C",
  },
  "paper-companion": {
    bg: "rgba(46, 139, 87, 0.05)",
    border: "rgba(46, 139, 87, 0.3)",
    text: "#2E8B57",
  },
  "notes": {
    bg: "rgba(218, 165, 32, 0.05)",
    border: "rgba(218, 165, 32, 0.3)",
    text: "#B8860B",
  },
  "explained": {
    bg: "rgba(0, 139, 139, 0.05)",
    border: "rgba(0, 139, 139, 0.3)",
    text: "#008B8B",
  },
};

// ─── Heading ID Parser ─────────────────────────────────────────────────────

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#[0-9]+;/g, (match) => {
      const code = parseInt(match.slice(2, -1), 10);
      return !isNaN(code) ? String.fromCharCode(code) : match;
    });
}

/**
 * Add unique ID attributes to all h1-h6 elements in HTML string.
 */
export function addHeadingIds(html: string): { htmlWithIds: string; headings: { id: string; text: string; level: number }[] } {
  const headings: { id: string; text: string; level: number }[] = [];

  const htmlWithIds = html.replace(/<(h[1-6])([^>]*)>(.*?)<\/h[1-6]>/gi, (match, tag, attrs, content) => {
    let cleanText = content.replace(/<[^>]+>/g, "").trim();
    cleanText = decodeHtmlEntities(cleanText);
    if (!cleanText) return match;

    const idMatch = attrs.match(/id=["']([^"']+)["']/i);
    let id = idMatch ? idMatch[1] : cleanText.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    if (!id) id = `heading-${headings.length}`;

    const level = parseInt(tag[1], 10) || 2;
    headings.push({ id, text: cleanText, level });

    if (idMatch) {
      return match;
    } else {
      return `<${tag} id="${id}"${attrs}>${content}</${tag}>`;
    }
  });


  return { htmlWithIds, headings };
}



// ─── Main fetcher ──────────────────────────────────────────────────────────

let fallbackCache: MediumFeedResult | null = null;

/**
 * Fetch all posts from a Medium profile via the public RSS feed.
 * Cached by Next.js for CACHE_REVALIDATE seconds (ISR-friendly).
 */
export const getMediumPosts = cache(async (username = MEDIUM_USERNAME): Promise<MediumFeedResult> => {
  try {
    const rssUrl = `https://medium.com/feed/@${username}`;
    const apiUrl = `${RSS2JSON_API}?rss_url=${encodeURIComponent(rssUrl)}&_ts=${Math.floor(Date.now() / 60000)}`;

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

    const posts: MediumPost[] = (data.items ?? []).map((item: any) => {
      const cleanSlug = extractSlug(item.link);
      const rawCats = Array.isArray(item.categories) ? item.categories : [];

      const cleanThumb = item.thumbnail && !item.thumbnail.includes("medium.com/_/stat") ? item.thumbnail : null;

      return {
        guid:        item.guid ?? item.link,
        slug:        cleanSlug || "untitled",
        title:       item.title ?? "Untitled",
        link:        item.link,
        pubDate:     item.pubDate,
        author:      item.author ?? username,
        thumbnail:   cleanThumb || extractFirstImage(item.content ?? item.description ?? "") || null,
        description: item.description ?? "",
        content:     item.content ?? item.description ?? "",
        categories:  rawCats,
        readingTime: estimateReadingTime(item.content ?? item.description ?? ""),
      };
    });

    const meta: MediumFeedMeta = {
      title:       data.feed?.title ?? `${username} on Medium`,
      description: data.feed?.description ?? "",
      image:       data.feed?.image ?? "",
      link:        data.feed?.link ?? `https://medium.com/@${username}`,
    };

    const result = { meta, posts };
    fallbackCache = result;
    return result;
  } catch (err) {
    console.error("Failed to fetch Medium posts:", err);
    if (fallbackCache) {
      return fallbackCache;
    }
    return {
      meta: { title: `${username} on Medium`, description: "", image: "", link: `https://medium.com/@${username}` },
      posts: [],
    };
  }
});


/**
 * Convenience: fetch a single post by its Medium URL slug/guid.
 */
export async function getMediumPostBySlug(slug: string): Promise<MediumPost | null> {
  const { posts } = await getMediumPosts();
  return posts.find((p) => p.slug === slug || p.link.includes(slug)) ?? null;
}


