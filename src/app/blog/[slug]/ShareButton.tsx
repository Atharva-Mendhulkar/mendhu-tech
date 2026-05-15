"use client";

import React from "react";
import { Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ShareButtonProps {
  slug: string;
  title: string;
}

export default function ShareButton({ slug, title }: ShareButtonProps) {
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}/blog/${slug}`;
    navigator.clipboard.writeText(url);
    window.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "link copied to clipboard" } }));
  };

  return (
    <div className="flex items-center justify-between mb-12 pb-6 border-b border-dashed border-border-strong font-mono text-[11px] text-ink-muted">
      <div className="flex items-center gap-4">
        <Link href="/blog" className="hover:text-accent transition-colors flex items-center gap-1.5 group">
          <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
          <span>all logs</span>
        </Link>
        <span>/</span>
        <Link href="/" className="hover:text-accent transition-colors">
          mendhu.tech
        </Link>
      </div>

      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-3 py-1.5 border border-dashed border-border-strong hover:border-solid hover:border-accent hover:text-accent rounded transition-all bg-[rgba(253,253,251,0.5)] cursor-pointer"
        title="Copy article link"
      >
        <Share2 size={12} />
        <span>share</span>
      </button>
    </div>
  );
}
