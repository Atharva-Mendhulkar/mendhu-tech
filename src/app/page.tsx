import { getLatestPosts } from "@/lib/hashnode";
import HomeClient from "@/components/HomeClient";

// This is now a Server Component
export default async function Home() {
  // Fetch posts on the server (cached via Next.js fetch)
  const initialPosts = await getLatestPosts();

  return <HomeClient initialPosts={initialPosts} />;
}