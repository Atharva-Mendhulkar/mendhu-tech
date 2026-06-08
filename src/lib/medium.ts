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
    const rollingCacheBuster = Math.floor(Date.now() / 10000);
    const rssUrl = `https://medium.com/feed/@${username}?cb=${rollingCacheBuster}`;

    const res = await fetch(rssUrl, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Medium raw RSS fetch failed: ${res.status} ${res.statusText}`);
    }

    const xml = await res.text();

    // Extract channel title
    const channelTitleMatch = xml.match(/<channel>[\s\S]*?<title><\!\[CDATA\[([\s\S]*?)\]\]><\/title>/);
    const feedTitle = channelTitleMatch ? channelTitleMatch[1] : `${username} on Medium`;

    // Split items
    const itemMatches = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g));

    const posts: MediumPost[] = itemMatches.map((match) => {
      const itemXml = match[1];

      // Extract title
      const titleMatch = itemXml.match(/<title><\!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || itemXml.match(/<title>([\s\S]*?)<\/title>/);
      const title = titleMatch ? titleMatch[1].trim() : "Untitled";

      // Extract link
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
      const link = linkMatch ? linkMatch[1].trim() : "";

      // Extract guid
      const guidMatch = itemXml.match(/<guid[^>]*>([\s\S]*?)<\/guid>/);
      const guid = guidMatch ? guidMatch[1].trim() : link;

      // Extract pubDate
      const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const pubDate = pubDateMatch ? pubDateMatch[1].trim() : "";

      // Extract creator / author
      const authorMatch = itemXml.match(/<dc:creator><\!\[CDATA\[([\s\S]*?)\]\]><\/dc:creator>/) || itemXml.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/);
      const author = authorMatch ? authorMatch[1].trim() : username;

      // Extract content
      const contentMatch = itemXml.match(/<content:encoded><\!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/) || itemXml.match(/<description><\!\[CDATA\[([\s\S]*?)\]\]><\/description>/);
      const content = contentMatch ? contentMatch[1].trim() : "";

      // Extract categories
      const categoryMatches = Array.from(itemXml.matchAll(/<category><\!\[CDATA\[([\s\S]*?)\]\]><\/category>/g));
      const categories = categoryMatches.map((c) => c[1].trim());

      // Extract thumbnail
      const cleanThumb = extractFirstImage(content);

      // Create description preview
      const description = getExcerpt(content, 200);

      return {
        guid,
        slug: extractSlug(link) || "untitled",
        title,
        link,
        pubDate,
        author,
        thumbnail: cleanThumb,
        description,
        content,
        categories,
        readingTime: estimateReadingTime(content),
      };
    });

    const meta: MediumFeedMeta = {
      title: feedTitle,
      description: "",
      image: "",
      link: `https://medium.com/@${username}`,
    };

    const result = { meta, posts };
    fallbackCache = result;
    return result;
  } catch (err) {
    console.error("Failed to fetch Medium posts directly:", err);
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


