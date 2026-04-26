"use client";

import React from 'react';
import { X, Maximize2 } from 'lucide-react';

interface MinimizedPillProps {
  item: { id: string; title: string; type: 'garden' | 'project' };
  onRestore: () => void;
  onClose: () => void;
}

export default function MinimizedPill({ item, onRestore, onClose }: MinimizedPillProps) {
  return (
    <div 
      onClick={onRestore}
      className="group flex items-center gap-4 bg-paper border border-dashed border-accent/40 p-2 pl-5 pr-5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.08)] animate-pill-in hover:scale-105 hover:border-accent hover:bg-accent-light transition-all cursor-pointer"
    >
      <div className="flex flex-col">
        <span className="font-mono text-[8px] text-accent/60 uppercase tracking-[0.2em] leading-none mb-1 group-hover:text-accent transition-colors">
          {item.type === 'garden' ? 'RESTORE_ARCHIVE' : 'RESTORE_PROJECT'}
        </span>
        <span className="font-serif text-[14px] text-ink italic font-medium leading-none truncate max-w-[150px]">
          {item.title}
        </span>
      </div>

      <div className="flex items-center gap-2 pl-3 border-l border-dashed border-accent/20">
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="p-1.5 hover:bg-red-50 rounded-full text-ink-faint hover:text-red-500 transition-all group/close"
          title="Dismiss"
        >
          <X size={12} className="group-hover/close:rotate-90 transition-transform" />
        </button>
      </div>
    </div>
  );
}
