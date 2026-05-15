import { getMediumPosts } from "@/lib/medium";
import HomeClient from "@/components/HomeClient";

// This is now a Server Component
export default async function Home() {
  // Fetch posts from Medium (cached via Next.js fetch)
  const { posts: allPosts } = await getMediumPosts();
  const initialPosts = allPosts.slice(0, 2);

  return <HomeClient initialPosts={initialPosts} />;
}