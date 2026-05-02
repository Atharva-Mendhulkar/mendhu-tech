"use client";

import { useState, useEffect } from 'react';

interface ClapButtonProps {
  slug: string;
}

export default function ClapButton({ slug }: ClapButtonProps) {
  const [claps, setClaps] = useState(0);
  const [userClaps, setUserClaps] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Load claps from localStorage
    const savedClaps = localStorage.getItem(`claps-${slug}`);
    if (savedClaps) {
      setClaps(parseInt(savedClaps));
    }
    const savedUserClaps = localStorage.getItem(`user-claps-${slug}`);
    if (savedUserClaps) {
      setUserClaps(parseInt(savedUserClaps));
    }
  }, [slug]);

  const handleClap = () => {
    if (userClaps >= 50) return; // Limit claps per user

    const newClaps = claps + 1;
    const newUserClaps = userClaps + 1;

    setClaps(newClaps);
    setUserClaps(newUserClaps);
    setIsAnimating(true);

    localStorage.setItem(`claps-${slug}`, newClaps.toString());
    localStorage.setItem(`user-claps-${slug}`, newUserClaps.toString());

    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className="flex flex-col items-center gap-2 group">
      <button
        onClick={handleClap}
        className={`relative w-14 h-14 rounded-full border border-dashed border-border-strong flex items-center justify-center transition-all hover:border-accent group-active:scale-95 ${userClaps > 0 ? 'bg-accent/5 border-accent' : ''}`}
      >
        <span className={`text-2xl transition-transform ${isAnimating ? 'scale-125' : ''}`}>👏</span>
        
        {isAnimating && (
          <span className="absolute -top-8 font-mono text-[10px] text-accent animate-bounce">
            +{userClaps}
          </span>
        )}
      </button>
      <span className="font-mono text-[11px] text-ink-faint group-hover:text-ink transition-colors">
        {claps} claps
      </span>
    </div>
  );
}
