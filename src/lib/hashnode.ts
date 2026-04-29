// lib/hashnode.ts
// Typed GraphQL client for Hashnode API → mendhu.tech/blog

const ENDPOINT = "https://gql.hashnode.com";
const HOST     = "atharvarta.hashnode.dev";

// ── Core fetcher — ISR revalidates every hour ──────────────────────────────
async function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method:  "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": "0cb3d74f-1448-421d-b181-962fd449b69e"
    },
    body:    JSON.stringify({ query, variables }),
    next:    { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Hashnode API HTTP error: ${res.status}`);
  }
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`Hashnode GraphQL error: ${json.errors[0].message}`);
  }
  if (!json.data) {
    throw new Error("Hashnode returned no data");
  }
  return json.data as T;
}

// ── Types ──────────────────────────────────────────────────────────────────
export interface Tag   { name: string; slug?: string }
export interface Series {
  name:  string;
  slug:  string;
  posts: { edges: { node: Pick<Post, "title" | "slug"> }[] };
}

export interface Post {
  title:              string;
  slug:               string;
  brief:              string;
  publishedAt:        string;
  updatedAt:          string;
  readTimeInMinutes:  number;
  tags:               Tag[];
  coverImage:         { url: string } | null;
  series:             Omit<Series, "posts"> | null;
  content?:           { html: string; markdown: string };
  seo?:               { title: string; description: string };
}

export interface PostWithSeries extends Post {
  series: Series | null;
}

// ── Shared fragments ───────────────────────────────────────────────────────
const POST_CARD_FIELDS = `
  title slug brief publishedAt updatedAt
  readTimeInMinutes
  tags { name }
  coverImage { url }
  series { name slug }
`;

// ── Queries ────────────────────────────────────────────────────────────────

/** All posts — for index page + generateStaticParams */
export async function getAllPosts(): Promise<Post[]> {
  const data = await gql<{
    publication: {
      posts: { edges: { node: Post }[] }
    } | null
  }>(`
    query {
      publication(host: "${HOST}") {
        posts(first: 50) {
          edges { node { ${POST_CARD_FIELDS} } }
        }
      }
    }
  `);
  const remotePosts = data?.publication?.posts?.edges?.map(e => e.node) || [];
  return remotePosts;
}

/** Single post by slug — for individual post pages */
export async function getPost(slug: string): Promise<PostWithSeries | null> {
  try {
    const data = await gql<{ publication: { post: PostWithSeries | null } | null }>(`
      query GetPost($slug: String!) {
        publication(host: "${HOST}") {
          post(slug: $slug) {
            ${POST_CARD_FIELDS}
            series {
              name slug
              posts(first: 20) {
                edges { node { title slug } }
              }
            }
            content { html markdown }
            seo { title description }
          }
        }
      }
    `, { slug });
    return data?.publication?.post ?? null;
  } catch (err) {
    console.error(`getPost error for slug ${slug}:`, err);
    return null;
  }
}

/** Posts by tag slug — for tag filter on index */
export async function getPostsByTag(tagSlug: string): Promise<Post[]> {
  const all = await getAllPosts();
  return all.filter(p => p.tags.some(t => t.slug === tagSlug));
}

/** Latest post — for Intellectual Log marquee on portfolio */
export async function getLatestPosts(count = 3): Promise<Post[]> {
  const all = await getAllPosts();
  return all.slice(0, count);
}

/** All slugs — for generateStaticParams */
export async function getAllSlugs(): Promise<string[]> {
  const posts = await getAllPosts();
  return posts.map(p => p.slug);
}

/** Related posts — same tag, excluding current */
export async function getRelatedPosts(currentSlug: string, tags: Tag[], count = 2): Promise<Post[]> {
  const all  = await getAllPosts();
  const tagSlugs = new Set(tags.map(t => t.slug));
  return all
    .filter(p => p.slug !== currentSlug && p.tags.some(t => tagSlugs.has(t.slug)))
    .slice(0, count);
}

/** Format date for display */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year:  "numeric",
    month: "long",
    day:   "numeric",
  });
}

/** Tag → display colour mapping (matches portfolio palette) */
export const TAG_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  research:       { bg: "#E6F1FB", border: "#B5D4F4", text: "#185FA5" },
  "build-log":    { bg: "#E1F5EE", border: "#9FE1CB", text: "#085041" },
  explained:      { bg: "#FAEEDA", border: "#FAC775", text: "#633806" },
  "paper-companion": { bg: "#EEEDFE", border: "#CECBF6", text: "#3C3489" },
};
export const defaultTagColor = { bg: "#F1EFE8", border: "#D0CEC4", text: "#555550" };
