export const TAG_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "build-log":       { bg: "rgba(0, 71, 255, 0.03)", border: "rgba(0, 71, 255, 0.2)", text: "var(--accent)" },
  "deep-dive":       { bg: "rgba(100, 100, 100, 0.03)", border: "rgba(0, 0, 0, 0.15)", text: "var(--ink)" },
  "research":        { bg: "rgba(0, 128, 0, 0.03)", border: "rgba(0, 128, 0, 0.2)", text: "#006400" },
  "paper-companion": { bg: "rgba(128, 0, 128, 0.03)", border: "rgba(128, 0, 128, 0.2)", text: "#800080" },
  "notes":           { bg: "rgba(255, 165, 0, 0.03)", border: "rgba(255, 165, 0, 0.2)", text: "#cc8400" },
  "explained":       { bg: "rgba(0, 128, 128, 0.03)", border: "rgba(0, 128, 128, 0.2)", text: "#008080" },
  "featured":        { bg: "rgba(255, 215, 0, 0.1)", border: "rgba(255, 215, 0, 0.4)", text: "#b8860b" },
};

export const defaultTagColor = { bg: "rgba(0,0,0,0.02)", border: "rgba(0,0,0,0.1)", text: "var(--ink-muted)" };

export interface Post {
  title:             string;
  brief:             string;
  publishedAt:       string;
  updatedAt:         string;
  readTimeInMinutes: number;
  slug:              string;
  content?:          { html: string };
  tags:              { name: string; slug?: string }[];
  coverImage?:       { url: string };
  series?:           { name: string; slug: string } | null;
  seo?:              { title?: string; description?: string };
}

export async function getLatestPosts(): Promise<Post[]> {
  const query = `
    query {
      publication(host: "atharvarta.hashnode.dev") {
        posts(first: 10) {
          edges {
            node {
              title
              brief
              publishedAt
              tags { name slug }
              readTimeInMinutes
              slug
              coverImage { url }
            }
          }
        }
      }
    }
  `;
  try {
    const response = await fetch('https://gql.hashnode.com', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': '0cb3d74f-1448-421d-b181-962fd449b69e'
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 3600 }
    });
    const json = await response.json();
    const fetchedPosts = json.data?.publication?.posts?.edges?.map((e: any) => e.node) || [];
    const featured = fetchedPosts.filter((p: any) => 
      p.tags?.some((t: any) => t.name.toLowerCase() === 'featured')
    );
    return featured.length > 0 ? featured.slice(0, 2) : fetchedPosts.slice(0, 2);
  } catch (err) {
    return [];
  }
}

export async function getAllPosts(): Promise<Post[]> {
  const query = `
    query {
      publication(host: "atharvarta.hashnode.dev") {
        posts(first: 20) {
          edges {
            node {
              title
              brief
              publishedAt
              tags { name slug }
              readTimeInMinutes
              slug
              coverImage { url }
            }
          }
        }
      }
    }
  `;
  try {
    const response = await fetch('https://gql.hashnode.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': '0cb3d74f-1448-421d-b181-962fd449b69e' },
      body: JSON.stringify({ query }),
      next: { revalidate: 3600 }
    });
    const json = await response.json();
    return json.data?.publication?.posts?.edges?.map((e: any) => e.node) || [];
  } catch (err) {
    return [];
  }
}

export async function getPost(slug: string): Promise<Post | null> {
  const query = `
    query($slug: String!) {
      publication(host: "atharvarta.hashnode.dev") {
        post(slug: $slug) {
          title
          brief
          publishedAt
          updatedAt
          readTimeInMinutes
          slug
          content { html }
          tags { name slug }
          coverImage { url }
          series { name slug }
          seo { title description }
        }
      }
    }
  `;
  try {
    const response = await fetch('https://gql.hashnode.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': '0cb3d74f-1448-421d-b181-962fd449b69e' },
      body: JSON.stringify({ query, variables: { slug } }),
      next: { revalidate: 3600 }
    });
    const json = await response.json();
    return json.data?.publication?.post || null;
  } catch (err) {
    return null;
  }
}

export async function getAllSlugs(): Promise<string[]> {
  const query = `
    query {
      publication(host: "atharvarta.hashnode.dev") {
        posts(first: 100) {
          edges {
            node { slug }
          }
        }
      }
    }
  `;
  try {
    const response = await fetch('https://gql.hashnode.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const json = await response.json();
    return json.data?.publication?.posts?.edges?.map((e: any) => e.node.slug) || [];
  } catch (err) {
    return [];
  }
}

export async function getRelatedPosts(slug: string, tags: { name: string }[], count: number): Promise<Post[]> {
  const all = await getAllPosts();
  return all
    .filter(p => p.slug !== slug && p.tags.some(t => tags.some(tag => tag.name === t.name)))
    .slice(0, count);
}

export function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
