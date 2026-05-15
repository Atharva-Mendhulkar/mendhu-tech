import { getMediumPosts, getExcerpt } from "@/lib/medium";

export async function GET() {
  const { posts } = await getMediumPosts().catch(() => ({ posts: [] }));

  const site_url = "https://www.mendhu.tech";

  const feedItems = posts.map((post) => {
    return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${post.link}</link>
      <guid>${post.guid}</guid>
      <pubDate>${new Date(post.pubDate).toUTCString()}</pubDate>
      <description><![CDATA[${getExcerpt(post.description)}]]></description>
      <author>${post.author}</author>
    </item>`;
  }).join('');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>Atharva Mendhulkar Blogs</title>
      <link>${site_url}/blog</link>
      <description>Technical articles, systems engineering, and AI by Atharva Mendhulkar.</description>
      <language>en</language>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      ${feedItems}
    </channel>
  </rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "text/xml",
      "Cache-Control": "s-maxage=86400, stale-while-revalidate",
    },
  });
}
