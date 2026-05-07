"use client";

import { useState } from 'react';
import { Share2 } from 'lucide-react';

interface BlogShareButtonProps {
  title: string;
  slug: string;
}

export default function BlogShareButton({ title, slug }: BlogShareButtonProps) {
  const handleShare = () => {
    const url = window.location.origin + '/blog/' + slug;
    navigator.clipboard.writeText(url);
    window.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "link copied to clipboard" } }));
  };

  return (
    <>
      <button 
        onClick={handleShare}
        className="font-mono text-[12px] text-ink-muted hover:text-accent transition-all flex items-center gap-2 px-4 py-2 border border-dashed border-border-strong hover:border-accent rounded-[2px] bg-paper"
        title="Copy share link"
      >
        <Share2 size={18} />
        <span className="uppercase tracking-widest font-bold">Share Post</span>
      </button>
    </>
  );
}
