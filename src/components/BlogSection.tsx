"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const HASHNODE_QUERY = `
  query {
    publication(host: "blog.mendhu.tech") {
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

const FALLBACK_POSTS: Post[] = [
  {
    title: "Physics-Informed Neural Networks for Urban Air Quality Modeling",
    brief: "Exploring the intersection of fluid dynamics and deep learning...",
    publishedAt: new Date().toISOString(),
    tags: [{ name: 'PM2.5' }, { name: 'PDE' }, { name: 'ML' }],
    readTimeInMinutes: 12,
    slug: "physics-informed-neural-networks-urban-air-quality"
  },
  {
    title: "Architecting AVARA: Runtime Security for Autonomous AI Agents",
    brief: "Developing a governance layer for machine-speed agent ecosystems...",
    publishedAt: new Date().toISOString(),
    tags: [{ name: 'Security' }, { name: 'AI' }],
    readTimeInMinutes: 8,
    slug: "architecting-avara-runtime-security"
  }
];

export default function BlogSection() {
  const [posts, setPosts] = useState<Post[]>(FALLBACK_POSTS);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('https://gql.hashnode.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: HASHNODE_QUERY }),
        });
        const json = await response.json();
        const fetchedPosts = json.data?.publication?.posts?.edges?.map((e: any) => e.node) || [];
        if (fetchedPosts.length > 0) {
          setPosts(fetchedPosts);
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
        {posts.map((post, i) => (
          <Link 
            key={i}
            href={`/blog/${post.slug}`}
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
    </section>
  );
}
