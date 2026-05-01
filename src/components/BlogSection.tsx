"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const HASHNODE_QUERY = `
  query {
    publication(host: "atharvarta.hashnode.dev") {
      posts(first: 2) {
        edges {
          node {
            title
            brief
            publishedAt
            tags { name }
            readTimeInMinutes
            slug
          }
        }
      }
    }
  }
`;

interface Post {
  title: string;
  brief: string;
  publishedAt: string;
  tags: { name: string }[];
  readTimeInMinutes: number;
  slug: string;
}

export default function BlogSection() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('https://gql.hashnode.com', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': '0cb3d74f-1448-421d-b181-962fd449b69e'
          },
          body: JSON.stringify({ query: HASHNODE_QUERY }),
        });
        const json = await response.json();
        const fetchedPosts = json.data?.publication?.posts?.edges?.map((e: any) => e.node) || [];
        
        // Filter for featured tags specifically
        const featured = fetchedPosts.filter((p: any) => 
          p.tags?.some((t: any) => t.name.toLowerCase() === 'featured')
        );

        if (featured.length > 0) {
          setPosts(featured.slice(0, 2));
        } else if (fetchedPosts.length > 0) {
          setPosts(fetchedPosts.slice(0, 2)); // newest 2 additions
        }
      } catch (err) {
        console.error('Error fetching Hashnode posts:', err);
      }
    }
    fetchPosts();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <section className="py-10 border-b border-dashed border-border-strong relative z-10">
      <div className="section-tag">[02_INTELLECTUAL_LOG]</div>
      <h2 className="sr-only">Latest Blogs by Atharva Mendhulkar</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
        {posts.map((post) => (
          <Link 
            key={post.slug}
            href={`/blog/${post.slug}`}
            onClick={(e) => {
              e.preventDefault();
              setIsNavigating(true);
              setTimeout(() => router.push(`/blog/${post.slug}`), 500);
            }}
            className="fade-in border border-dashed border-border-strong p-8 bg-[rgba(253,253,251,0.72)] hover:bg-[rgba(0,71,255,0.025)] hover:border-solid hover:border-accent transition-all duration-300 flex flex-col justify-between group cursor-pointer relative rounded-2xl overflow-hidden"
          >
            {/* Corner Marks */}
            <span className="absolute top-1 left-1 font-mono text-[8px] text-ink-faint opacity-30">+</span>
            <span className="absolute top-1 right-1 font-mono text-[8px] text-ink-faint opacity-30">+</span>
            
            <div className="relative z-10">
              <div className="font-mono text-[9.5px] text-ink-faint mb-2 tracking-wider uppercase">
                latest draft · mendhu.tech/blog
              </div>
              <div className="font-serif text-[18px] text-ink font-medium mb-4 group-hover:text-accent transition-colors italic leading-snug">
                {post.title}
              </div>
            </div>

            <div className="flex justify-between items-end mt-auto">
              <div className="font-mono text-[9.5px] text-ink-muted flex flex-wrap items-center gap-2">
                {formatDate(post.publishedAt)} 
                <span className="text-border-strong">·</span> 
                {post.tags.slice(0, 2).map(t => t.name).join(', ')} 
                <span className="text-border-strong">·</span> 
                ~{post.readTimeInMinutes} min
              </div>
              
              <div className="font-mono text-[10px] text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                Read →
              </div>
            </div>
          </Link>
        ))}
      </div>

      {isNavigating && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center"
          style={{
            backgroundColor: "var(--paper)",
            animation: "fadeInBlog 0.6s ease-in-out forwards",
          }}
        >
          <div className="font-serif text-[24px] italic text-accent animate-pulse">Entering Intellectual Log...</div>
          <style>{`
            @keyframes fadeInBlog {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </section>
  );
}
