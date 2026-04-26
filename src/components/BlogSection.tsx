"use client";

import React, { useEffect, useState } from 'react';

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
            url
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
  url: string;
}

export default function BlogSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
        setPosts(fetchedPosts);
      } catch (err) {
        console.error('Error fetching Hashnode posts:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <section className="py-10 border-b border-dashed border-border-strong relative z-10">
        <div className="section-tag">[02_INTELLECTUAL_LOG]</div>
        <div className="flex flex-col gap-4">
          {[1, 2].map(i => (
            <div key={i} className="border border-dashed border-border-strong p-8 bg-[rgba(253,253,251,0.72)] animate-pulse h-32" />
          ))}
        </div>
      </section>
    );
  }

  // Fallback if no posts or error
  const displayPosts = (posts.length > 0 && !error) ? posts : [
    {
      title: "Physics-Informed Neural Networks for Urban Air Quality Modeling",
      brief: "Exploring the intersection of fluid dynamics and deep learning...",
      publishedAt: new Date().toISOString(),
      tags: [{ name: 'PM2.5' }, { name: 'PDE' }, { name: 'ML' }],
      readTimeInMinutes: 12,
      url: "https://blog.mendhu.tech"
    },
    {
      title: "Architecting AVARA: Runtime Security for Autonomous AI Agents",
      brief: "Developing a governance layer for machine-speed agent ecosystems...",
      publishedAt: new Date().toISOString(),
      tags: [{ name: 'Security' }, { name: 'AI' }],
      readTimeInMinutes: 8,
      url: "https://blog.mendhu.tech"
    }
  ];

  return (
    <section className="py-10 border-b border-dashed border-border-strong relative z-10">
      <div className="section-tag">[02_INTELLECTUAL_LOG]</div>
      
      <div className="flex flex-col gap-10">
        {displayPosts.map((post, i) => (
          <a 
            key={i}
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="fade-in border border-dashed border-border-strong p-8 bg-[rgba(253,253,251,0.72)] hover:bg-[rgba(0,71,255,0.025)] hover:border-solid hover:border-accent transition-all duration-300 flex justify-between items-start group cursor-pointer relative"
          >
            {/* Corner Marks */}
            <span className="absolute top-1 left-1 font-mono text-[8px] text-ink-faint">+</span>
            <span className="absolute top-1 right-1 font-mono text-[8px] text-ink-faint">+</span>
            
            <div className="flex-1">
              <div className="font-mono text-[9.5px] text-ink-faint mb-2 tracking-wider uppercase">
                latest draft · blog.mendhu.tech
              </div>
              <div className="font-serif text-[18px] text-ink font-medium mb-2 group-hover:text-accent transition-colors italic">
                {post.title}
              </div>
              <div className="font-mono text-[9.5px] text-ink-muted flex items-center gap-2">
                {formatDate(post.publishedAt)} 
                <span className="text-border-strong">·</span> 
                {post.tags.slice(0, 3).map(t => t.name).join(', ')} 
                <span className="text-border-strong">·</span> 
                ~{post.readTimeInMinutes} min read
              </div>
            </div>
            
            <div className="font-mono text-[10px] text-accent pt-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
              Read draft →
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
