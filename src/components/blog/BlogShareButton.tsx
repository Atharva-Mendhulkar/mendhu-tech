"use client";

import { useState } from 'react';
import { Share2 } from 'lucide-react';

interface BlogShareButtonProps {
  title: string;
  slug: string;
}

export default function BlogShareButton({ title, slug }: BlogShareButtonProps) {
  const [showCopyToast, setShowCopyToast] = useState(false);

  const handleShare = () => {
    const url = window.location.origin + '/blog/' + slug;
    navigator.clipboard.writeText(url);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  };

  return (
    <>
      <button 
        onClick={handleShare}
        className="font-mono text-[10px] text-ink-faint hover:text-accent transition-colors flex items-center gap-1.5"
        title="Copy share link"
      >
        <Share2 size={11} />
        <span>Copy Link</span>
      </button>

      {/* Copy Toast */}
      {showCopyToast && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[10000] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex items-center gap-2.5 overflow-hidden">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-[11px] tracking-wider text-ink font-medium uppercase">link copied to clipboard</span>
          </div>
        </div>
      )}
    </>
  );
}
