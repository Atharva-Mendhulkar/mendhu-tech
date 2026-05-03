"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Share2 } from 'lucide-react';

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

import { Post } from '@/lib/hashnode';

interface BlogSectionProps {
  initialPosts?: Post[];
}

export default function BlogSection({ initialPosts = [] }: BlogSectionProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [showCopyToast, setShowCopyToast] = useState(false);

  useEffect(() => {
    // Only fetch if we don't have initial posts to speed up first load
    if (posts.length === 0) {
      async function fetchPosts() {
        try {
          const response = await fetch('https://gql.hashnode.com', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': '0cb3d74f-1448-421d-b181-962fd449b69e'
            },
            body: JSON.stringify({ 
              query: `
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
              ` 
            }),
          });
          const json = await response.json();
          const fetchedPosts = json.data?.publication?.posts?.edges?.map((e: any) => e.node) || [];
          
          const featured = fetchedPosts.filter((p: any) => 
            p.tags?.some((t: any) => t.name.toLowerCase() === 'featured')
          );

          if (featured.length > 0) {
            setPosts(featured.slice(0, 2));
          } else {
            setPosts(fetchedPosts.slice(0, 2));
          }
        } catch (err) {
          console.error('Error fetching Hashnode posts:', err);
        }
      }
      fetchPosts();
    }
  }, [posts.length]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <section className="pt-8 pb-10 border-b border-dashed border-border-strong relative z-10">
      <div className="section-tag">[02_INTELLECTUAL_LOG]</div>
      <h2 className="sr-only">Latest Blogs by Atharva Mendhulkar</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
        {posts.map((post) => (
          <Link 
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="fade-in border border-dashed border-border-strong p-8 bg-[rgba(253,253,251,0.72)] hover:bg-[rgba(0,71,255,0.025)] hover:border-solid hover:border-accent transition-all duration-300 flex flex-col justify-between group cursor-pointer relative rounded-2xl overflow-hidden"
          >
            {/* Corner Marks */}
            <span className="absolute top-1 left-1 font-mono text-[8px] text-ink-faint opacity-30">+</span>
            <span className="absolute top-1 right-1 font-mono text-[8px] text-ink-faint opacity-30">+</span>
            
            <div className="relative z-10">
              <div className="font-mono text-[9.5px] text-ink-faint mb-2 tracking-wider uppercase flex justify-between items-center w-full">
                <span>latest draft · mendhu.tech/blog</span>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const url = window.location.origin + '/blog/' + post.slug;
                    navigator.clipboard.writeText(url);
                    setShowCopyToast(true);
                    setTimeout(() => setShowCopyToast(false), 2000);
                  }}
                  className="p-1.5 rounded-full hover:bg-accent/10 text-ink-faint hover:text-accent transition-all relative z-20 group/share"
                  title="Copy share link"
                >
                  <Share2 size={11} />
                </button>
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



      {/* Copy Toast */}
      {showCopyToast && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[10000] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex items-center gap-2.5 overflow-hidden">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-[11px] tracking-wider text-ink font-medium uppercase">link copied to clipboard</span>
          </div>
        </div>
      )}
    </section>
  );
}
