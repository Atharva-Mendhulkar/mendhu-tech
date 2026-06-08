"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Share2 } from 'lucide-react';

import { MediumPost } from '@/lib/medium';

interface BlogSectionProps {
  initialPosts?: MediumPost[];
}

export default function BlogSection({ initialPosts = [] }: BlogSectionProps) {
  const router = useRouter();
  const posts = initialPosts;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <section className="pt-8 pb-10 relative z-10">
      <div className="section-tag">[02_INTELLECTUAL_LOG]</div>
      <h2 className="sr-only">Latest Blogs by Atharva Mendhulkar</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
        {posts.length === 0 && (
          <div className="col-span-full border border-dashed border-border-strong p-8 bg-[rgba(253,253,251,0.72)] rounded-2xl text-center">
            <div className="font-mono text-[11px] text-ink-faint uppercase tracking-wider">No posts yet</div>
          </div>
        )}

        {posts.map((post) => (
          <Link 
            key={post.guid}
            href={`/blog/${post.slug}`}
            className="fade-in border border-dashed border-border-strong p-8 bg-[rgba(253,253,251,0.72)] hover:bg-[rgba(0,71,255,0.025)] hover:border-solid hover:border-accent transition-all duration-300 flex flex-col justify-between group cursor-pointer relative rounded-2xl overflow-hidden"
          >
            {/* Corner Marks */}
            <span className="absolute top-1 left-1 font-mono text-[8px] text-ink-faint opacity-30">+</span>
            <span className="absolute top-1 right-1 font-mono text-[8px] text-ink-faint opacity-30">+</span>
            
            <div className="relative z-10">
              <div className="font-mono text-[9.5px] text-ink-faint mb-2 tracking-wider uppercase flex justify-between items-center w-full">
                <span>latest draft · mendhu.tech</span>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const url = `${window.location.origin}/blog/${post.slug}`;
                    navigator.clipboard.writeText(url);
                    window.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "link copied to clipboard" } }));
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
                <span>{formatDate(post.pubDate)}</span>
                <span className="text-border-strong">·</span>
                <span>~{post.readingTime} min read</span>
              </div>


              
              <div className="font-mono text-[10px] text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                Read →
              </div>
            </div>
          </Link>
        ))}

      </div>
      <div className="mt-8 flex justify-center">
        <Link 
          href="/blog" 
          className="font-mono text-[11px] text-ink-muted hover:text-accent transition-colors border-b border-dashed border-border-strong hover:border-accent"
        >
          view all logs →
        </Link>
      </div>
    </section>
  );
}


