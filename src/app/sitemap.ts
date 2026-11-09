import { MetadataRoute } from 'next';
import { getMediumPosts } from '@/lib/medium';
import { projects } from '@/data/projects';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.mendhu.tech';

  // Fetch blogs dynamically for robust automated search indexing
  const { posts } = await getMediumPosts().catch(() => ({ posts: [] }));
  const blogUrls = posts.map((post) => ({
    url: post.link, // Use the direct Medium link
    lastModified: new Date(post.pubDate),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const projectUrls = projects.map((project) => ({
    url: `${baseUrl}/project/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...projectUrls,
    ...blogUrls,
  ];
}
